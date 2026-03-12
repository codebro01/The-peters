import { Request, Response } from "express";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";

// @desc    Get user enrollments
// @route   GET /api/enrollments
// @access  Private
export const getMyEnrollments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({
      userId: req.user?._id,
      paymentStatus: "completed",
    })
      .populate("courseId")
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    });
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    }).populate("courseId");

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
    });
  }
};

// @desc    Update lesson progress
// @route   PUT /api/enrollments/:id/progress
// @access  Private
export const updateProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lessonId, moduleId, completed } = req.body;
    const enrollmentId = req.params.id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      userId: req.user?._id,
    });

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    // Add to completed lessons if not already there
    if (completed && !enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
    }

    // Check if module is completed
    const course = await Course.findById(enrollment.courseId);

    if (course) {
      const module = course.modules.find((m: any) => m.id === moduleId);

      if (module) {
        const moduleLessons = module.lessons.map((l: any) => l.id);
        const completedModuleLessons = moduleLessons.filter((l: any) =>
          enrollment.progress.completedLessons.includes(l)
        );

        // If all lessons in module are completed, mark module as completed
        if (completedModuleLessons.length === moduleLessons.length) {
          if (!enrollment.progress.completedModules.includes(moduleId)) {
            enrollment.progress.completedModules.push(moduleId);
          }
        }
      }

      // Calculate progress percentage
      const totalLessons = course.modules.reduce(
        (sum: any, m: any) => sum + m.lessons.length,
        0
      );
      const completedLessons = enrollment.progress.completedLessons.length;
      enrollment.progress.progressPercentage = Math.round(
        (completedLessons / totalLessons) * 100
      );

      // Check if course is completed
      if (
        enrollment.progress.progressPercentage === 100 &&
        !enrollment.completedAt
      ) {
        enrollment.completedAt = new Date();
        // TODO: Generate certificate
        enrollment.certificateIssued = true;
        enrollment.certificateId = `CERT-${Date.now()}-${enrollment._id}`;
        enrollment.certificateIssuedAt = new Date();
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      data: enrollment,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

// @desc    Submit quiz result
// @route   POST /api/enrollments/:id/quiz
// @access  Private
export const submitQuizResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lessonId, score, totalQuestions, answers } = req.body;
    const enrollmentId = req.params.id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      userId: req.user?._id,
    });

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    const passed = score / totalQuestions >= 0.7; // 70% passing grade

    enrollment.quizResults.push({
      lessonId,
      score,
      totalQuestions,
      attemptedAt: new Date(),
      passed,
    });

    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        passed,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
      },
      message: passed ? "Congratulations! You passed!" : "Please try again",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
    });
  }
};

// @desc    Get certificate
// @route   GET /api/enrollments/:id/certificate
// @access  Private
export const getCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user?._id,
    }).populate("courseId");

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    if (!enrollment.certificateIssued) {
      res.status(400).json({
        success: false,
        message: "Certificate not yet issued. Complete the course first.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        certificateId: enrollment.certificateId,
        issuedAt: enrollment.certificateIssuedAt,
        studentName: `${req.user?.firstName} ${req.user?.lastName}`,
        courseName: (enrollment.courseId as any).title,
        completedAt: enrollment.completedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};
