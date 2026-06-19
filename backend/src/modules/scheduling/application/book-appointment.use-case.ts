import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import { AppointmentBookedEvent } from '../domain/events/appointment-booked.event';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import { SLOT_HOLD, SlotHoldPort } from '../domain/ports/slot-hold.port';
import { BookingService } from '../domain/services/booking.service';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';
import { AppointmentResponse } from './scheduling-response';

export interface BookAppointmentCommand {
  customerId: string;
  serviceId: string;
  startAt: Date;
}

@Injectable()
export class BookAppointmentUseCase {
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

  async execute(command: BookAppointmentCommand): Promise<AppointmentResponse> {
    try {
      this.bookingService.assertFutureSlot(command.startAt);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    const service = await this.serviceRepository.findActiveById(command.serviceId);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const serviceData = service.toJSON();
    const slot = this.bookingService.createSlot(
      command.startAt,
      serviceData.durationMinutes,
    );
    const availableSlots = await this.getAvailableSlotsUseCase.execute({
      serviceId: command.serviceId,
      date: command.startAt.toISOString().slice(0, 10),
    });
    const isAvailable = availableSlots.some(
      (availableSlot) =>
        availableSlot.startAt.getTime() === slot.startAt.getTime() &&
        availableSlot.endAt.getTime() === slot.endAt.getTime(),
    );

    if (!isAvailable) {
      throw new ConflictException('Slot is not available');
    }

    const holdAcquired = await this.slotHold.acquire(
      command.serviceId,
      command.startAt,
    );

    if (!holdAcquired) {
      throw new ConflictException('Slot is temporarily held');
    }

    try {
      const appointment = await this.appointmentRepository.createIfSlotAvailable({
        serviceId: command.serviceId,
        customerId: command.customerId,
        startAt: slot.startAt,
        endAt: slot.endAt,
      });

      if (!appointment) {
        throw new ConflictException('Slot is already booked');
      }

      const appointmentData = appointment.toJSON();
      await this.eventBus.publish(
        new AppointmentBookedEvent(
          appointmentData.id,
          appointmentData.serviceId,
          appointmentData.customerId,
          appointmentData.startAt,
          appointmentData.endAt,
        ),
      );

      return appointmentData;
    } finally {
      await this.slotHold.release(command.serviceId, command.startAt);
    }
  }
}
