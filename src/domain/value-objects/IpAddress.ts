import { ValidationError } from '../../application/errors/ValidationError';
import { InvalidIpAddressError } from '../errors/InvalidIpAddressError';

export class IpAddress {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): IpAddress {
    if (!value || value.trim() === '') {
      throw new ValidationError('ipAddress', 'IP address cannot be empty');
    }

    const trimmed = value.trim();

    // Validar IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(trimmed)) {
      const parts = trimmed.split('.').map(Number);
      if (parts.every(part => part >= 0 && part <= 255)) {
        return new IpAddress(trimmed);
      }
    }

    // Validar IPv6 (simplificado)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(trimmed)) {
      return new IpAddress(trimmed);
    }

    throw new InvalidIpAddressError(trimmed,'Invalid IP address format. Must be valid IPv4 or IPv6');
  }

  getValue(): string {
    return this.value;
  }

  equals(other: IpAddress): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.getValue();
  }
}