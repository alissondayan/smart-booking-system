import { Injectable, NotFoundException } from '@nestjs/common';
import { Business, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { BusinessEntity } from '../../domain/entities/business.entity';
import {
  BusinessRepositoryPort,
  UpsertBusinessData,
} from '../../domain/ports/business.repository.port';

@Injectable()
export class PrismaBusinessRepository implements BusinessRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async get(): Promise<BusinessEntity | null> {
    const business = await this.prismaService.business.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    return business ? this.toDomain(business) : null;
  }

  async upsert(data: UpsertBusinessData): Promise<BusinessEntity> {
    const existingBusiness = await this.prismaService.business.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    const businessData = this.toPrismaData(data);
    const business = existingBusiness
      ? await this.prismaService.business.update({
          where: { id: existingBusiness.id },
          data: businessData,
        })
      : await this.prismaService.business.create({
          data: businessData as Prisma.BusinessCreateInput,
        });

    return this.toDomain(business);
  }

  async updateLogo(logoUrl: string): Promise<BusinessEntity> {
    const existingBusiness = await this.prismaService.business.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!existingBusiness) {
      throw new NotFoundException('Business profile is not configured');
    }

    const business = await this.prismaService.business.update({
      where: { id: existingBusiness.id },
      data: { logoUrl },
    });

    return this.toDomain(business);
  }

  private toPrismaData(data: UpsertBusinessData): Prisma.BusinessUpdateInput {
    return {
      name: data.name,
      description: data.description,
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      socialLinks: data.socialLinks ?? Prisma.JsonNull,
      timezone: data.timezone ?? 'Asia/Jerusalem',
    };
  }

  private toDomain(business: Business): BusinessEntity {
    return new BusinessEntity({
      id: business.id,
      name: business.name,
      logoUrl: business.logoUrl,
      description: business.description,
      phone: business.phone,
      email: business.email,
      address: business.address,
      website: business.website,
      socialLinks: business.socialLinks as Record<string, string> | null,
      timezone: business.timezone,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    });
  }
}
