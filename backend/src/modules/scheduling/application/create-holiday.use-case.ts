import { Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
  CreateHolidayData,
} from '../domain/ports/availability.repository.port';
import { HolidayResponse } from './scheduling-response';

@Injectable()
export class CreateHolidayUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepositoryPort,
  ) {}

  async list(): Promise<HolidayResponse[]> {
    const holidays = await this.availabilityRepository.listHolidays();

    return holidays.map((holiday) => holiday.toJSON());
  }

  async create(data: CreateHolidayData): Promise<HolidayResponse> {
    const holiday = await this.availabilityRepository.createHoliday(data);

    return holiday.toJSON();
  }

  delete(id: string): Promise<void> {
    return this.availabilityRepository.deleteHoliday(id);
  }
}
