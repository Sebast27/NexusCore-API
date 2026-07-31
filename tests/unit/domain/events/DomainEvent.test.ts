import { DomainEvent } from '../../../../src/domain/events/DomainEvent';

// Clase concreta para testear la interfaz
class TestEvent implements DomainEvent {
  public readonly eventName = 'test.event';
  public readonly occurredOn: Date;

  constructor() {
    this.occurredOn = new Date();
  }
}

describe('DomainEvent Interface', () => {
  it('should have eventName property', () => {
    const event = new TestEvent();
    expect(event.eventName).toBe('test.event');
  });

  it('should have occurredOn property', () => {
    const event = new TestEvent();
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('should set occurredOn to current date', () => {
    const before = new Date();
    const event = new TestEvent();
    const after = new Date();

    expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});