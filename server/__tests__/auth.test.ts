import { describe, it, expect } from 'vitest';
import { signupSchema, exploreFiltersSchema } from '@shared/schema';
import { calculatePlatformFee } from '../stripe';

describe('signupSchema', () => {
  it('validates correct input', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    expect(result.success).toBe(true);
  });

  it('rejects email without @', () => {
    const result = signupSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password under 8 chars', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
    });
    expect(result.success).toBe(false);
  });
});

describe('exploreFiltersSchema', () => {
  it('provides defaults for page and pageSize', () => {
    const result = exploreFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
  });
});

describe('calculatePlatformFee', () => {
  it('returns correct fee for 10000 cents', () => {
    const fee = calculatePlatformFee(10000);
    expect(fee).toBe(1280);
  });

  it('returns 0 for 0 cents', () => {
    const fee = calculatePlatformFee(0);
    expect(fee).toBe(0);
  });

  it('rounds to nearest cent', () => {
    const fee = calculatePlatformFee(100);
    expect(fee).toBe(13); // 100 * 0.128 = 12.8 → 13
  });
});
