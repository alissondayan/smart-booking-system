import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { AppointmentResponse } from './scheduling-response';

export interface ListMyAppointmentsQuery {
  customerId: string;
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
}

@Injectable()
export class ListMyAppointmentsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
  ) {}

  async list(query: ListMyAppointmentsQuery): Promise<AppointmentResponse[]> {
    const appointments = await this.appointmentRepository.list(query);

    return appointments.map((appointment) => appointment.toJSON());
  }

  async get(customerId: string, appointmentId: string): Promise<AppointmentResponse> {
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment || appointment.customerId !== customerId) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment.toJSON();
  }
}
