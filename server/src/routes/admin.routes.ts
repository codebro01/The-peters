import express from "express";
import {
  // Products & Orders
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetAllOrders,
  adminUploadProductImage,
  adminGetAllProducts
} from "../controllers/store.controller";
import { 
  getDashboardStats,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  addModule,
  updateModule,
  deleteModule,
  getAllEnrollments,
  getAllPayments,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/admin.controller";
import { protect, admin } from "../middleware/auth.middleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
// PRODUCT MANAGEMENT ROUTES
// ============================================
router.get("/products", adminGetAllProducts);
router.post("/products", adminCreateProduct);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);
router.post("/product-image/upload", upload.single("image"), adminUploadProductImage);

// ============================================
// ORDER MANAGEMENT ROUTES
// ============================================
router.get("/orders", adminGetAllOrders);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);

export default router;
