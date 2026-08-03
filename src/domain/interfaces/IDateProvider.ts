
export interface IDateProvider {
  now(): Date;
  addMinutes(date: Date, minutes: number): Date;
  addHours(date: Date, hours: number): Date;
  addDays(date: Date, days: number): Date;
  isAfter(date1: Date, date2: Date): boolean;
  isBefore(date1: Date, date2: Date): boolean;
}