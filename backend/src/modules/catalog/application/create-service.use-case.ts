import { Inject, Injectable } from '@nestjs/common';
import {
  CreateServiceData,
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../domain/ports/service.repository.port';
import { ServiceResponse, toServiceResponse } from './service-response';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
  ) {}

  async execute(data: CreateServiceData): Promise<ServiceResponse> {
    const service = await this.serviceRepository.create(data);

    return toServiceResponse(service);
  }
}
