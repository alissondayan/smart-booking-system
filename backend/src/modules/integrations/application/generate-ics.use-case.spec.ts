import { GenerateIcsUseCase } from './generate-ics.use-case';
import { AppointmentEntity } from '../../scheduling/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import { BusinessEntity } from '../../business/domain/entities/business.entity';
import { IcsGeneratorService } from '../infrastructure/ics/ics-generator.service';

describe('GenerateIcsUseCase', () => {
  it('generates an RFC 5545 calendar event for the appointment owner', async () => {
    const useCase = new GenerateIcsUseCase(
      {
        findById: jest.fn().mockResolvedValue(
          new AppointmentEntity({
            id: 'appointment-id',
            serviceId: 'service-id',
            customerId: 'customer-id',
            startAt: new Date('2026-06-20T09:00:00.000Z'),
            endAt: new Date('2026-06-20T09:30:00.000Z'),
            status: AppointmentStatus.CONFIRMED,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      } as never,
      {
        findById: jest.fn().mockResolvedValue(
          new ServiceEntity({
            id: 'service-id',
            name: 'Haircut',
            durationMinutes: 30,
            price: 100,
            isActive: true,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      } as never,
      {
        get: jest.fn().mockResolvedValue(
          new BusinessEntity({
            id: 'business-id',
            name: 'Smart Studio',
            phone: '+972501234567',
            email: 'hello@example.com',
            timezone: 'Asia/Jerusalem',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      } as never,
      new IcsGeneratorService(),
    );

    const ics = await useCase.execute({
      appointmentId: 'appointment-id',
      userId: 'customer-id',
      role: UserRole.CUSTOMER,
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Haircut');
    expect(ics).toContain('DESCRIPTION:Appointment at Smart Studio');
  });
});
