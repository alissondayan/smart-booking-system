import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../domain/ports/service.repository.port';
import {
  ServiceResponse,
  toServiceResponse,
  toServiceResponses,
} from './service-response';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
  ) {}

  async listActive(): Promise<ServiceResponse[]> {
    const services = await this.serviceRepository.listActive();

    return toServiceResponses(services);
  }

  async listAll(): Promise<ServiceResponse[]> {
    const services = await this.serviceRepository.listAll();

    return toServiceResponses(services);
  }

  async getActiveById(id: string): Promise<ServiceResponse> {
    const service = await this.serviceRepository.findActiveById(id);

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return toServiceResponse(service);
  }
}
