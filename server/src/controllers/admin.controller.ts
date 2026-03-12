import { Request, Response } from "express";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import Payment from "../models/Payment";
import User from "../models/User";
import { v4 as uuidv4 } from "uuid";

// ============================================
// DASHBOARD STATS
// ============================================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Get total courses
    const totalCourses = await Course.countDocuments();

    // Get active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      paymentStatus: "completed",
    });

    // Calculate total revenue
    const payments = await Payment.find({ status: "success" });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({
      paymentStatus: "completed",
    })
      .populate("userId", "firstName lastName email")
      .populate("courseId", "title")
      .sort({ enrolledAt: -1 })
      .limit(10);

    // Get top performing courses
    const topCourses = await Course.find({ isPublished: true })
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select("title enrollmentCount price rating");

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCourses,
          activeEnrollments,
          totalRevenue,
        },
        recentEnrollments,
        topCourses,
      },
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// ============================================
// COURSE MANAGEMENT
// ============================================

// @desc    Get all courses (admin view - includes unpublished)
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getAllCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private/Admin
export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("=== CREATE COURSE START ===");
    console.log("Request body:", req.body);

    const {
      title,
      subtitle,
      description,
      price,
      category,
      level,
      duration,
      language,
      features,
      requirements,
      outcomes,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !subtitle ||
      !description ||
      price === undefined ||
      !category ||
      !level ||
      !duration
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
      return;
    }

    // Get authenticated user info
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Prepare course data
    const courseData: any = {
      title,
      subtitle,
      description,
      price: parseFloat(price),
      category,
      level,
      duration,
      language: language || "English",
      instructor: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        title: user.title || "Instructor",
        bio: user.bio || "",
        avatar: user.avatar || "",
      },
      modules: [],
      isPublished: false,
      enrollmentCount: 0,
      rating: {
        average: 0,
        count: 0,
      },
    };

    // Handle arrays - convert from string if needed
    if (features) {
      courseData.features = Array.isArray(features)
        ? features
        : typeof features === "string"
        ? features.split("\n").filter((f: string) => f.trim())
        : [];
    } else {
      courseData.features = [];
    }

    if (requirements) {
      courseData.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === "string"
        ? requirements.split("\n").filter((r: string) => r.trim())
        : [];
    } else {
      courseData.requirements = [];
    }

    if (outcomes) {
      courseData.outcomes = Array.isArray(outcomes)
        ? outcomes
        : typeof outcomes === "string"
        ? outcomes.split("\n").filter((o: string) => o.trim())
        : [];
    } else {
      courseData.outcomes = [];
    }

    console.log("Course data prepared:", courseData);

    // Create course
    const course = new Course(courseData);

    // Save course (pre-save hook will generate slug)
    await course.save();

    console.log("=== CREATE COURSE SUCCESS ===");
    console.log("Created course:", course);

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (error: any) {
    console.error("=== CREATE COURSE ERROR ===");
    console.error("Full error:", error);

    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      res.status(400).json({
        success: false,
        message:
          "A course with a similar title already exists. Please try a different title.",
      });
      return;
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Course validation failed",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Update course with new data
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastUpdated: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: "Course updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Check if course has active enrollments
    const enrollmentCount = await Enrollment.countDocuments({
      courseId: course._id,
      paymentStatus: "completed",
    });

    if (enrollmentCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete course with ${enrollmentCount} active enrollments. Consider unpublishing instead.`,
      });
      return;
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

// @desc    Publish/Unpublish course
// @route   PATCH /api/admin/courses/:id/publish
// @access  Private/Admin
export const togglePublishCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Check if course has at least one module before publishing
    if (!course.isPublished && course.modules.length === 0) {
      res.status(400).json({
        success: false,
        message: "Cannot publish course without any modules",
      });
      return;
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: `Course ${
        course.isPublished ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle publish status",
    });
  }
};

// ============================================
// MODULE MANAGEMENT
// ============================================

