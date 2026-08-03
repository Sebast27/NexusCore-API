import { IpAddress } from '../../../src/domain/value-objects/IpAddress';

describe('IpAddress', () => {
  describe('create', () => {
    it('should create valid IPv4 address', () => {
      const ip = IpAddress.create('192.168.1.1');
      expect(ip.getValue()).toBe('192.168.1.1');
    });

    it('should create valid IPv6 address', () => {
      const ip = IpAddress.create('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
      expect(ip.getValue()).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    });

    it('should throw error for invalid IP', () => {
      expect(() => IpAddress.create('invalid')).toThrow(
        'Invalid IP address format'
      );
    });

    it('should throw error for empty IP', () => {
      expect(() => IpAddress.create('')).toThrow(
        'IP address cannot be empty'
      );
    });
  });

  describe('equals', () => {
    it('should return true for same IP', () => {
      const ip1 = IpAddress.create('192.168.1.1');
      const ip2 = IpAddress.create('192.168.1.1');
      expect(ip1.equals(ip2)).toBe(true);
    });

    it('should return false for different IP', () => {
      const ip1 = IpAddress.create('192.168.1.1');
      const ip2 = IpAddress.create('192.168.1.2');
      expect(ip1.equals(ip2)).toBe(false);
    });
  });
});