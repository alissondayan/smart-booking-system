import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';

export interface AppointmentProps {
  id: string;
  serviceId: string;
  customerId: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes?: string | null;
  version: number;
  googleEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentEntity {
  constructor(private readonly props: AppointmentProps) {}

  get id(): string {
    return this.props.id;
  }

  get serviceId(): string {
    return this.props.serviceId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get startAt(): Date {
    return this.props.startAt;
  }

  get endAt(): Date {
    return this.props.endAt;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  toJSON(): AppointmentProps {
    return { ...this.props };
  }
}
