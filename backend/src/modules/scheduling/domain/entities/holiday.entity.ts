export interface HolidayProps {
  id: string;
  date: Date;
  label?: string | null;
  createdAt: Date;
}

export class HolidayEntity {
  constructor(private readonly props: HolidayProps) {}

  toJSON(): HolidayProps {
    return { ...this.props };
  }
}
