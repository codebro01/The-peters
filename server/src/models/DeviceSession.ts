// server/src/models/DeviceSession.ts
import mongoose from "mongoose";

const DeviceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    loggedInAt: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    loggedOutAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
DeviceSessionSchema.index({ user: 1, deviceId: 1 });
DeviceSessionSchema.index({ isActive: 1, lastActivity: -1 });

export default mongoose.model("DeviceSession", DeviceSessionSchema);
