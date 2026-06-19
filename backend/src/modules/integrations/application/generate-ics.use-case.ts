import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
} from '../../business/domain/ports/business.repository.port';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../../scheduling/domain/ports/appointment.repository.port';
import { IcsGeneratorService } from '../infrastructure/ics/ics-generator.service';

export interface GenerateIcsCommand {
  appointmentId: string;
  userId: string;
  role: UserRole;
}

@Injectable()
export class GenerateIcsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
    private readonly icsGenerator: IcsGeneratorService,
  ) {}

  async execute(command: GenerateIcsCommand): Promise<string> {
    const appointment = await this.appointmentRepository.findById(
      command.appointmentId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      command.role !== UserRole.OWNER &&
      appointment.customerId !== command.userId
    ) {
      throw new ForbiddenException('Appointment does not belong to current user');
    }

    const appointmentData = appointment.toJSON();
    const [service, business] = await Promise.all([
      this.serviceRepository.findById(appointmentData.serviceId),
      this.businessRepository.get(),
    ]);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.icsGenerator.generate({
      id: appointmentData.id,
      serviceName: service.toJSON().name,
      businessName: business?.toJSON().name ?? 'Smart Booking',
      startAt: appointmentData.startAt,
      endAt: appointmentData.endAt,
    });
  }
}
