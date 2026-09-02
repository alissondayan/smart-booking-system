import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus as PrismaAppointmentStatus,
  Prisma,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CustomerDetails,
  CustomerRepositoryPort,
  CustomerSummary,
  ListCustomersQuery,
  PaginatedCustomers,
} from '../../domain/ports/customer.repository.port';

type CustomerWithCount = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        appointments: true;
      };
    };
  };
}>;

type CustomerWithAppointments = Prisma.UserGetPayload<{
  include: {
    appointments: {
      include: {
        service: true;
      };
      orderBy: {
        startAt: 'desc';
      };
    };
    _count: {
      select: {
        appointments: true;
      };
    };
  };
}>;

interface AppointmentMilestones {
  lastAppointmentAt: Date | null;
  nextAppointmentAt: Date | null;
}

const NO_APPOINTMENT_MILESTONES: AppointmentMilestones = {
  lastAppointmentAt: null,
  nextAppointmentAt: null,
};

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async list(query: ListCustomersQuery): Promise<PaginatedCustomers> {
    const where = this.buildWhere(query.search);
    const [customers, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        include: {
          _count: {
            select: { appointments: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prismaService.user.count({ where }),
    ]);
    const milestones = await this.findAppointmentMilestones(
      customers.map((customer) => customer.id),
    );

    return {
      items: customers.map((customer) =>
        this.toSummary(
          customer,
          milestones.get(customer.id) ?? NO_APPOINTMENT_MILESTONES,
        ),
      ),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findById(id: string): Promise<CustomerDetails | null> {
    const customer = await this.prismaService.user.findFirst({
      where: { id, role: PrismaUserRole.CUSTOMER },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { startAt: 'desc' },
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    return customer ? this.toDetails(customer) : null;
  }

  private async findAppointmentMilestones(
    customerIds: string[],
  ): Promise<Map<string, AppointmentMilestones>> {
    const milestones = new Map<string, AppointmentMilestones>();

    if (!customerIds.length) {
      return milestones;
    }

    const now = new Date();
    const [pastGroups, upcomingGroups] = await this.prismaService.$transaction([
      this.prismaService.appointment.groupBy({
        by: ['customerId'],
        where: {
          customerId: { in: customerIds },
          status: { not: PrismaAppointmentStatus.CANCELLED },
          startAt: { lt: now },
        },
        orderBy: { customerId: 'asc' },
        _max: { startAt: true },
      }),
      this.prismaService.appointment.groupBy({
        by: ['customerId'],
        where: {
          customerId: { in: customerIds },
          status: PrismaAppointmentStatus.CONFIRMED,
          startAt: { gte: now },
        },
        orderBy: { customerId: 'asc' },
        _min: { startAt: true },
      }),
    ]);

    for (const group of pastGroups) {
      milestones.set(group.customerId, {
        lastAppointmentAt: group._max?.startAt ?? null,
        nextAppointmentAt: null,
      });
    }

    for (const group of upcomingGroups) {
      milestones.set(group.customerId, {
        lastAppointmentAt:
          milestones.get(group.customerId)?.lastAppointmentAt ?? null,
        nextAppointmentAt: group._min?.startAt ?? null,
      });
    }

    return milestones;
  }

  private toMilestones(
    appointments: CustomerWithAppointments['appointments'],
  ): AppointmentMilestones {
    const now = new Date();

    return {
      lastAppointmentAt: appointments
        .filter(
          (appointment) =>
            appointment.status !== PrismaAppointmentStatus.CANCELLED &&
            appointment.startAt < now,
        )
        .reduce<Date | null>(
          (latest, appointment) =>
            !latest || appointment.startAt > latest
              ? appointment.startAt
              : latest,
          null,
        ),
      nextAppointmentAt: appointments
        .filter(
          (appointment) =>
            appointment.status === PrismaAppointmentStatus.CONFIRMED &&
            appointment.startAt >= now,
        )
        .reduce<Date | null>(
          (soonest, appointment) =>
            !soonest || appointment.startAt < soonest
              ? appointment.startAt
              : soonest,
          null,
        ),
    };
  }

  private buildWhere(search?: string): Prisma.UserWhereInput {
    const trimmedSearch = search?.trim();

    return {
      role: PrismaUserRole.CUSTOMER,
      ...(trimmedSearch
        ? {
            OR: [
              { email: { contains: trimmedSearch, mode: 'insensitive' } },
              { firstName: { contains: trimmedSearch, mode: 'insensitive' } },
              { lastName: { contains: trimmedSearch, mode: 'insensitive' } },
              { phone: { contains: trimmedSearch, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private toSummary(
    customer: CustomerWithCount,
    milestones: AppointmentMilestones,
  ): CustomerSummary {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      appointmentCount: customer._count.appointments,
      lastAppointmentAt: milestones.lastAppointmentAt,
      nextAppointmentAt: milestones.nextAppointmentAt,
    };
  }

  private toDetails(customer: CustomerWithAppointments): CustomerDetails {
    return {
      ...this.toSummary(customer, this.toMilestones(customer.appointments)),
      appointments: customer.appointments.map((appointment) => ({
        id: appointment.id,
        serviceId: appointment.serviceId,
        serviceName: appointment.service.name,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status as AppointmentStatus,
        notes: appointment.notes,
      })),
    };
  }
}
