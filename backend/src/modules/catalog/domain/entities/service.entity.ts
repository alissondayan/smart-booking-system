export interface ServiceProps {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceEntity {
  constructor(private readonly props: ServiceProps) {}

  get id(): string {
    return this.props.id;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  toJSON(): ServiceProps {
    return { ...this.props };
  }
}
