import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import {
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../domain/ports/waitlist.repository.port';
import {
  WaitlistEntryResponse,
  toWaitlistEntryResponse,
} from './waitlist-response';

export interface JoinWaitlistCommand {
  serviceId: string;
  customerId: string;
  preferredDate?: Date | null;
}

@Injectable()
export class JoinWaitlistUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @Inject(WAITLIST_REPOSITORY)
    private readonly waitlistRepository: WaitlistRepositoryPort,
  ) {}

  async execute(command: JoinWaitlistCommand): Promise<WaitlistEntryResponse> {
    const service = await this.serviceRepository.findActiveById(command.serviceId);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const duplicate =
      await this.waitlistRepository.findActiveDuplicate(command);

    if (duplicate) {
      throw new ConflictException('Active waitlist entry already exists');
    }

    const entry = await this.waitlistRepository.create(command);

    return toWaitlistEntryResponse(entry);
  }
}
