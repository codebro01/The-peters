// server/src/controllers/video.controller.ts
import { Request, Response } from "express";
import multer from "multer";
import CloudinaryService from "../services/cloudinary.service";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Types } from "mongoose";

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    const allowedMimeTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/3gpp",
      "video/3gpp2",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Only video files are allowed.`
        )
      );
    }
  },
});

// Configure multer for document upload
const documentUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Only PDF files are allowed.`
        )
      );
    }
  },
});

// Configure multer for image upload (thumbnails)
const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for thumbnails
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Only image files are allowed.`
        )
      );
    }
  },
});

// @desc    Upload PDF document to Cloudinary and add to lesson
// @route   POST /api/videos/upload-document/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const uploadDocumentToLesson = [
  documentUpload.single("document"),
  async (req: Request, res: Response) => {
    try {
      const { courseId, moduleId, lessonId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No document file provided",
        });
      }

      console.log(
        `Uploading document: ${req.file.originalname}, Size: ${req.file.size} bytes`
      );

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Find the module
      const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Find the lesson
      const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/\.[^/.]+$/, "");
      const sanitizedName = originalName
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const fileName = `${sanitizedName}-${timestamp}`;

      // Upload document to Cloudinary
      console.log(`Uploading document to Cloudinary: ${fileName}`);
      const uploadResult: any = await CloudinaryService.uploadDocument(
        req.file.buffer,
        fileName,
        `courses/${courseId}/documents`
      );

      console.log("Document upload successful:", uploadResult.secure_url);

      // Delete old document from Cloudinary if exists
      if (lesson.content.document?.publicId) {
        try {
          await CloudinaryService.deleteDocument(lesson.content.document.publicId);
        } catch (err) {
          console.warn("Failed to delete old document:", err);
        }
      }

      // Update lesson with document data
      lesson.content.document = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };

      // Update lesson type
      lesson.type = "document";

      // Save the course
      await course.save();

      res.status(200).json({
        success: true,
        data: {
          lesson: {
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
          },
          documentInfo: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
            originalFilename: req.file.originalname,
          },
        },
        message: "Document uploaded successfully",
      });
    } catch (error: any) {
      console.error("Document upload error:", error);

      if (error.message && error.message.includes("Unsupported file type")) {
        return res.status(415).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload document",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
];

// @desc    Upload video to Cloudinary and add to lesson
// @route   POST /api/videos/upload/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const uploadVideoToLesson = [
  upload.single("video"),
  async (req: Request, res: Response) => {
    try {
      const { courseId, moduleId, lessonId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file provided",
        });
      }

      console.log(
        `Uploading video: ${req.file.originalname}, Size: ${req.file.size} bytes`
      );

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Find the module using array find method with toObject() for custom id parsing
      const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Find the lesson using array find method with toObject() for custom id parsing
      const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/\.[^/.]+$/, "");
      const sanitizedName = originalName
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      const fileName = `${sanitizedName}-${timestamp}`;

      // Upload video to Cloudinary
      console.log(`Uploading to Cloudinary: ${fileName}`);
      const uploadResult: any = await CloudinaryService.uploadVideo(
        req.file.buffer,
        fileName,
        `courses/${courseId}/modules/${moduleId}`
      );

      console.log("Cloudinary upload successful:", uploadResult);

      // Update lesson with video data
      lesson.content.video = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        duration: uploadResult.duration || 0,
        thumbnail:
          uploadResult.thumbnail_url ||
          uploadResult.secure_url.replace(/\.(mp4|mov|avi|wmv)$/, ".jpg"),
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
      };

      // Update lesson type
      lesson.type = "video";

      // Update lesson duration format
      const minutes = Math.floor(lesson.content.video.duration / 60);
      const seconds = Math.floor(lesson.content.video.duration % 60);
      lesson.duration = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      // Update module duration
      updateModuleDuration(course, moduleId);

      // Save the course
      await course.save();

      res.status(200).json({
        success: true,
        data: {
          lesson: {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            type: lesson.type,
            isPreview: lesson.isPreview,
            content: lesson.content,
          },
          videoInfo: {
            url: uploadResult.secure_url,
            duration: uploadResult.duration,
            thumbnail: uploadResult.thumbnail_url,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
          },
        },
        message: "Video uploaded successfully",
      });
    } catch (error: any) {
      console.error("Video upload error:", error);

      // Handle specific Cloudinary errors
      if (error.message && error.message.includes("File size too large")) {
        return res.status(413).json({
          success: false,
          message: "File size exceeds 100MB limit",
        });
      }

      if (error.message && error.message.includes("Unsupported file type")) {
        return res.status(415).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload video",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
];

// @desc    Get video streaming URL
// @route   GET /api/videos/stream/:courseId/:moduleId/:lessonId
// @access  Private (or Public for preview lessons)
export const getVideoStreamUrl = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { quality = "auto" } = req.query;
    const userId = req.user?._id; // Changed from .id to ._id

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the module using array find method
    const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Find the lesson using array find method
    const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
    if (!lesson || lesson.type !== "video" || !lesson.content.video) {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found",
      });
    }

    // Check if user is enrolled or lesson is preview
    const isPreview = lesson.isPreview;
    let isEnrolled = false;

    if (userId) {
      const enrollment = await Enrollment.findOne({
        userId: userId,
        courseId: courseId,
        paymentStatus: "completed",
      });
      isEnrolled = !!enrollment;
    }

    // Check if user is admin/instructor
    const isAdminOrInstructor =
      req.user?.role === "admin" || req.user?.role === "instructor";

    // Access control
    if (!isPreview && !isEnrolled && !isAdminOrInstructor) {
      return res.status(403).json({
        success: false,
        message: "You need to enroll in this course to access this video",
      });
    }

    // Generate secure streaming URL with transformations
    const transformations: any[] = [];

    if (quality === "hd") {
      transformations.push({ quality: "auto:good" });
    } else if (quality === "sd") {
      transformations.push({ quality: "auto:eco" });
    } else {
      transformations.push({ quality: "auto" });
    }

    // Add video player transformations
    transformations.push({
      resource_type: "video",
      flags: "splice",
      streaming_profile: "hd",
    });

    const streamUrl = CloudinaryService.generateVideoUrl(
      lesson.content.video.publicId,
      transformations
    );

    const thumbnailUrl = CloudinaryService.generateThumbnailUrl(
      lesson.content.video.publicId
    );

    // For signed URL, you'll need to implement it in CloudinaryService
    // For now, use regular URL
    const signedStreamUrl = streamUrl; // Placeholder - implement signed URL if needed

    res.status(200).json({
      success: true,
      data: {
        streamUrl: signedStreamUrl,
        thumbnailUrl,
        duration: lesson.content.video.duration,
        title: lesson.title,
        isPreview,
        canDownload: isEnrolled || isAdminOrInstructor,
        videoInfo: {
          format: lesson.content.video.format,
          width: lesson.content.video.width,
          height: lesson.content.video.height,
          bytes: lesson.content.video.bytes,
        },
      },
    });
  } catch (error: any) {
    console.error("Get video stream error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get video stream",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Update video lesson metadata
// @route   PUT /api/videos/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const updateVideoLesson = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { title, duration, isPreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the module using array find method
    const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Find the lesson using array find method
    const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Update lesson properties
    if (title !== undefined) lesson.title = title;
    if (duration !== undefined) lesson.duration = duration;
    if (isPreview !== undefined) lesson.isPreview = isPreview;

    // Update lesson order if needed
    if (req.body.order !== undefined) {
      lesson.order = req.body.order;
      // Reorder lessons in module with type annotations
      module.lessons.sort((a: any, b: any) => a.order - b.order);
    }

    // Update module duration if lesson duration changed
    if (duration !== undefined) {
      updateModuleDuration(course, moduleId);
    }

    await course.save();

    res.status(200).json({
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type,
        isPreview: lesson.isPreview,
        order: lesson.order,
        content: lesson.content,
      },
      message: "Lesson updated successfully",
    });
  } catch (error: any) {
    console.error("Update lesson error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update lesson",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Delete video from lesson
// @route   DELETE /api/videos/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the module using array find method
    const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Find the lesson using array find method
    const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const videoPublicId = lesson.content.video?.publicId;

    // Delete from Cloudinary if exists
    if (videoPublicId) {
      try {
        await CloudinaryService.deleteVideo(videoPublicId);
        console.log(`Deleted video from Cloudinary: ${videoPublicId}`);
      } catch (cloudinaryError: any) {
        console.warn(
          `Failed to delete from Cloudinary: ${cloudinaryError.message}`
        );
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    // Remove video content from lesson
    lesson.content.video = undefined;
    lesson.type = "document"; // Default back to document
    lesson.duration = "00:00"; // Reset duration

    // Update module duration
    updateModuleDuration(course, moduleId);

    await course.save();

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete video",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Get video analytics (play count, watch time, etc.)
// @route   GET /api/videos/analytics/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const getVideoAnalytics = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the module using array find method
    const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Find the lesson using array find method
    const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
    if (!lesson || lesson.type !== "video") {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found",
      });
    }

    // Here you would typically fetch analytics from your database
    // For now, return placeholder data
    const analytics = {
      playCount: 0,
      averageWatchTime: 0,
      completionRate: 0,
      uniqueViewers: 0,
      lastPlayed: null,
    };

    res.status(200).json({
      success: true,
      data: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        analytics,
      },
    });
  } catch (error: any) {
    console.error("Get video analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get video analytics",
    });
  }
};

// @desc    Generate video thumbnail
// @route   POST /api/videos/thumbnail/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const { timestamp = 5 } = req.body; // Default to 5 seconds

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find the module using array find method
    const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Find the lesson using array find method
    const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
    if (!lesson || lesson.type !== "video" || !lesson.content.video) {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found",
      });
    }

    // Generate thumbnail at specific timestamp
    const thumbnailUrl = CloudinaryService.generateThumbnailUrl(
      lesson.content.video.publicId
      // Note: If your CloudinaryService.generateThumbnailUrl accepts a second parameter,
      // you would add: , timestamp
      // But from the error, it seems it only accepts one parameter
    );

    // Update lesson thumbnail
    lesson.content.video.thumbnail = thumbnailUrl;
    await course.save();

    res.status(200).json({
      success: true,
      data: {
        thumbnailUrl,
        lessonId: lesson.id,
      },
      message: "Thumbnail generated successfully",
    });
  } catch (error: any) {
    console.error("Generate thumbnail error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate thumbnail",
    });
  }
};

// @desc    Upload thumbnail to lesson
// @route   POST /api/videos/placeholder-thumbnail/:courseId/:moduleId/:lessonId
// @access  Private/Admin
export const uploadThumbnailToLesson = [
  imageUpload.single("thumbnail"),
  async (req: Request, res: Response) => {
    try {
      const { courseId, moduleId, lessonId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No thumbnail file provided",
        });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Find the module
      const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      // Find the lesson
      const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `thumbnail-${lessonId}-${timestamp}`;

      // Upload image to Cloudinary
      const uploadResult: any = await CloudinaryService.uploadImage(
        req.file.buffer,
        fileName,
        `courses/${courseId}/thumbnails`
      );

      // Update lesson with thumbnail URL
      if (!lesson.content.video) {
        lesson.content.video = {
           url: "",
           publicId: "",
           duration: 0,
        };
      }
      
      lesson.content.video.thumbnail = uploadResult.secure_url;

      // Save the course
      await course.save();

      res.status(200).json({
        success: true,
        data: {
          thumbnailUrl: uploadResult.secure_url,
          lessonId: lesson.id,
        },
        message: "Thumbnail uploaded successfully",
      });
    } catch (error: any) {
      console.error("Thumbnail upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload thumbnail",
      });
    }
  },
];

// @desc    Batch update video lessons
// @route   PUT /api/videos/batch-update/:courseId
// @access  Private/Admin
export const batchUpdateVideoLessons = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates must be an array",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { moduleId, lessonId, ...updateData } = update;

        // Find the module using array find method
        const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
        if (!module) {
          errors.push({ moduleId, lessonId, error: "Module not found" });
          continue;
        }

        // Find the lesson using array find method
        const lesson = module.lessons.find((l: any) => l.id === lessonId || (l.toObject && l.toObject().id === lessonId));
        if (!lesson) {
          errors.push({ moduleId, lessonId, error: "Lesson not found" });
          continue;
        }

        // Apply updates
        Object.assign(lesson, updateData);
        results.push({ moduleId, lessonId, success: true });
      } catch (error: any) {
        errors.push({
          moduleId: update.moduleId,
          lessonId: update.lessonId,
          error: error.message,
        });
      }
    }

    if (results.length > 0) {
      await course.save();
    }

    res.status(200).json({
      success: true,
      data: {
        updated: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Batch update completed: ${results.length} successful, ${errors.length} failed`,
    });
  } catch (error: any) {
    console.error("Batch update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to batch update lessons",
    });
  }
};

