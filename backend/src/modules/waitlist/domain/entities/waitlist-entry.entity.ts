import { WaitlistStatus } from '../../../../shared/domain/enums/waitlist-status.enum';

export interface WaitlistEntryProps {
  id: string;
  serviceId: string;
  customerId: string;
  preferredDate?: Date | null;
  status: WaitlistStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class WaitlistEntryEntity {
  constructor(private readonly props: WaitlistEntryProps) {}

  get id(): string {
    return this.props.id;
  }

  get serviceId(): string {
    return this.props.serviceId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get preferredDate(): Date | null | undefined {
    return this.props.preferredDate;
  }

  get status(): WaitlistStatus {
    return this.props.status;
  }

  toJSON(): WaitlistEntryProps {
    return { ...this.props };
  }
}
