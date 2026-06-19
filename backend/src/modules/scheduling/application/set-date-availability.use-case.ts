import { Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
  SetDateAvailabilityData,
} from '../domain/ports/availability.repository.port';
import { DateAvailabilityResponse } from './scheduling-response';

@Injectable()
export class SetDateAvailabilityUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepositoryPort,
  ) {}

  async list(from?: Date, to?: Date): Promise<DateAvailabilityResponse[]> {
    const overrides = await this.availabilityRepository.listDateAvailabilities(
      from,
      to,
    );

    return overrides.map((override) => override.toJSON());
  }

  async set(data: SetDateAvailabilityData): Promise<DateAvailabilityResponse> {
    const override = await this.availabilityRepository.setDateAvailability(data);

    return override.toJSON();
  }

  delete(date: Date): Promise<void> {
    return this.availabilityRepository.deleteDateAvailability(date);
  }
}
