import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { AppointmentCancelledEvent } from '../domain/events/appointment-cancelled.event';
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
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
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

    const appointmentData = appointment.toJSON();
    await this.eventBus.publish(
      new AppointmentCancelledEvent(
        appointmentData.id,
        appointmentData.serviceId,
        appointmentData.customerId,
        appointmentData.startAt,
        appointmentData.endAt,
      ),
    );

    return appointmentData;
  }
}
