// server/src/middleware/deviceSession.middleware.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import DeviceSession from "../models/DeviceSession";

// @desc    Track device sessions for security
// @route   All routes (middleware)
// @access  All
export const trackDeviceSession = async (
  req: AuthenticatedRequest, // Changed to AuthenticatedRequest
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Only track for authenticated users
    if (!req.user) {
      next();
      return;
    }

    const userId = (req.user as any)._id || req.user?.id;
    if (!userId) {
      next();
      return;
    }

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const deviceId = (req.headers["x-device-id"] as string) || "Unknown";

    // Check if this device session already exists
    const existingSession = await DeviceSession.findOne({
      user: userId,
      deviceId,
      isActive: true,
    });

    if (existingSession) {
      // Update last activity
      existingSession.lastActivity = new Date();
      existingSession.ipAddress = ipAddress;
      existingSession.userAgent = userAgent;
      await existingSession.save();
    } else {
      // Create new device session
      await DeviceSession.create({
        user: userId,
        deviceId,
        userAgent,
        ipAddress,
        loggedInAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      });
    }

    next();
  } catch (error: any) {
    // Don't block request if device tracking fails
    console.error("Device session tracking error:", error);
    next();
  }
};

// @desc    Check if device session is valid
// @route   Protected routes (middleware)
// @access  Private
export const validateDeviceSession = async (
  req: AuthenticatedRequest, // Changed to AuthenticatedRequest
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req.user as any)._id || req.user?.id;
    if (!userId) {
      next();
      return;
    }

    const deviceId = req.headers["x-device-id"] as string;

    // If no device ID, skip validation (for first-time login)
    if (!deviceId) {
      next();
      return;
    }

    // Check for active session
    const activeSession = await DeviceSession.findOne({
      user: userId,
      deviceId,
      isActive: true,
    });

    if (!activeSession) {
      // Device session not found or inactive
      // You could optionally require re-authentication here
      console.warn(
        `Device session not found for user ${userId}, device ${deviceId}`,
      );

      // For now, just log and continue
      // In production, you might want to require re-authentication
    } else {
      // Update last activity for valid session
      activeSession.lastActivity = new Date();
      await activeSession.save();
    }

    next();
  } catch (error: any) {
    // Don't block request if device validation fails
    console.error("Device session validation error:", error);
    next();
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAllDevices = async (
  req: AuthenticatedRequest, // Changed to AuthenticatedRequest
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)._id || req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    // Deactivate all active sessions
    await DeviceSession.updateMany(
      {
        user: userId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          loggedOutAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error: any) {
    console.error("Logout all devices error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to logout from all devices",
    });
  }
};

// @desc    Get active device sessions
// @route   GET /api/auth/device-sessions
// @access  Private
export const getDeviceSessions = async (
  req: AuthenticatedRequest, // Changed to AuthenticatedRequest
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as any)._id || req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const activeSessions = await DeviceSession.find({
      user: userId,
      isActive: true,
    }).sort({ lastActivity: -1 });

    res.status(200).json({
      success: true,
      count: activeSessions.length,
      data: activeSessions,
    });
  } catch (error: any) {
    console.error("Get device sessions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get device sessions",
    });
  }
};
