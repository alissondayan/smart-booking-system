import { ServiceEntity } from '../entities/service.entity';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface CreateServiceData {
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ServiceRepositoryPort {
  listActive(): Promise<ServiceEntity[]>;
  listAll(): Promise<ServiceEntity[]>;
  findActiveById(id: string): Promise<ServiceEntity | null>;
  findById(id: string): Promise<ServiceEntity | null>;
  create(data: CreateServiceData): Promise<ServiceEntity>;
  update(id: string, data: UpdateServiceData): Promise<ServiceEntity | null>;
  deactivate(id: string): Promise<ServiceEntity | null>;
}
