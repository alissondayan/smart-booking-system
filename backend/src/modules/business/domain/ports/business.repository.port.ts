import { BusinessEntity } from '../entities/business.entity';

export const BUSINESS_REPOSITORY = Symbol('BUSINESS_REPOSITORY');

export interface UpsertBusinessData {
  name: string;
  description?: string | null;
  phone: string;
  email: string;
  address?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  timezone?: string;
}

export interface BusinessRepositoryPort {
  get(): Promise<BusinessEntity | null>;
  upsert(data: UpsertBusinessData): Promise<BusinessEntity>;
  updateLogo(logoUrl: string): Promise<BusinessEntity>;
}
