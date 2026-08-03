import { IDateProvider } from '../../src/domain/interfaces/IDateProvider';

export class MockDateProvider implements IDateProvider {
  private fixedDate: Date;

  constructor(fixedDate?: Date) {
    this.fixedDate = fixedDate || new Date('2024-01-15T10:00:00.000Z');
  }

  now(): Date {
    return new Date(this.fixedDate);
  }

  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  // ✅ Método para cambiar la fecha fija en tests
  setFixedDate(date: Date): void {
    this.fixedDate = date;
  }
}