import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrollmentId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  paystackReference?: string;
  status: "pending" | "success" | "failed" | "abandoned";
  metadata: {
    email: string;
    customerName: string;
    courseTitle?: string;
    authorization?: any;
  };
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    paymentMethod: {
      type: String,
      default: "paystack",
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "abandoned"],
      default: "pending",
    },
    metadata: {
      email: String,
      customerName: String,
      courseTitle: String,
      authorization: Schema.Types.Mixed,
    },
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
