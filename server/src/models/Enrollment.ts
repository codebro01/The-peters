import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentReference: string;
  amountPaid: number;
  enrolledAt?: Date;
  expiresAt?: Date;
  progress: {
    completedLessons: string[];
    completedModules: string[];
    progressPercentage: number;
    lastAccessedLesson?: {
      moduleId: string;
      lessonId: string;
      timestamp: Date;
    };
  };
  quizResults: Array<{
    lessonId: string;
    score: number;
    totalQuestions: number;
    attemptedAt: Date;
    passed: boolean;
  }>;
  certificateIssued: boolean;
  certificateId?: string;
  certificateIssuedAt?: Date;
  completedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
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
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    enrolledAt: Date,
    expiresAt: Date,
    progress: {
      completedLessons: [String],
      completedModules: [String],
      progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastAccessedLesson: {
        moduleId: String,
        lessonId: String,
        timestamp: Date,
      },
    },
    quizResults: [
      {
        lessonId: String,
        score: Number,
        totalQuestions: Number,
        attemptedAt: Date,
        passed: Boolean,
      },
    ],
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateId: String,
    certificateIssuedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
