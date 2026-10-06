import axios from 'axios';
import {
  User,
  Hackathon,
  Registration,
  Feedback,
  AdminStats,
  ParticipationStatus,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nmit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized session expiration
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/admin/login' && path !== '/signup') {
        localStorage.removeItem('nmit_token');
        localStorage.removeItem('nmit_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (data: any) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/signup', data);
    return res.data;
  },
  studentLogin: async (data: { identifier: string; password: string }) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/login', data);
    return res.data;
  },
  adminLogin: async (data: { email: string; password: string }) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/admin/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data: Partial<User>) => {
    const res = await api.put<{ message: string; user: User }>('/auth/me', data);
    return res.data;
  },
};

export const hackathonApi = {
  list: async (params?: { category?: string; search?: string; eligibleOnly?: boolean; status?: string }) => {
    const res = await api.get<{ hackathons: Hackathon[] }>('/hackathons', { params });
    return res.data.hackathons;
  },
  getById: async (id: string) => {
    const res = await api.get<{ hackathon: Hackathon }>('/hackathons/' + id);
    return res.data.hackathon;
  },
  create: async (data: any) => {
    const res = await api.post<{ message: string; hackathon: Hackathon }>('/hackathons/admin', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<{ message: string; hackathon: Hackathon }>('/hackathons/admin/' + id, data);
    return res.data;
  },
  archive: async (id: string) => {
    const res = await api.patch<{ message: string; hackathon: Hackathon }>('/hackathons/admin/' + id + '/archive');
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>('/hackathons/admin/' + id);
    return res.data;
  },
};

export const registrationApi = {
  register: async (hackathonId: string) => {
    const res = await api.post<{
      success?: boolean;
      alreadyRegistered?: boolean;
      message: string;
      registrationUrl: string;
      registration?: Registration;
    }>('/hackathons/' + hackathonId + '/register');
    return res.data;
  },
  getMyRegistrations: async () => {
    const res = await api.get<{ registrations: Registration[] }>('/students/me/registrations');
    return res.data.registrations;
  },
  getAdminRegistrations: async (
    hackathonId: string,
    params?: { page?: number; limit?: number; status?: string; search?: string }
  ) => {
    const res = await api.get<{
      hackathon: { id: string; title: string; organizer: string; status: string };
      registrations: Registration[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/admin/hackathons/' + hackathonId + '/registrations', { params });
    return res.data;
  },
};

export const participationApi = {
  updateStatus: async (
    registrationId: string,
    data: { status: ParticipationStatus; round?: string; adminNotes?: string }
  ) => {
    const res = await api.put<{ message: string; registration: Registration }>(
      '/admin/participation/' + registrationId,
      data
    );
    return res.data;
  },
};

export const feedbackApi = {
  submit: async (hackathonId: string, data: any) => {
    const res = await api.post<{ message: string; feedback: Feedback }>(
      '/hackathons/' + hackathonId + '/feedback',
      data
    );
    return res.data;
  },
  getAdminFeedback: async (params?: { hackathonId?: string; page?: number; limit?: number }) => {
    const res = await api.get<{
      feedback: Feedback[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/admin/feedback', { params });
    return res.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },
  getStudents: async (params?: { page?: number; limit?: number; search?: string; department?: string; batch?: string }) => {
    const res = await api.get<{
      students: Array<User & { registrationsCount: number; feedbackCount: number }>;
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/admin/students', { params });
    return res.data;
  },
};

export default api;
