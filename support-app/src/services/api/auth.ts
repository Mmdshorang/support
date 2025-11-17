import apiClient from './client';
import type { User } from '../../stores/auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
  email?: string;
  role?: 'user' | 'admin' | 'support';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export interface UpdateDetailsData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
console.log(response)
    // Save token
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Save token
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  },

  // Update user details
  updateDetails: async (data: UpdateDetailsData) => {
    const response = await apiClient.put<{ success: boolean; message: string; data: User }>('/auth/updatedetails', data);
    return response.data;
  },

  // Update password
  updatePassword: async (data: UpdatePasswordData) => {
    const response = await apiClient.put<{ success: boolean; message: string; data: { token: string } }>('/auth/updatepassword', data);

    // Update token if password changed successfully
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('support-user');
  },
};
