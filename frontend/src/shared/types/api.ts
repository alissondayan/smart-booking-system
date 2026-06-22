export type UserRole = "CUSTOMER" | "OWNER" | "STAFF";
export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type WaitlistStatus = "ACTIVE" | "NOTIFIED" | "FULFILLED" | "CANCELLED";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface BusinessProfile {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  phone: string;
  email: string;
  address?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: string | number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  customerId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string | null;
  version: number;
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  serviceId: string;
  customerId: string;
  preferredDate?: string | null;
  status: WaitlistStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorEnvelope {
  statusCode: number;
  timestamp: string;
  path: string;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
