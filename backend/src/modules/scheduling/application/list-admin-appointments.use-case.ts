import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { AppointmentResponse } from './scheduling-response';

export interface ListAdminAppointmentsQuery {
  status?: AppointmentStatus;
  date?: Date;
  from?: Date;
  to?: Date;
}

@Injectable()
export class ListAdminAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
  ) {}

  async list(query: ListAdminAppointmentsQuery): Promise<AppointmentResponse[]> {
    const range = query.date ? this.fullDay(query.date) : undefined;
    const appointments = await this.appointmentRepository.list({
      status: query.status,
      from: query.from ?? range?.from,
      to: query.to ?? range?.to,
    });

    return appointments.map((appointment) => appointment.toJSON());
  }

  async get(appointmentId: string): Promise<AppointmentResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment.toJSON();
  }

  async updateNotes(
    appointmentId: string,
    notes: string | null,
  ): Promise<AppointmentResponse> {
    const appointment = await this.appointmentRepository.updateNotes(
      appointmentId,
      notes,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment.toJSON();
  }

  private fullDay(date: Date): { from: Date; to: Date } {
    return {
      from: date,
      to: new Date(date.getTime() + 24 * 60 * 60_000),
    };
  }
}
