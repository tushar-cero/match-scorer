import {
  validatePlayerName,
  validateTournamentName,
  validateScore,
  sanitizeInput,
} from '@/lib/validation';

describe('Input Validation', () => {
  describe('validatePlayerName', () => {
    it('should accept valid player names', () => {
      expect(validatePlayerName('John Doe')).toBeNull();
      expect(validatePlayerName('Alice')).toBeNull();
      expect(validatePlayerName("O'Brien")).toBeNull();
    });

    it('should reject empty names', () => {
      const result = validatePlayerName('');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('required');
    });

    it('should reject names exceeding max length', () => {
      const longName = 'a'.repeat(51);
      const result = validatePlayerName(longName);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('50 characters');
    });

    it('should reject invalid characters', () => {
      const result = validatePlayerName('John<script>');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('letters, numbers');
    });
  });

  describe('validateTournamentName', () => {
    it('should accept valid tournament names', () => {
      expect(validateTournamentName('Championship 2024')).toBeNull();
      expect(validateTournamentName('Regional Finals')).toBeNull();
    });

    it('should reject empty names', () => {
      const result = validateTournamentName('');
      expect(result).not.toBeNull();
    });

    it('should reject names exceeding max length', () => {
      const longName = 'a'.repeat(101);
      const result = validateTournamentName(longName);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('100 characters');
    });
  });

  describe('validateScore', () => {
    it('should accept valid scores', () => {
      expect(validateScore(0)).toBeNull();
      expect(validateScore(11)).toBeNull();
      expect(validateScore(999)).toBeNull();
    });

    it('should reject negative scores', () => {
      const result = validateScore(-1);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('at least 0');
    });

    it('should reject scores exceeding max', () => {
      const result = validateScore(1000);
      expect(result).not.toBeNull();
      expect(result?.message).toContain('999');
    });

    it('should accept string numbers', () => {
      expect(validateScore('11')).toBeNull();
    });

    it('should reject invalid strings', () => {
      const result = validateScore('abc');
      expect(result).not.toBeNull();
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  John  ')).toBe('John');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeInput('John<script>')).toBe('Johnscript');
    });

    it('should truncate to max length', () => {
      const longString = 'a'.repeat(60);
      const result = sanitizeInput(longString);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });
});
