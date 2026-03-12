import api from "./api";
import { Enrollment, ApiResponse } from "../types";

class EnrollmentService {
  /**
   * Get all my enrollments
   */
  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get<ApiResponse<Enrollment[]>>("/enrollments");
    return response.data.data || [];
  }

  /**
   * Get single enrollment
   */
  async getEnrollment(enrollmentId: string): Promise<Enrollment> {
    const response = await api.get<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}`
    );
    return response.data.data!;
  }

  /**
   * Update lesson progress
   */
  async updateProgress(
    enrollmentId: string,
    data: {
      lessonId: string;
      moduleId: string;
      completed: boolean;
    }
  ): Promise<Enrollment> {
    const response = await api.put<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}/progress`,
      data
    );
    return response.data.data!;
  }

  /**
   * Submit quiz result
   */
  async submitQuiz(
    enrollmentId: string,
    data: {
      lessonId: string;
      score: number;
      totalQuestions: number;
      answers: any[];
    }
  ): Promise<any> {
    const response = await api.post<ApiResponse<any>>(
      `/enrollments/${enrollmentId}/quiz`,
      data
    );
    return response.data.data;
  }

  /**
   * Get certificate
   */
  async getCertificate(enrollmentId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `/enrollments/${enrollmentId}/certificate`
    );
    return response.data.data;
  }
}

export default new EnrollmentService();
