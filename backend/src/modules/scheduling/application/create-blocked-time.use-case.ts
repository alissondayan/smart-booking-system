import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
  CreateBlockedTimeData,
} from '../domain/ports/availability.repository.port';
import { BlockedTimeResponse } from './scheduling-response';

@Injectable()
export class CreateBlockedTimeUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepositoryPort,
  ) {}

  async list(from?: Date, to?: Date): Promise<BlockedTimeResponse[]> {
    const blockedTimes = await this.availabilityRepository.listBlockedTimes(
      from,
      to,
    );

    return blockedTimes.map((blockedTime) => blockedTime.toJSON());
  }

  async create(data: CreateBlockedTimeData): Promise<BlockedTimeResponse> {
    if (data.endAt <= data.startAt) {
      throw new BadRequestException('Blocked time endAt must be after startAt');
    }

    const blockedTime = await this.availabilityRepository.createBlockedTime(data);

    return blockedTime.toJSON();
  }

  delete(id: string): Promise<void> {
    return this.availabilityRepository.deleteBlockedTime(id);
  }
}
