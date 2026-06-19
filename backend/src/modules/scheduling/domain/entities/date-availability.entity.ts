export interface DateAvailabilityProps {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DateAvailabilityEntity {
  constructor(private readonly props: DateAvailabilityProps) {}

  toJSON(): DateAvailabilityProps {
    return { ...this.props };
  }
}
