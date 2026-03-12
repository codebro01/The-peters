import api from "./api";
import { Course, ApiResponse } from "../types";

class CourseService {
  /**
   * Get all courses with optional filters
   */
  async getAllCourses(params?: {
    category?: string;
    level?: string;
    search?: string;
    sort?: string;
  }): Promise<Course[]> {
    const response = await api.get<ApiResponse<Course[]>>("/courses", {
      params,
    });
    return response.data.data || [];
  }

  /**
   * Get single course by slug
   */
  async getCourseBySlug(
    slug: string
  ): Promise<{ course: Course; isEnrolled: boolean }> {
    const response = await api.get<
      ApiResponse<{ course: Course; isEnrolled: boolean }>
    >(`/courses/${slug}`);
    return response.data.data!;
  }

  /**
   * Check if user has access to course
   */
  async checkCourseAccess(
    courseId: string
  ): Promise<{ hasAccess: boolean; enrollment?: any }> {
    const response = await api.get<ApiResponse<any>>(
      `/courses/${courseId}/check-access`
    );
    return response.data.data!;
  }

  /**
   * Get lesson content
   */
  async getLessonContent(courseId: string, lessonId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `/courses/${courseId}/lessons/${lessonId}`
    );
    return response.data.data;
  }
}

export default new CourseService();
