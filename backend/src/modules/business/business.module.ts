import { Module } from '@nestjs/common';
import { GetBusinessUseCase } from './application/get-business.use-case';
import { UpdateBusinessUseCase } from './application/update-business.use-case';
import { UploadLogoUseCase } from './application/upload-logo.use-case';
import { BUSINESS_REPOSITORY } from './domain/ports/business.repository.port';
import { STORAGE_PORT } from './domain/ports/storage.port';
import { PrismaBusinessRepository } from './infrastructure/persistence/prisma-business.repository';
import { LocalStorageAdapter } from './infrastructure/storage/local-storage.adapter';
import { BusinessController } from './presentation/business.controller';

@Module({
  controllers: [BusinessController],
  providers: [
    GetBusinessUseCase,
    UpdateBusinessUseCase,
    UploadLogoUseCase,
    {
      provide: BUSINESS_REPOSITORY,
      useClass: PrismaBusinessRepository,
    },
    {
      provide: STORAGE_PORT,
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [BUSINESS_REPOSITORY],
})
export class BusinessModule {}
