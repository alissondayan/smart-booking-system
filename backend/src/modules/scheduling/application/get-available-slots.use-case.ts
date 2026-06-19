import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
} from '../../business/domain/ports/business.repository.port';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../domain/ports/appointment.repository.port';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
} from '../domain/ports/availability.repository.port';
import { SLOT_STRATEGY, SlotStrategy } from '../domain/ports/slot-strategy.port';
import { SlotCalculatorService } from '../domain/services/slot-calculator.service';
import { SlotResponse } from './scheduling-response';

export interface GetAvailableSlotsQuery {
  serviceId: string;
  date: string;
}

@Injectable()
export class GetAvailableSlotsUseCase {
  private readonly slotCalculator = new SlotCalculatorService();

  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepositoryPort,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
    @Inject(SLOT_STRATEGY)
    private readonly slotStrategy: SlotStrategy,
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<SlotResponse[]> {
    const service = await this.serviceRepository.findActiveById(query.serviceId);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const serviceData = service.toJSON();
    const business = await this.businessRepository.get();
    const timezone = business?.toJSON().timezone ?? 'Asia/Jerusalem';
    const date = this.parseDate(query.date);
    const dayOfWeek = date.getUTCDay();
    const range = this.daySearchRange(date);
    const slots = this.slotCalculator.calculate({
      serviceId: query.serviceId,
      date: query.date,
      timezone,
      durationMinutes: serviceData.durationMinutes,
      rule: await this.availabilityRepository.findRuleByDayOfWeek(dayOfWeek),
      dateAvailability: await this.availabilityRepository.findDateAvailability(date),
      holiday: await this.availabilityRepository.findHoliday(date),
      blockedTimes: await this.availabilityRepository.listBlockedTimesOverlapping(
        range.from,
        range.to,
      ),
      appointments: await this.appointmentRepository.list({
        status: AppointmentStatus.CONFIRMED,
        from: range.from,
        to: range.to,
      }),
      slotStrategy: this.slotStrategy,
    });

    return slots.map((slot) => ({ startAt: slot.startAt, endAt: slot.endAt }));
  }

  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private daySearchRange(date: Date): { from: Date; to: Date } {
    return {
      from: new Date(date.getTime() - 24 * 60 * 60_000),
      to: new Date(date.getTime() + 48 * 60 * 60_000),
    };
  }
}
