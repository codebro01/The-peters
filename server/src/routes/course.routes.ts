// server/src/routes/course.routes.ts
import express from "express";
import {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getEnrolledCourses,
} from "../controllers/course.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import {
  trackDeviceSession,
  validateDeviceSession,
} from "../middleware/deviceSession.middleware"; // Fixed import

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:slug", getCourseBySlug);

// Protected routes with device session tracking
router.get(
  "/instructor/my-courses",
  protect,
  authorize("instructor", "admin"),
  trackDeviceSession, // Use trackDeviceSession
  validateDeviceSession, // Use validateDeviceSession
  getInstructorCourses,
);

router.get(
  "/enrolled",
  protect,
  trackDeviceSession, // Use trackDeviceSession
  validateDeviceSession, // Use validateDeviceSession
  getEnrolledCourses,
);

// Admin/Instructor routes with device session tracking
router.post(
  "/",
  protect,
  authorize("admin", "instructor"),
  trackDeviceSession, // Use trackDeviceSession
  validateDeviceSession, // Use validateDeviceSession
  createCourse,
);

router.put(
  "/:id",
  protect,
  authorize("admin", "instructor"),
  trackDeviceSession, // Use trackDeviceSession
  validateDeviceSession, // Use validateDeviceSession
  updateCourse,
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "instructor"),
  trackDeviceSession, // Use trackDeviceSession
  validateDeviceSession, // Use validateDeviceSession
  deleteCourse,
);

export default router;
