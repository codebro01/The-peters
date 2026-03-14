import { Request, Response } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Consultation from "../models/Consultation";
import { createConsultationMeeting } from "../services/calendar.service";
import { sendConsultationConfirmation } from "../services/email.service";

// Assume consultation cost is fixed or passed. We'll set a fixed cost for now (e.g., 50000 NGN).
const CONSULTATION_FEE = 50000;

// @desc    Initialize consultation booking with Paystack
// @route   POST /api/consultations/book
// @access  Public
export const initializeConsultation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, topic, scheduledDate, durationMins } = req.body;

    if (!name || !email || !topic || !scheduledDate) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const reference = `CS-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Initialize with Paystack
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: CONSULTATION_FEE * 100, // kobo
        reference,
        currency: "NGN",
        metadata: {
          type: "consultation",
          name,
          topic,
          scheduledDate,
        },
        callback_url: `${process.env.CLIENT_URL}/consultation-verify/${reference}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Save pending consultation
    await Consultation.create({
      name,
      email,
      topic,
      scheduledDate,
      durationMins: durationMins || 30,
      paymentStatus: "pending",
      paymentReference: reference,
      amountPaid: 0,
    });

    res.status(200).json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.data.authorization_url,
        access_code: paystackResponse.data.data.access_code,
        reference,
      },
      message: "Consultation payment initialized successfully",
    });
  } catch (error: any) {
    console.error("Consultation initialization error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to initialize consultation payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// @desc    Verify consultation payment and finalize booking
// @route   GET /api/consultations/verify/:reference
// @access  Public
export const verifyConsultation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = paystackResponse.data.data;

    if (paymentData.status === "success") {
      const consultation = await Consultation.findOne({ paymentReference: reference });

      if (!consultation) {
        res.status(404).json({ success: false, message: "Consultation not found" });
        return;
      }

      // If already processed, return success
      if (consultation.paymentStatus === "completed") {
        res.status(200).json({
          success: true,
          data: consultation,
          message: "Payment already verified",
        });
        return;
      }

      // Update payment status
      consultation.paymentStatus = "completed";
      consultation.amountPaid = paymentData.amount / 100;

      // Generate Google Meet Link
      const startTime = new Date(consultation.scheduledDate);
      const endTime = new Date(startTime.getTime() + consultation.durationMins * 60000);

      try {
        const meetingData = await createConsultationMeeting(
          startTime,
          endTime,
          consultation.email,
          consultation.topic
        );

        consultation.meetingLink = meetingData.meetingLink as string;
        consultation.eventId = meetingData.eventId as string;
      } catch (meetError) {
        console.error("Failed to schedule Google Meet, saving consultation without link", meetError);
        // We might still want to mark as paid even if calendar fails
      }

      await consultation.save();

      console.log('consultantion', consultation)

      // Send Confirmation Email
      if (consultation.meetingLink) {
        await sendConsultationConfirmation(
          consultation.email,
          consultation.name,
          consultation.scheduledDate,
          consultation.meetingLink
        );
      }

      res.status(200).json({
        success: true,
        data: consultation,
        message: "Consultation booked successfully",
      });
    } else {
      await Consultation.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: "failed" }
      );

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error: any) {
    console.error("Consultation verification error:", error);
    res.status(500).json({
      success: false,
      message: "Consultation verification failed",
      error: error.message,
    });
  }
};
