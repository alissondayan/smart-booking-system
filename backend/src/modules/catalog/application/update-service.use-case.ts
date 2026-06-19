import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
  UpdateServiceData,
} from '../domain/ports/service.repository.port';
import { ServiceResponse, toServiceResponse } from './service-response';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateServiceData): Promise<ServiceResponse> {
    const service = await this.serviceRepository.update(id, data);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return toServiceResponse(service);
  }
}
