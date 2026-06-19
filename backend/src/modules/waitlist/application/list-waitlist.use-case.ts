import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WaitlistStatus } from '../../../shared/domain/enums/waitlist-status.enum';
import {
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../domain/ports/waitlist.repository.port';
import {
  WaitlistEntryResponse,
  toWaitlistEntryResponse,
  toWaitlistEntryResponses,
} from './waitlist-response';

export interface ListWaitlistQuery {
  customerId?: string;
  serviceId?: string;
  status?: WaitlistStatus;
}

@Injectable()
export class ListWaitlistUseCase {
  constructor(
    @Inject(WAITLIST_REPOSITORY)
    private readonly waitlistRepository: WaitlistRepositoryPort,
  ) {}

  async list(query: ListWaitlistQuery): Promise<WaitlistEntryResponse[]> {
    const entries = await this.waitlistRepository.list(query);

    return toWaitlistEntryResponses(entries);
  }

  async cancelForCustomer(
    id: string,
    customerId: string,
  ): Promise<WaitlistEntryResponse> {
    const entry = await this.waitlistRepository.cancelForCustomer(id, customerId);

    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    return toWaitlistEntryResponse(entry);
  }
}
