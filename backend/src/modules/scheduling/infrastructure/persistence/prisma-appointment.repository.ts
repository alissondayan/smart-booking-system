import { Injectable } from '@nestjs/common';
import {
  Appointment,
  AppointmentStatus as PrismaAppointmentStatus,
  Prisma,
} from '@prisma/client';
import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { AppointmentEntity } from '../../domain/entities/appointment.entity';
import {
  AppointmentListFilters,
  AppointmentRepositoryPort,
  CreateAppointmentData,
} from '../../domain/ports/appointment.repository.port';

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<AppointmentEntity | null> {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
    });

    return appointment ? this.toDomain(appointment) : null;
  }

  async list(filters: AppointmentListFilters): Promise<AppointmentEntity[]> {
    const appointments = await this.prismaService.appointment.findMany({
      where: this.toWhere(filters),
      orderBy: { startAt: 'asc' },
    });

    return appointments.map((appointment) => this.toDomain(appointment));
  }

  async listConfirmedOverlapping(
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentEntity[]> {
    const appointments = await this.prismaService.appointment.findMany({
      where: this.overlapWhere(startAt, endAt),
      orderBy: { startAt: 'asc' },
    });

    return appointments.map((appointment) => this.toDomain(appointment));
  }

  async createIfSlotAvailable(
    data: CreateAppointmentData,
  ): Promise<AppointmentEntity | null> {
    const appointment = await this.prismaService.$transaction(
      async (tx) => {
        const overlap = await tx.appointment.findFirst({
          where: this.overlapWhere(data.startAt, data.endAt),
        });

        if (overlap) {
          return null;
        }

        return tx.appointment.create({
          data: {
            serviceId: data.serviceId,
            customerId: data.customerId,
            startAt: data.startAt,
            endAt: data.endAt,
            status: PrismaAppointmentStatus.CONFIRMED,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return appointment ? this.toDomain(appointment) : null;
  }

  async cancel(id: string): Promise<AppointmentEntity | null> {
    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    const appointment = await this.prismaService.appointment.update({
      where: { id },
      data: {
        status: PrismaAppointmentStatus.CANCELLED,
        version: { increment: 1 },
      },
    });

    return this.toDomain(appointment);
  }

  async rescheduleIfSlotAvailable(
    id: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentEntity | null> {
    const appointment = await this.prismaService.$transaction(
      async (tx) => {
        const existing = await tx.appointment.findUnique({ where: { id } });

        if (!existing) {
          return null;
        }

        const overlap = await tx.appointment.findFirst({
          where: {
            ...this.overlapWhere(startAt, endAt),
            id: { not: id },
          },
        });

        if (overlap) {
          return null;
        }

        return tx.appointment.update({
          where: { id },
          data: {
            startAt,
            endAt,
            status: PrismaAppointmentStatus.CONFIRMED,
            version: { increment: 1 },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return appointment ? this.toDomain(appointment) : null;
  }

  async updateNotes(
    id: string,
    notes: string | null,
  ): Promise<AppointmentEntity | null> {
    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    const appointment = await this.prismaService.appointment.update({
      where: { id },
      data: { notes, version: { increment: 1 } },
    });

    return this.toDomain(appointment);
  }

  private overlapWhere(startAt: Date, endAt: Date): Prisma.AppointmentWhereInput {
    return {
      status: PrismaAppointmentStatus.CONFIRMED,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    };
  }

  private toWhere(filters: AppointmentListFilters): Prisma.AppointmentWhereInput {
    return {
      customerId: filters.customerId,
      status: filters.status as PrismaAppointmentStatus | undefined,
      startAt:
        filters.from || filters.to
          ? {
              gte: filters.from,
              lte: filters.to,
            }
          : undefined,
    };
  }

  private toDomain(appointment: Appointment): AppointmentEntity {
    return new AppointmentEntity({
      id: appointment.id,
      serviceId: appointment.serviceId,
      customerId: appointment.customerId,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status as AppointmentStatus,
      notes: appointment.notes,
      version: appointment.version,
      googleEventId: appointment.googleEventId,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    });
  }
}
