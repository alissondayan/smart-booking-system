import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';
import { AppointmentEntity } from '../entities/appointment.entity';

export const APPOINTMENT_REPOSITORY = Symbol('APPOINTMENT_REPOSITORY');

export interface CreateAppointmentData {
  serviceId: string;
  customerId: string;
  startAt: Date;
  endAt: Date;
}

export interface AppointmentListFilters {
  customerId?: string;
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
}

export interface AppointmentRepositoryPort {
  findById(id: string): Promise<AppointmentEntity | null>;
  list(filters: AppointmentListFilters): Promise<AppointmentEntity[]>;
  listConfirmedOverlapping(startAt: Date, endAt: Date): Promise<AppointmentEntity[]>;
  createIfSlotAvailable(data: CreateAppointmentData): Promise<AppointmentEntity | null>;
  cancel(id: string): Promise<AppointmentEntity | null>;
  rescheduleIfSlotAvailable(
    id: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentEntity | null>;
  updateNotes(id: string, notes: string | null): Promise<AppointmentEntity | null>;
}
