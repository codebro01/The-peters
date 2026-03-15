import express from "express";
import {
  getAllProducts,
  getProductById,
  createOrder,
  verifyOrderPayment,
} from "../controllers/store.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);

// Protected routes
router.post("/orders", protect, createOrder);
router.post("/orders/verify/:reference", protect, verifyOrderPayment);

export default router;
