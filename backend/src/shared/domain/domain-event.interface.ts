export interface DomainEvent {
  occurredOn: Date;
  aggregateId: string;
}
