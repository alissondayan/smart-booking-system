import { Injectable } from '@nestjs/common';
import { Prisma, WaitlistEntry, WaitlistStatus as PrismaWaitlistStatus } from '@prisma/client';
import { WaitlistStatus } from '../../../../shared/domain/enums/waitlist-status.enum';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { WaitlistEntryEntity } from '../../domain/entities/waitlist-entry.entity';
import {
  JoinWaitlistData,
  ListWaitlistFilters,
  WaitlistRepositoryPort,
} from '../../domain/ports/waitlist.repository.port';

@Injectable()
export class PrismaWaitlistRepository implements WaitlistRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: JoinWaitlistData): Promise<WaitlistEntryEntity> {
    const entry = await this.prismaService.waitlistEntry.create({
      data: {
        serviceId: data.serviceId,
        customerId: data.customerId,
        preferredDate: data.preferredDate ? this.onlyDate(data.preferredDate) : null,
        status: PrismaWaitlistStatus.ACTIVE,
      },
    });

    return this.toDomain(entry);
  }

  async findActiveDuplicate(
    data: JoinWaitlistData,
  ): Promise<WaitlistEntryEntity | null> {
    const entry = await this.prismaService.waitlistEntry.findFirst({
      where: {
        serviceId: data.serviceId,
        customerId: data.customerId,
        preferredDate: data.preferredDate ? this.onlyDate(data.preferredDate) : null,
        status: PrismaWaitlistStatus.ACTIVE,
      },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async list(filters: ListWaitlistFilters): Promise<WaitlistEntryEntity[]> {
    const entries = await this.prismaService.waitlistEntry.findMany({
      where: this.toWhere(filters),
      orderBy: { createdAt: 'asc' },
    });

    return entries.map((entry) => this.toDomain(entry));
  }

  async cancelForCustomer(
    id: string,
    customerId: string,
  ): Promise<WaitlistEntryEntity | null> {
    const existingEntry = await this.prismaService.waitlistEntry.findFirst({
      where: { id, customerId },
    });

    if (!existingEntry) {
      return null;
    }

    const entry = await this.prismaService.waitlistEntry.update({
      where: { id },
      data: { status: PrismaWaitlistStatus.CANCELLED },
    });

    return this.toDomain(entry);
  }

  async findFirstActiveForSlot(
    serviceId: string,
    availableDate: Date,
  ): Promise<WaitlistEntryEntity | null> {
    const entry = await this.prismaService.waitlistEntry.findFirst({
      where: {
        serviceId,
        status: PrismaWaitlistStatus.ACTIVE,
        OR: [
          { preferredDate: null },
          { preferredDate: this.onlyDate(availableDate) },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async markNotified(id: string): Promise<WaitlistEntryEntity | null> {
    const existingEntry = await this.prismaService.waitlistEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return null;
    }

    const entry = await this.prismaService.waitlistEntry.update({
      where: { id },
      data: { status: PrismaWaitlistStatus.NOTIFIED },
    });

    return this.toDomain(entry);
  }

  private toWhere(filters: ListWaitlistFilters): Prisma.WaitlistEntryWhereInput {
    return {
      customerId: filters.customerId,
      serviceId: filters.serviceId,
      status: filters.status as PrismaWaitlistStatus | undefined,
    };
  }

  private onlyDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private toDomain(entry: WaitlistEntry): WaitlistEntryEntity {
    return new WaitlistEntryEntity({
      id: entry.id,
      serviceId: entry.serviceId,
      customerId: entry.customerId,
      preferredDate: entry.preferredDate,
      status: entry.status as WaitlistStatus,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  }
}
