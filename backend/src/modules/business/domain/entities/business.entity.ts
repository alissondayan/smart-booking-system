export interface BusinessProps {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  phone: string;
  email: string;
  address?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BusinessEntity {
  constructor(private readonly props: BusinessProps) {}

  get id(): string {
    return this.props.id;
  }

  toJSON(): BusinessProps {
    return { ...this.props };
  }
}
