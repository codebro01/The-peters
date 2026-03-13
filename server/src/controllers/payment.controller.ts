import { Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Payment from "../models/Payment";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// @desc    Initialize payment with Paystack
// @route   POST /api/payments/initialize
// @access  Private
export const initializePayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user?._id;

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "completed",
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
      return;
    }

    // Generate unique reference
    const reference = `PA-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Initialize payment with Paystack
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user?.email,
        amount: course.price * 100, // Convert to kobo
        reference,
        currency: "NGN",
        metadata: {
          userId: userId?.toString(),
          courseId: courseId,
          courseTitle: course.title,
          customerName: `${req.user?.firstName} ${req.user?.lastName}`,
        },
        callback_url: `${process.env.CLIENT_URL}/verify-payment/${reference}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create payment record
    await Payment.create({
      userId,
      courseId,
      amount: course.price,
      currency: "NGN",
      paymentMethod: "paystack",
      paymentReference: reference,
      status: "pending",
      metadata: {
        email: req.user?.email || "",
        customerName: `${req.user?.firstName} ${req.user?.lastName}`,
        courseTitle: course.title,
      },
    });

    // Create pending enrollment
    await Enrollment.create({
      userId,
      courseId,
      paymentStatus: "pending",
      paymentReference: reference,
      amountPaid: 0,
    });

    res.status(200).json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.data.authorization_url,
        access_code: paystackResponse.data.data.access_code,
        reference: reference,
      },
      message: "Payment initialized successfully",
    });
  } catch (error: any) {
    console.error(
      "Payment initialization error:",
      error.response?.data || error
    );
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.response?.data?.message || error.message,
    });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Public (will be called by Paystack)
export const verifyPayment = async (
  req: AuthenticatedRequest,
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
      // Find payment record
      const payment = await Payment.findOne({ paymentReference: reference });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
        return;
      }

      // Update payment record
      payment.status = "success";
      payment.paystackReference = paymentData.reference;
      payment.metadata.authorization = paymentData.authorization;
      payment.paidAt = new Date();
      await payment.save();

      // Update enrollment
      const enrollment = await Enrollment.findOne({
        paymentReference: reference,
      });

      if (enrollment) {
        enrollment.paymentStatus = "completed";
        enrollment.enrolledAt = new Date();
        enrollment.amountPaid = payment.amount;
        await enrollment.save();

        // Set enrollmentId in payment
        payment.enrollmentId = enrollment._id;
        await payment.save();
      }

      // Update course enrollment count
      await Course.findByIdAndUpdate(payment.courseId, {
        $inc: { enrollmentCount: 1 },
      });

      res.status(200).json({
        success: true,
        data: {
          status: "success",
          enrollment,
          message: "Payment verified and enrollment completed successfully",
        },
      });
    } else {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { paymentReference: reference },
        { status: "failed" }
      );

      // Update enrollment as failed
      await Enrollment.findOneAndUpdate(
        { paymentReference: reference },
        { paymentStatus: "failed" }
      );

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// @desc    Paystack webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Paystack only)
export const paystackWebhook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      res.status(401).json({ message: "Invalid signature" });
      return;
    }

    const event = req.body;

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ paymentReference: reference });

      if (payment && payment.status === "pending") {
        payment.status = "success";
        payment.paystackReference = event.data.reference;
        payment.metadata.authorization = event.data.authorization;
        payment.paidAt = new Date();
        await payment.save();

        const enrollment = await Enrollment.findOneAndUpdate(
          { paymentReference: reference },
          {
            paymentStatus: "completed",
            enrolledAt: new Date(),
            amountPaid: payment.amount,
          },
          { new: true }
        );

        if (enrollment) {
          payment.enrollmentId = enrollment._id;
          await payment.save();
        }

        await Course.findByIdAndUpdate(payment.courseId, {
          $inc: { enrollmentCount: 1 },
        });
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await Payment.find({ userId: req.user?._id })
      .populate("courseId", "title thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};
