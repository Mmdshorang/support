import apiClient from './client';
import type { User } from '../../stores/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
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

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

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

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('support-user');
  },
};
