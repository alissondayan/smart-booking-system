import { Inject, Injectable } from '@nestjs/common';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
  UpsertBusinessData,
} from '../domain/ports/business.repository.port';
import { BusinessResponse, toBusinessResponse } from './business-response';

@Injectable()
export class UpdateBusinessUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
  ) {}

  async execute(data: UpsertBusinessData): Promise<BusinessResponse> {
    const business = await this.businessRepository.upsert(data);

    return toBusinessResponse(business);
  }
}
