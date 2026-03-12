import express from "express";
import {
  // Dashboard
  getDashboardStats,

  // Courses
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,

  // Modules
  addModule,
  updateModule,
  deleteModule,

  // Enrollments & Payments
  getAllEnrollments,
  getAllPayments,

  // Users
  getAllUsers,
  toggleUserStatus,
} from "../controllers/admin.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, admin);

// ============================================
// DASHBOARD ROUTES
// ============================================
router.get("/stats", getDashboardStats);

// ============================================
// COURSE ROUTES
// ============================================
router.get("/courses", getAllCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.patch("/courses/:id/publish", togglePublishCourse);

// ============================================
// MODULE ROUTES
// ============================================
router.post("/courses/:id/modules", addModule);
router.put("/modules/:courseId/:moduleId", updateModule);
router.delete("/modules/:courseId/:moduleId", deleteModule);

// ============================================
// ENROLLMENT & PAYMENT ROUTES
// ============================================
router.get("/enrollments", getAllEnrollments);
router.get("/payments", getAllPayments);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);

export default router;
