import apiClient from "./client";
import type { ApiResponse, PaginatedResponse, Ticket } from "./tickets";

export type ContractTier = "basic" | "standard" | "premium";

export type ContractStatus = "active" | "warning" | "expired" | "unknown";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  contract_tier?: ContractTier | null;
  contract_status?: ContractStatus;
  contract_days_remaining?: number | null;
  created_by?: string | null;
  created_by_name?: string | null;
  user_id?: string | null;
  user_role?: "user" | "admin" | "support" | null;
  user_username?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  contract_start_date: string;
  contract_end_date: string;
  contract_tier: ContractTier;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  is_active?: boolean;
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer;
    userCredentials: { username: string; password: string } | null;
  };
}

export const customersApi = {
  // Get all customers (admin/support only)
  getCustomers: async (
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Customer>>(
      `/customers?${params.toString()}`
    );
    return response.data;
  },

  // Get single customer (admin/support only)
  getCustomer: async (id: string): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/customers/${id}`
    );
    return response.data;
  },

  // Create customer (admin/support only)
  createCustomer: async (
    data: CreateCustomerData
  ): Promise<CreateCustomerResponse> => {
    const response = await apiClient.post<CreateCustomerResponse>(
      "/customers",
      data
    );
    return response.data;
  },

  // Update customer (admin/support only)
  updateCustomer: async (
    id: string,
    data: UpdateCustomerData
  ): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.put<ApiResponse<Customer>>(
      `/customers/${id}`,
      data
    );
    return response.data;
  },

  // Delete customer (admin only)
  deleteCustomer: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/customers/${id}`
    );
    return response.data;
  },

  // Get customer tickets (admin/support only)
  getCustomerTickets: async (id: string): Promise<ApiResponse<Ticket[]>> => {
    const response = await apiClient.get<ApiResponse<Ticket[]>>(
      `/customers/${id}/tickets`
    );
    return response.data;
  },

  // Update customer user role (admin only)
  updateCustomerUserRole: async (
    id: string,
    role: "user" | "admin" | "support"
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/customers/${id}/user-role`,
      { role }
    );
    return response.data;
  },
};
