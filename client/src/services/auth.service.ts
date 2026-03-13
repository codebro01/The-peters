import api from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  ApiResponse,
} from "../types";

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<User>>(
      "/auth/register",
      data
    );

    if (response.data.success && response.data.data && response.data.token) {
      // Save token and user to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return {
        user: response.data.data,
        token: response.data.token
      };
    }

    throw new Error(response.data.message || "Registration failed");
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<User>>(
      "/auth/login",
      credentials
    );

    if (response.data.success && response.data.data && response.data.token) {
      // Save token and user to localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return {
        user: response.data.data,
        token: response.data.token
      };
    }

    throw new Error(response.data.message || "Login failed");
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage regardless of API call result
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("deviceId");
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/auth/me");

    if (response.data.success && response.data.data) {
      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error("Failed to fetch user");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");

    console.log('token', token)
    return !!token;
  }

  /**
   * Get user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();
