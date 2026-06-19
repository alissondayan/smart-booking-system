import { Module } from '@nestjs/common';
import { GetCustomerUseCase } from './application/get-customer.use-case';
import { ListCustomersUseCase } from './application/list-customers.use-case';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository.port';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository';
import { AdminCustomersController } from './presentation/admin-customers.controller';

@Module({
  controllers: [AdminCustomersController],
  providers: [
    ListCustomersUseCase,
    GetCustomerUseCase,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
})
export class CustomersModule {}
