import api from "./api";
import { Payment, ApiResponse } from "../types";

class PaymentService {
  /**
   * Initialize payment
   */
  async initializePayment(courseId: string): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    const response = await api.post<ApiResponse<any>>("/payments/initialize", {
      courseId,
    });
    return response.data.data!;
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `/payments/verify/${reference}`
    );
    return response.data.data;
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>("/payments/history");
    return response.data.data || [];
  }
}

export default new PaymentService();
