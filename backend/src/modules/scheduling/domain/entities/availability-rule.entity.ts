export interface AvailabilityRuleProps {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AvailabilityRuleEntity {
  constructor(private readonly props: AvailabilityRuleProps) {}

  toJSON(): AvailabilityRuleProps {
    return { ...this.props };
  }
}
