import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Ticket } from './tickets';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
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
  sortOrder?: 'asc' | 'desc';
}

export const customersApi = {
  // Get all customers (admin/support only)
  getCustomers: async (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
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
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  // Create customer (admin/support only)
  createCustomer: async (data: CreateCustomerData): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  // Update customer (admin/support only)
  updateCustomer: async (id: string, data: UpdateCustomerData): Promise<ApiResponse<Customer>> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer (admin only)
  deleteCustomer: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  },

  // Get customer tickets (admin/support only)
  getCustomerTickets: async (id: string): Promise<ApiResponse<Ticket[]>> => {
    const response = await apiClient.get<ApiResponse<Ticket[]>>(`/customers/${id}/tickets`);
    return response.data;
  },
};
