import express from "express";
import {
  getMyEnrollments,
  getEnrollment,
  updateProgress,
  submitQuizResult,
} from "../controllers/enrollment.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protect, getMyEnrollments);
router.get("/:id", protect, getEnrollment);
router.put("/:id/progress", protect, updateProgress);
router.post("/:id/quiz", protect, submitQuizResult);

export default router;
