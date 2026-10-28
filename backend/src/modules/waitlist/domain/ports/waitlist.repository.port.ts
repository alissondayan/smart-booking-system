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
  /**
   * Atomically claims an ACTIVE entry by flipping it to NOTIFIED.
   * Returns null when the row is missing or no longer ACTIVE.
   */
  markNotified(id: string): Promise<WaitlistEntryEntity | null>;
  /**
   * Reverts a NOTIFIED entry back to ACTIVE after a failed email enqueue.
   * Returns null when the row is missing or no longer NOTIFIED.
   */
  revertToActiveIfNotified(id: string): Promise<WaitlistEntryEntity | null>;
}
