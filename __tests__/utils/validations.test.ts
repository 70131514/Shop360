/**
 * Regression Tests for Validation Utilities
 * 
 * Test Suite: Validation Utilities Regression Tests
 * Purpose: Verify that validation functions work correctly after code changes
 * Coverage: Email validation
 */

import { isEmail } from '../../src/utils/validations';

describe('Validation Utilities - Regression Tests', () => {
  describe('RT-016: Email Validation', () => {
    it('should return true for strings containing @ symbol', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.com',
        'user_name@example-domain.com',
        '123@example.com',
        'user@subdomain.example.com',
        'user@example', // Current implementation only checks for @
        'a@b.co',
        'user@.com', // Current implementation only checks for @
      ];

      validEmails.forEach((email) => {
        expect(isEmail(email)).toBe(true);
      });
    });

    it('should return false for strings without @ symbol', () => {
      const invalidEmails = [
        'notanemail',
        '',
        'user name',
        '123456',
        'example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(isEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(isEmail('a@b.co')).toBe(true); // Contains @
      expect(isEmail('user@example')).toBe(true); // Contains @ (current implementation)
      expect(isEmail('user@.com')).toBe(true); // Contains @ (current implementation)
      expect(isEmail('@example.com')).toBe(true); // Contains @
      expect(isEmail('user@')).toBe(true); // Contains @
      expect(isEmail('')).toBe(false); // Empty string
      expect(isEmail('no at symbol')).toBe(false); // No @
    });
  });
});
