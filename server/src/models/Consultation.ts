import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  name: string;
  email: string;
  topic: string;
  scheduledDate: Date;
  durationMins: number; // e.g., 30 or 60
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentReference: string;
  amountPaid: number;
  meetingLink?: string;
  eventId?: string;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    topic: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    durationMins: {
      type: Number,
      default: 30, // Default to 30 mins
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: {
      type: String,
      unique: true,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    meetingLink: {
      type: String,
    },
    eventId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// We can add indexes if we often query by email or date
ConsultationSchema.index({ email: 1 });
ConsultationSchema.index({ scheduledDate: 1 });

export default mongoose.model<IConsultation>("Consultation", ConsultationSchema);
