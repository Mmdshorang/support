import apiClient from './client';

export type TicketStatus = "در انتظار" | "در حال پیگیری" | "پاسخ داده شده" | "بسته شده";
export type TicketPriority = "کم" | "متوسط" | "زیاد" | "بحرانی";
export type TicketChannel = "وب" | "تلفن" | "ایمیل" | "واتساپ";

export interface Ticket {
  id: number;
  subject: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  priority: TicketPriority;
  status: TicketStatus;
  user_id: string;
  customer_id?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  channel: TicketChannel;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  // For list display
  customer?: string;
  owner?: string;
  unread_count?: number;
  last_message?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: number;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  sender_role?: string;
  sender_avatar?: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  attachments?: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface TicketStats {
  total: number;
  by_status: {
    pending: number;
    in_progress: number;
    answered: number;
    closed: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category_id?: string;
  priority: TicketPriority;
  channel?: TicketChannel;
  customer_id?: string;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: string;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export const ticketsApi = {
  // Get all tickets (with filters)
  getTickets: async (filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Ticket>>(
      `/tickets?${params.toString()}`
    );
    return response.data;
  },

  // Get single ticket
  getTicket: async (id: number): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data;
  },

  // Create ticket
  createTicket: async (data: CreateTicketData): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', data);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id: number, data: UpdateTicketData): Promise<ApiResponse<Ticket>> => {
    const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
    return response.data;
  },

  // Delete ticket (admin only)
  deleteTicket: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/tickets/${id}`);
    return response.data;
  },

  // Get ticket statistics
  getStats: async (): Promise<ApiResponse<TicketStats>> => {
    const response = await apiClient.get<ApiResponse<TicketStats>>('/tickets/stats/overview');
    return response.data;
  },

  // Get ticket messages
  getMessages: async (ticketId: number): Promise<ApiResponse<TicketMessage[]>> => {
    const response = await apiClient.get<ApiResponse<TicketMessage[]>>(
      `/tickets/${ticketId}/messages`
    );
    return response.data;
  },

  // Send message
  sendMessage: async (
    ticketId: number,
    message: string,
    isInternal: boolean = false
  ): Promise<ApiResponse<TicketMessage>> => {
    const response = await apiClient.post<ApiResponse<TicketMessage>>(
      `/tickets/${ticketId}/messages`,
      { message, is_internal: isInternal }
    );
    return response.data;
  },

  // Delete message (admin only)
  deleteMessage: async (ticketId: number, messageId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/tickets/${ticketId}/messages/${messageId}`
    );
    return response.data;
  },
};
