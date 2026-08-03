import { RealDateProvider } from '../../../../../src/infrastructure/adapters/date/RealDateProvider';

describe('RealDateProvider', () => {
  let dateProvider: RealDateProvider;

  beforeEach(() => {
    dateProvider = new RealDateProvider();
  });

  it('should return current date', () => {
    const before = new Date();
    const now = dateProvider.now();
    const after = new Date();

    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should return different dates on different calls', () => {
    const date1 = dateProvider.now();
    // Pequeña pausa
    const date2 = dateProvider.now();

    expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
  });
});