import { DomainError } from './DomainError';

export class InvalidIpAddressError extends DomainError {
  constructor(ip: string, reason?: string) {
    super(
      `Invalid IP address: ${ip}${reason ? ` - ${reason}` : ''}`,
      'INVALID_IP_ADDRESS',
      { ip, reason }
    );
  }
}