import { IDateProvider } from '../../../domain/interfaces/IDateProvider';

export class RealDateProvider implements IDateProvider {
  now(): Date {
    return new Date();
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
}