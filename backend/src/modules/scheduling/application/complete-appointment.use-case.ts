import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { AppointmentResponse } from './scheduling-response';

export interface CompleteAppointmentCommand {
  appointmentId: string;
}

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
  ) {}

  async execute(command: CompleteAppointmentCommand): Promise<AppointmentResponse> {
    const existing = await this.appointmentRepository.findById(command.appointmentId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (existing.status !== AppointmentStatus.CONFIRMED) {
      throw new ConflictException('Only confirmed appointments can be completed');
    }

    if (existing.endAt > new Date()) {
      throw new ConflictException(
        'Appointments that have not ended yet cannot be completed',
      );
    }

    const appointment = await this.appointmentRepository.complete(command.appointmentId);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment.toJSON();
  }
}
