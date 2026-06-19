import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import { AppointmentRescheduledEvent } from '../domain/events/appointment-rescheduled.event';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { SLOT_HOLD, SlotHoldPort } from '../domain/ports/slot-hold.port';
import { BookingService } from '../domain/services/booking.service';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';
import { AppointmentResponse } from './scheduling-response';

export interface RescheduleAppointmentCommand {
  appointmentId: string;
  customerId?: string;
  newStartAt: Date;
}

@Injectable()
export class RescheduleAppointmentUseCase {
  private readonly bookingService = new BookingService();

  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
    @Inject(SLOT_HOLD)
    private readonly slotHold: SlotHoldPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
  ) {}

  async execute(command: RescheduleAppointmentCommand): Promise<AppointmentResponse> {
    try {
      this.bookingService.assertFutureSlot(command.newStartAt);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    const existing = await this.appointmentRepository.findById(command.appointmentId);

    if (!existing) {
      throw new NotFoundException('Appointment not found');
    }

    if (command.customerId && existing.customerId !== command.customerId) {
      throw new ForbiddenException('Appointment does not belong to the current user');
    }

    const service = await this.serviceRepository.findActiveById(existing.serviceId);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const slot = this.bookingService.createSlot(
      command.newStartAt,
      service.toJSON().durationMinutes,
    );
    const availableSlots = await this.getAvailableSlotsUseCase.execute({
      serviceId: existing.serviceId,
      date: command.newStartAt.toISOString().slice(0, 10),
    });
    const current = existing.toJSON();
    const isAvailable =
      current.startAt.getTime() === slot.startAt.getTime() ||
      availableSlots.some(
        (availableSlot) =>
          availableSlot.startAt.getTime() === slot.startAt.getTime() &&
          availableSlot.endAt.getTime() === slot.endAt.getTime(),
      );

    if (!isAvailable) {
      throw new ConflictException('Slot is not available');
    }

    const holdAcquired = await this.slotHold.acquire(
      existing.serviceId,
      command.newStartAt,
    );

    if (!holdAcquired) {
      throw new ConflictException('Slot is temporarily held');
    }

    try {
      const appointment =
        await this.appointmentRepository.rescheduleIfSlotAvailable(
          command.appointmentId,
          slot.startAt,
          slot.endAt,
        );

      if (!appointment) {
        throw new ConflictException('Slot is already booked');
      }

      const appointmentData = appointment.toJSON();
      const previousAppointmentData = existing.toJSON();
      await this.eventBus.publish(
        new AppointmentRescheduledEvent(
          appointmentData.id,
          appointmentData.serviceId,
          appointmentData.customerId,
          previousAppointmentData.startAt,
          previousAppointmentData.endAt,
          appointmentData.startAt,
          appointmentData.endAt,
        ),
      );

      return appointmentData;
    } finally {
      await this.slotHold.release(existing.serviceId, command.newStartAt);
    }
  }
}
