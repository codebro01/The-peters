import express from "express";
import {
  initializeConsultation,
  verifyConsultation,
} from "../controllers/consultation.controller";

const router = express.Router();

router.post("/book", initializeConsultation);
router.get("/verify/:reference", verifyConsultation);

export default router;
