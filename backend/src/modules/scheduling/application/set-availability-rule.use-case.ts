import { Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
  SetAvailabilityRuleData,
} from '../domain/ports/availability.repository.port';
import { AvailabilityRuleResponse } from './scheduling-response';

@Injectable()
export class SetAvailabilityRuleUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: AvailabilityRepositoryPort,
  ) {}

  list(): Promise<AvailabilityRuleResponse[]> {
    return this.availabilityRepository
      .listRules()
      .then((rules) => rules.map((rule) => rule.toJSON()));
  }

  async replace(
    rules: SetAvailabilityRuleData[],
  ): Promise<AvailabilityRuleResponse[]> {
    const savedRules = await this.availabilityRepository.replaceRules(rules);

    return savedRules.map((rule) => rule.toJSON());
  }
}
