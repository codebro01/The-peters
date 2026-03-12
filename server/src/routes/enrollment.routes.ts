import express from "express";
import {
  getMyEnrollments,
  updateProgress,
  submitQuizResult,
} from "../controllers/enrollment.controller";
import { protect } from "../middleware/auth.middleware";
//import { checkDeviceSession } from "../middleware/deviceSession.middleware";

const router = express.Router();

//router.get("/", protect, checkDeviceSession, getMyEnrollments);
//router.put("/:id/progress", protect, checkDeviceSession, updateProgress);
//router.post("/:id/quiz", protect, checkDeviceSession, submitQuizResult);

export default router;
