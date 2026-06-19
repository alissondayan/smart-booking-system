export abstract class DomainEvent {
  readonly occurredAt: Date;

  protected constructor(
    readonly aggregateId: string,
    occurredAt: Date = new Date(),
  ) {
    this.occurredAt = occurredAt;
  }

  abstract readonly eventName: string;
}
