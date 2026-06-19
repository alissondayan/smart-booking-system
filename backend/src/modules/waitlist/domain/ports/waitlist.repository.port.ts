import { WaitlistStatus } from '../../../../shared/domain/enums/waitlist-status.enum';
import { WaitlistEntryEntity } from '../entities/waitlist-entry.entity';

export const WAITLIST_REPOSITORY = Symbol('WAITLIST_REPOSITORY');

export interface JoinWaitlistData {
  serviceId: string;
  customerId: string;
  preferredDate?: Date | null;
}

export interface ListWaitlistFilters {
  customerId?: string;
  serviceId?: string;
  status?: WaitlistStatus;
}

export interface WaitlistRepositoryPort {
  create(data: JoinWaitlistData): Promise<WaitlistEntryEntity>;
  findActiveDuplicate(data: JoinWaitlistData): Promise<WaitlistEntryEntity | null>;
  list(filters: ListWaitlistFilters): Promise<WaitlistEntryEntity[]>;
  cancelForCustomer(id: string, customerId: string): Promise<WaitlistEntryEntity | null>;
  findFirstActiveForSlot(
    serviceId: string,
    availableDate: Date,
  ): Promise<WaitlistEntryEntity | null>;
  markNotified(id: string): Promise<WaitlistEntryEntity | null>;
}
