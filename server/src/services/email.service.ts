import nodemailer from "nodemailer";

export const sendConsultationConfirmation = async (
  to: string,
  name: string,
  scheduledDate: Date,
  meetingLink: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"The Peters Agriculture" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Consultation Booking Confirmation - The Peters Agriculture",
      html: `
        <h2>Consultation Booking Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Your consultation booking has been successfully confirmed!</p>
        <p><strong>Date & Time:</strong> ${new Date(
          scheduledDate
        ).toLocaleString()}</p>
        <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        <br/>
        <p>We look forward to speaking with you!</p>
        <br/>
        <p>Best regards,</p>
        <p>The Peters Agriculture Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending consultation email:", error);
    return false;
  }
};
