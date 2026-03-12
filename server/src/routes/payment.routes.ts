import express from "express";
import {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getPaymentHistory,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";
//import { checkDeviceSession } from "../middleware/deviceSession.middleware";

const router = express.Router();

//router.post("/initialize", protect, checkDeviceSession, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", paystackWebhook);
router.get("/history", protect, getPaymentHistory);

export default router;
