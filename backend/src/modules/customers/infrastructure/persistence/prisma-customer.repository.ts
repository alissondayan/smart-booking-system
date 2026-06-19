import { Injectable } from '@nestjs/common';
import {
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

    return {
      items: customers.map((customer) => this.toSummary(customer)),
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

  private toSummary(customer: CustomerWithCount): CustomerSummary {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      appointmentCount: customer._count.appointments,
    };
  }

  private toDetails(customer: CustomerWithAppointments): CustomerDetails {
    return {
      ...this.toSummary(customer),
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
