import { LoginAttempt } from '../../entities/LoginAttempt';
import { Email } from '../../value-objects/Email';
import { IpAddress } from '../../value-objects/IpAddress';
import { UserId } from '../../value-objects/UserId';

export interface ILoginAttemptRepository {
  save(attempt: LoginAttempt): Promise<void>;
  saveMany(attempts: LoginAttempt[]): Promise<void>;
  findByEmail(email: Email, limit?: number): Promise<LoginAttempt[]>;
  findByIpAddress(ip: IpAddress, limit?: number): Promise<LoginAttempt[]>;
  findByUserId(userId: UserId, limit?: number): Promise<LoginAttempt[]>;
  getRecentFailures(email: Email, minutes: number): Promise<number>;
  getFailuresByIp(ip: IpAddress, minutes: number): Promise<number>;
}