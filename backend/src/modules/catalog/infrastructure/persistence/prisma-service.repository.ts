import { Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { ServiceEntity } from '../../domain/entities/service.entity';
import {
  CreateServiceData,
  ServiceRepositoryPort,
  UpdateServiceData,
} from '../../domain/ports/service.repository.port';

@Injectable()
export class PrismaServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async listActive(): Promise<ServiceEntity[]> {
    const services = await this.prismaService.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return services.map((service) => this.toDomain(service));
  }

  async listAll(): Promise<ServiceEntity[]> {
    const services = await this.prismaService.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return services.map((service) => this.toDomain(service));
  }

  async findActiveById(id: string): Promise<ServiceEntity | null> {
    const service = await this.prismaService.service.findFirst({
      where: { id, isActive: true },
    });

    return service ? this.toDomain(service) : null;
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = await this.prismaService.service.findUnique({
      where: { id },
    });

    return service ? this.toDomain(service) : null;
  }

  async create(data: CreateServiceData): Promise<ServiceEntity> {
    const service = await this.prismaService.service.create({
      data: {
        name: data.name,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return this.toDomain(service);
  }

  async update(
    id: string,
    data: UpdateServiceData,
  ): Promise<ServiceEntity | null> {
    const existingService = await this.findById(id);

    if (!existingService) {
      return null;
    }

    const service = await this.prismaService.service.update({
      where: { id },
      data,
    });

    return this.toDomain(service);
  }

  async deactivate(id: string): Promise<ServiceEntity | null> {
    const existingService = await this.findById(id);

    if (!existingService) {
      return null;
    }

    const service = await this.prismaService.service.update({
      where: { id },
      data: { isActive: false },
    });

    return this.toDomain(service);
  }

  private toDomain(service: Service): ServiceEntity {
    return new ServiceEntity({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price.toNumber(),
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  }
}
