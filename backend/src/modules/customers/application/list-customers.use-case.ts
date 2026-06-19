import { Inject, Injectable } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
  PaginatedCustomers,
} from '../domain/ports/customer.repository.port';

export interface ListCustomersCommand {
  search?: string;
  page: number;
  limit: number;
}

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  execute(command: ListCustomersCommand): Promise<PaginatedCustomers> {
    return this.customerRepository.list(command);
  }
}
