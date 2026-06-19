import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { AppointmentResponse } from './scheduling-response';

export interface CancelAppointmentCommand {
  appointmentId: string;
  customerId?: string;
}

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
  ) {}

  async execute(command: CancelAppointmentCommand): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findById(command.appointmentId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (command.customerId && existing.customerId !== command.customerId) {
      throw new ForbiddenException('Appointment does not belong to the current user');
    }

    const appointment = await this.appointmentRepository.cancel(command.appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment.toJSON();
  }
}
