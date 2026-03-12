// server/src/routes/video.routes.ts
import express from "express";
import {
  uploadVideoToLesson,
  getVideoStreamUrl,
  updateVideoLesson,
  deleteVideo,
  getVideoAnalytics,
  generateThumbnail,
  batchUpdateVideoLessons,
  getUploadProgress,
} from "../controllers/video.controller";
import {
  protect,
  authorize,
  validateToken,
} from "../middleware/auth.middleware";

const router = express.Router();

// All routes are protected except for stream (which uses validateToken)
router.use(protect);

// Upload video to lesson (Admin/Instructor only)
router.post(
  "/upload/:courseId/:moduleId/:lessonId",
  authorize("admin", "instructor"),
  uploadVideoToLesson
);

// Get video stream URL (Protected but uses validateToken for previews)
router.get(
  "/stream/:courseId/:moduleId/:lessonId",
  validateToken,
  getVideoStreamUrl
);

// Update video lesson (Admin/Instructor only)
router.put(
  "/:courseId/:moduleId/:lessonId",
  authorize("admin", "instructor"),
  updateVideoLesson
);

// Delete video (Admin/Instructor only)
router.delete(
  "/:courseId/:moduleId/:lessonId",
  authorize("admin", "instructor"),
  deleteVideo
);

// Get video analytics (Admin/Instructor only)
router.get(
  "/analytics/:courseId/:moduleId/:lessonId",
  authorize("admin", "instructor"),
  getVideoAnalytics
);

// Generate custom thumbnail (Admin/Instructor only)
router.post(
  "/thumbnail/:courseId/:moduleId/:lessonId",
  authorize("admin", "instructor"),
  generateThumbnail
);

// Batch update video lessons (Admin/Instructor only)
router.put(
  "/batch-update/:courseId",
  authorize("admin", "instructor"),
  batchUpdateVideoLessons
);

// Get upload progress (Admin/Instructor only)
router.get(
  "/upload-progress/:uploadId",
  authorize("admin", "instructor"),
  getUploadProgress
);

export default router;
