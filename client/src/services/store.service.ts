import api from "./api";
import { ApiResponse } from "../types";

class StoreService {
  /**
   * Get all products
   */
  async getAllProducts(params: any = {}): Promise<any> {
    const { category, search, sort, page, limit } = params;
    let url = "/store/products?";
    if (category && category !== "All") url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    if (sort) url += `&sort=${sort}`;
    if (page) url += `&page=${page}`;
    if (limit) url += `&limit=${limit}`;

    const response = await api.get<ApiResponse<any>>(url);
    return response.data;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/store/products/${id}`);
    return response.data.data;
  }

  /**
   * Create order
   */
  async createOrder(orderData: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>("/store/orders", orderData);
    return response.data.data;
  }

  /**
   * Verify order payment
   */
  async verifyOrderPayment(reference: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/store/orders/verify/${reference}`);
    return response.data;
  }
}

export default new StoreService();
