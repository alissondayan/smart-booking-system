import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
} from '../domain/ports/business.repository.port';
import { BusinessResponse, toBusinessResponse } from './business-response';

@Injectable()
export class GetBusinessUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
  ) {}

  async execute(): Promise<BusinessResponse> {
    const business = await this.businessRepository.get();

    if (!business) {
      throw new NotFoundException('Business profile is not configured');
    }

    return toBusinessResponse(business);
  }
}
