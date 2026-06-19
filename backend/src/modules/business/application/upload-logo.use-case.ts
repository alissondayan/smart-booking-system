import { Inject, Injectable } from '@nestjs/common';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
} from '../domain/ports/business.repository.port';
import { StoredFile, STORAGE_PORT, StoragePort } from '../domain/ports/storage.port';
import { BusinessResponse, toBusinessResponse } from './business-response';

@Injectable()
export class UploadLogoUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
    @Inject(STORAGE_PORT)
    private readonly storage: StoragePort,
  ) {}

  async execute(file: StoredFile): Promise<BusinessResponse> {
    const logoUrl = await this.storage.saveBusinessLogo(file);
    const business = await this.businessRepository.updateLogo(logoUrl);

    return toBusinessResponse(business);
  }
}
