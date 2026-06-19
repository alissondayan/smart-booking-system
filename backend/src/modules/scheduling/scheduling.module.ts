import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { CatalogModule } from '../catalog/catalog.module';
import { BookAppointmentUseCase } from './application/book-appointment.use-case';
import { CancelAppointmentUseCase } from './application/cancel-appointment.use-case';
import { CreateBlockedTimeUseCase } from './application/create-blocked-time.use-case';
import { CreateHolidayUseCase } from './application/create-holiday.use-case';
import { GetAvailableSlotsUseCase } from './application/get-available-slots.use-case';
import { ListAdminAppointmentsUseCase } from './application/list-admin-appointments.use-case';
import { ListMyAppointmentsUseCase } from './application/list-my-appointments.use-case';
import { RescheduleAppointmentUseCase } from './application/reschedule-appointment.use-case';
import { SetAvailabilityRuleUseCase } from './application/set-availability-rule.use-case';
import { SetDateAvailabilityUseCase } from './application/set-date-availability.use-case';
import { APPOINTMENT_REPOSITORY } from './domain/ports/appointment.repository.port';
import { AVAILABILITY_REPOSITORY } from './domain/ports/availability.repository.port';
import { SLOT_HOLD } from './domain/ports/slot-hold.port';
import { SLOT_STRATEGY } from './domain/ports/slot-strategy.port';
import { RedisSlotHoldAdapter } from './infrastructure/cache/redis-slot-hold.adapter';
import { PrismaAppointmentRepository } from './infrastructure/persistence/prisma-appointment.repository';
import { PrismaAvailabilityRepository } from './infrastructure/persistence/prisma-availability.repository';
import { SimpleSlotStrategy } from './infrastructure/strategies/simple-slot.strategy';
import { AdminAppointmentsController } from './presentation/admin-appointments.controller';
import { AdminAvailabilityController } from './presentation/admin-availability.controller';
import { AppointmentsController } from './presentation/appointments.controller';
import { AvailabilityController } from './presentation/availability.controller';
import { MyAppointmentsController } from './presentation/my-appointments.controller';

@Module({
  imports: [BusinessModule, CatalogModule],
  controllers: [
    AvailabilityController,
    AppointmentsController,
    MyAppointmentsController,
    AdminAppointmentsController,
    AdminAvailabilityController,
  ],
  providers: [
    GetAvailableSlotsUseCase,
    BookAppointmentUseCase,
    CancelAppointmentUseCase,
    RescheduleAppointmentUseCase,
    ListMyAppointmentsUseCase,
    ListAdminAppointmentsUseCase,
    SetAvailabilityRuleUseCase,
    SetDateAvailabilityUseCase,
    CreateBlockedTimeUseCase,
    CreateHolidayUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: PrismaAvailabilityRepository,
    },
    {
      provide: SLOT_HOLD,
      useClass: RedisSlotHoldAdapter,
    },
    {
      provide: SLOT_STRATEGY,
      useClass: SimpleSlotStrategy,
    },
  ],
})
export class SchedulingModule {}
