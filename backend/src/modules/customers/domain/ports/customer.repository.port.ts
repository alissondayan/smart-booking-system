import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  appointmentCount: number;
}

export interface CustomerAppointmentHistoryItem {
  id: string;
  serviceId: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes?: string | null;
}

export interface CustomerDetails extends CustomerSummary {
  appointments: CustomerAppointmentHistoryItem[];
}

export interface ListCustomersQuery {
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedCustomers {
  items: CustomerSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerRepositoryPort {
  list(query: ListCustomersQuery): Promise<PaginatedCustomers>;
  findById(id: string): Promise<CustomerDetails | null>;
}
