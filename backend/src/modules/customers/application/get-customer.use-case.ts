import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  CustomerDetails,
  CustomerRepositoryPort,
} from '../domain/ports/customer.repository.port';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<CustomerDetails> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}
