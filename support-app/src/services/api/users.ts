import apiClient from "./client";

export type UserRole = "user" | "admin" | "support";

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  customer_name?: string;
}

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const usersApi = {
  // Get all users (admin only)
  getUsers: async (
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<User>>(
      `/users?${params.toString()}`
    );
    return response.data;
  },

  // Update user role (admin only)
  updateUserRole: async (
    id: string,
    role: UserRole
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}/role`,
      { role }
    );
    return response.data;
  },
};

