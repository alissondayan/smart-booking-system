import { Module } from '@nestjs/common';
import { CreateServiceUseCase } from './application/create-service.use-case';
import { DeleteServiceUseCase } from './application/delete-service.use-case';
import { ListServicesUseCase } from './application/list-services.use-case';
import { UpdateServiceUseCase } from './application/update-service.use-case';
import { SERVICE_REPOSITORY } from './domain/ports/service.repository.port';
import { PrismaServiceRepository } from './infrastructure/persistence/prisma-service.repository';
import { AdminServicesController } from './presentation/admin-services.controller';
import { ServicesController } from './presentation/services.controller';

@Module({
  controllers: [ServicesController, AdminServicesController],
  providers: [
    ListServicesUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
  ],
  exports: [SERVICE_REPOSITORY],
})
export class CatalogModule {}
