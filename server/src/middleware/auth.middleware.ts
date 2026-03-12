// server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Only import default, not IUser

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: any; // Use 'any' type to avoid TypeScript issues
}

// Middleware specifically for admin role
export const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
    return;
  }
  next();
};
// Middleware to protect routes - verify JWT token
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Get token from cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_here",
      ) as { id: string };

      // Find user by id
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: "User account is deactivated",
        });
        return;
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }
  } catch (error: any) {
    console.error("Protect middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
    return;
  }
};

// Middleware to authorize based on roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role || "unknown"} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

// Simple validate token middleware (for optional authentication)
export const validateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = undefined;
      next();
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_here",
      ) as { id: string };

      // Find user by id
      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = undefined;
      }

      next();
    } catch (error) {
      // Invalid token, proceed without authentication
      req.user = undefined;
      next();
    }
  } catch (error: any) {
    console.error("Validate token middleware error:", error);
    // On error, proceed without authentication
    req.user = undefined;
    next();
  }
};
