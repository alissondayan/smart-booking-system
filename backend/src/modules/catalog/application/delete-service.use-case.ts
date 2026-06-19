import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../domain/ports/service.repository.port';
import { ServiceResponse, toServiceResponse } from './service-response';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
  ) {}

  async execute(id: string): Promise<ServiceResponse> {
    const service = await this.serviceRepository.deactivate(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return toServiceResponse(service);
  }
}