// @desc    Check video upload progress
// @route   GET /api/videos/upload-progress/:uploadId
// @access  Private/Admin
export const getUploadProgress = async (req: Request, res: Response) => {
  try {
    // In a real implementation, you would track upload progress
    // This is a placeholder implementation
    res.status(200).json({
      success: true,
      data: {
        uploadId: req.params.uploadId,
        progress: 0, // You would track this in memory or Redis
        status: "pending",
      },
    });
  } catch (error: any) {
    console.error("Get upload progress error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get upload progress",
    });
  }
};

// Helper function to update module duration
const updateModuleDuration = (course: any, moduleId: string) => {
  // Find the module using array find method
  const module = course.modules.find((m: any) => m.id === moduleId || (m.toObject && m.toObject().id === moduleId));
  if (!module) return;

  // Calculate total duration of all lessons in module
  let totalMinutes = 0;
  let totalSeconds = 0;

  module.lessons.forEach((lesson: any) => {
    if (lesson.duration) {
      const [minutes, seconds] = lesson.duration.split(":").map(Number);
      totalMinutes += minutes || 0;
      totalSeconds += seconds || 0;
    }
  });

  // Convert excess seconds to minutes
  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;

  // Format module duration
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    module.duration = `${hours}h ${minutes}m`;
  } else {
    module.duration = `${minutes}m`;
  }

  // Update course duration
  updateCourseDuration(course);
};

// Helper function to update course duration
const updateCourseDuration = (course: any) => {
  let totalMinutes = 0;
  let totalSeconds = 0;

  course.modules.forEach((module: any) => {
    module.lessons.forEach((lesson: any) => {
      if (lesson.duration) {
        const [minutes, seconds] = lesson.duration.split(":").map(Number);
        totalMinutes += minutes || 0;
        totalSeconds += seconds || 0;
      }
    });
  });

  // Convert excess seconds to minutes
  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;

  // Format course duration
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    course.duration = `${hours}h ${minutes}m`;
  } else {
    course.duration = `${minutes}m`;
  }
};