// @desc    Add module to course
// @route   POST /api/admin/courses/:id/modules
// @access  Private/Admin
// In your admin.controller.ts, update the addModule function:
export const addModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, lessons, duration, order } = req.body;

    console.log("=== ADD MODULE REQUEST ===");
    console.log("Course ID:", id);
    console.log("Request body:", req.body);
    console.log("Title:", title);
    console.log("Lessons:", lessons);
    console.log("Lessons type:", typeof lessons);
    console.log("Is array?", Array.isArray(lessons));
    console.log("Lessons length:", lessons?.length || 0);

    // Validate input
    if (!title) {
      res.status(400).json({
        success: false,
        message: "Module title is required",
      });
      return;
    }

    // Make lessons optional - allow empty array
    const lessonArray = Array.isArray(lessons) ? lessons : [];

    // If no lessons provided, create a default one
    let processedLessons = lessonArray;
    if (lessonArray.length === 0) {
      // Create a default placeholder lesson
      processedLessons = [
        {
          title: "Introduction",
          duration: "5:00",
          type: "video",
          isPreview: false,
          content: {},
        },
      ];
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Generate module ID
    const moduleId = uuidv4();

    // Process lessons
    const finalLessons = processedLessons.map((lesson: any, index: number) => {
      return {
        id: uuidv4(),
        title: lesson.title || `Lesson ${index + 1}`,
        duration: lesson.duration || "10:00",
        type: lesson.type || "video",
        order: index + 1,
        isPreview: lesson.isPreview || false,
        content: lesson.content || {},
      };
    });

    // Calculate total module duration
    let totalMinutes = 0;
    if (duration) {
      // Use provided duration
      if (duration.includes("hr")) {
        const match = duration.match(/(\d+)\s*hr\s*(\d+)\s*mins?/);
        if (match) {
          totalMinutes =
            (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
        }
      } else if (duration.includes("min")) {
        const match = duration.match(/(\d+)\s*mins?/);
        if (match) {
          totalMinutes = parseInt(match[1]) || 0;
        }
      } else {
        // Try to parse as number
        totalMinutes = parseInt(duration) || 0;
      }
    } else {
      // Calculate from lessons
      totalMinutes = finalLessons.reduce((sum: number, lesson: any) => {
        if (lesson.duration.includes(":")) {
          const parts = lesson.duration.split(":");
          const mins = parseInt(parts[0]) || 0;
          const secs = parseInt(parts[1]) || 0;
          return sum + mins + secs / 60;
        }
        return sum + (parseInt(lesson.duration) || 0);
      }, 0);
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    const finalDuration = hours > 0 ? `${hours}hr ${mins}mins` : `${mins}mins`;

    // Create module object
    const newModule = {
      id: moduleId,
      title,
      duration: finalDuration,
      order: order || course.modules.length + 1,
      lessons: finalLessons,
    };

    console.log("New module created:", newModule);

    // Add module to course
    course.modules.push(newModule);
    course.lastUpdated = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: "Module added successfully",
    });
  } catch (error: any) {
    console.error("Add module error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add module",
      error: error.message,
    });
  }
};

// @desc    Update module
// @route   PUT /api/admin/modules/:courseId/:moduleId
// @access  Private/Admin
export const updateModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, lessons } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Find module index
    const moduleIndex = course.modules.findIndex((m: any) => m.id === moduleId);

    if (moduleIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Module not found",
      });
      return;
    }

    // Update module data
    if (title) {
      course.modules[moduleIndex].title = title;
    }

    if (lessons && Array.isArray(lessons)) {
      // Process updated lessons
      const processedLessons = lessons.map((lesson: any, index: number) => ({
        id: lesson.id || uuidv4(),
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type || "video",
        order: index + 1,
        isPreview: lesson.isPreview || false,
        content: lesson.content || {},
      }));

      course.modules[moduleIndex].lessons = processedLessons;

      // Recalculate duration
      const totalMinutes = processedLessons.reduce(
        (sum: number, lesson: any) => {
          const parts = lesson.duration.split(":");
          const mins = parseInt(parts[0]) || 0;
          const secs = parseInt(parts[1]) || 0;
          return sum + mins + secs / 60;
        },
        0
      );

      const hours = Math.floor(totalMinutes / 60);
      const mins = Math.round(totalMinutes % 60);
      course.modules[moduleIndex].duration =
        hours > 0 ? `${hours}hr ${mins}mins` : `${mins}mins`;
    }

    course.lastUpdated = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: "Module updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update module",
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/admin/modules/:courseId/:moduleId
// @access  Private/Admin
export const deleteModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    // Filter out the module
    const originalLength = course.modules.length;
    course.modules = course.modules.filter((m: any) => m.id !== moduleId);

    if (course.modules.length === originalLength) {
      res.status(404).json({
        success: false,
        message: "Module not found",
      });
      return;
    }

    course.lastUpdated = new Date();
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: "Module deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete module",
    });
  }
};

// ============================================
// ENROLLMENTS MANAGEMENT
// ============================================

// @desc    Get all enrollments (admin view)
// @route   GET /api/admin/enrollments
// @access  Private/Admin
export const getAllEnrollments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, courseId, page = 1, limit = 20 } = req.query;

    let query: any = {};

    if (status) {
      query.paymentStatus = status as string;
    }

    if (courseId) {
      query.courseId = courseId as string;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const enrollments = await Enrollment.find(query)
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("courseId", "title price thumbnail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Enrollment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: enrollments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    });
  }
};

// ============================================
// PAYMENTS MANAGEMENT
// ============================================

// @desc    Get all payments (admin view)
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query: any = {};

    if (status) {
      query.status = status as string;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(query)
      .populate("userId", "firstName lastName email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: payments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

// ============================================
// USERS MANAGEMENT
// ============================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query: any = {};

    if (role) {
      query.role = role as string;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Don't allow deactivating yourself
    const currentUser = (req as any).user;
    if (user._id.toString() === currentUser._id.toString()) {
      res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle user status",
    });
  }
};

export default {
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
};
