import { ServiceEntity, ServiceProps } from '../domain/entities/service.entity';

export type ServiceResponse = ServiceProps;

export function toServiceResponse(service: ServiceEntity): ServiceResponse {
  return service.toJSON();
}

export function toServiceResponses(services: ServiceEntity[]): ServiceResponse[] {
  return services.map(toServiceResponse);
}
