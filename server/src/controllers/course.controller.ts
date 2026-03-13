// server/src/controllers/course.controller.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by level
    if (level) {
      query.level = level;
    }

    // Search by title or subtitle
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count
    const total = await Course.countDocuments(query);

    // Get courses
    const courses = await Course.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Check if user is enrolled in each course
    let coursesWithEnrollment = courses;

    if (req.user) {
      const userId = req.user._id;
      const enrolledCourseIds = await Enrollment.find({
        userId: userId,
        paymentStatus: "completed",
      }).distinct("courseId");

      coursesWithEnrollment = courses.map((course) => {
        const courseObj = course.toObject();
        return {
          ...courseObj,
          isEnrolled: enrolledCourseIds.includes(course._id),
        };
      });
    } else {
      coursesWithEnrollment = courses.map((course) => {
        const courseObj = course.toObject();
        return {
          ...courseObj,
          isEnrolled: false,
        };
      });
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: coursesWithEnrollment,
    });
  } catch (error: any) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch courses",
    });
  }
};

// @desc    Get single course by slug
// @route   GET /api/courses/:slug
// @access  Public
export const getCourseBySlug = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: course._id,
        paymentStatus: "completed",
      });
      isEnrolled = !!enrollment;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        isEnrolled,
      },
    });
  } catch (error: any) {
    console.error("Get course by slug error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course",
    });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Get user info for instructor field
    const User = require("../models/User").default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const courseData = {
      ...req.body,
      instructor: {
        id: userId,
        name: `${user.firstName} ${user.lastName}`,
        title: user.role === "instructor" ? "Instructor" : "Admin",
        bio: user.bio || "",
        avatar: user.avatar,
      },
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update course",
    });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete course",
    });
  }
};

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/my-courses
// @access  Private/Instructor
export const getInstructorCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const courses = await Course.find({ "instructor.id": userId });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch instructor courses",
    });
  }
};

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({
      userId: userId,
      paymentStatus: "completed",
    }).populate("courseId");

    const courses = enrollments.map((enrollment: any) => enrollment.courseId);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error: any) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch enrolled courses",
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/id/:id
// @access  Public
export const getCourseById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: course._id,
        paymentStatus: "completed",
      });
      isEnrolled = !!enrollment;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        isEnrolled,
      },
    });
  } catch (error: any) {
    console.error("Get course by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course",
    });
  }
};
