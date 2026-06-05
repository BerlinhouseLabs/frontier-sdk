import { describe, it, expect } from 'vitest';
import { parseAmount, formatAmount, FND_DECIMALS, InvalidAmountError } from '../token-amount';

describe('FND_DECIMALS', () => {
  it('is 18', () => {
    expect(FND_DECIMALS).toBe(18);
  });
});

describe('parseAmount', () => {
  it('parses a decimal string to base units (default FND decimals)', () => {
    expect(parseAmount('75.5')).toBe(75500000000000000000n);
  });

  it('parses an integer string', () => {
    expect(parseAmount('75')).toBe(75000000000000000000n);
  });

  it('parses zero', () => {
    expect(parseAmount('0')).toBe(0n);
  });

  it('honors a custom decimals argument (e.g. USDC=6)', () => {
    expect(parseAmount('1.5', 6)).toBe(1500000n);
  });

  it('preserves full 18-dp precision without float loss', () => {
    expect(parseAmount('123456789.123456789012345678')).toBe(
      123456789123456789012345678n,
    );
  });

  it('rejects a currency symbol', () => {
    expect(() => parseAmount('$75.00')).toThrow(InvalidAmountError);
  });

  it('rejects a comma decimal separator', () => {
    expect(() => parseAmount('75,00')).toThrow(InvalidAmountError);
  });

  it('rejects an empty string', () => {
    expect(() => parseAmount('')).toThrow(InvalidAmountError);
  });

  it('rejects more fractional digits than the token supports', () => {
    expect(() => parseAmount('1.0000000000000000001')).toThrow(InvalidAmountError);
  });

  it('rejects a trailing dot', () => {
    expect(() => parseAmount('75.')).toThrow(InvalidAmountError);
  });

  it('parses a leading-zero fractional value (custom decimals)', () => {
    expect(parseAmount('0.000001', 6)).toBe(1n);
  });

  it('parses a negative amount (custom decimals)', () => {
    expect(parseAmount('-1.5', 6)).toBe(-1500000n);
  });
});

describe('formatAmount', () => {
  it('formats base units to an exact decimal string', () => {
    expect(formatAmount(75500000000000000000n)).toBe('75.5');
  });

  it('drops the fractional part when zero', () => {
    expect(formatAmount(75000000000000000000n)).toBe('75');
  });

  it('formats zero', () => {
    expect(formatAmount(0n)).toBe('0');
  });

  it('trims trailing zeros', () => {
    expect(formatAmount(75100000000000000000n)).toBe('75.1');
  });

  it('honors a custom decimals argument', () => {
    expect(formatAmount(1500000n, 6)).toBe('1.5');
  });

  it('formats a sub-unit amount with leading-zero padding', () => {
    expect(formatAmount(1n)).toBe('0.000000000000000001');
  });

  it('formats a negative amount', () => {
    expect(formatAmount(-1500000n, 6)).toBe('-1.5');
  });
});

describe('round-trip', () => {
  it('parseAmount(formatAmount(x)) === x', () => {
    for (const x of [0n, 1n, 75500000000000000000n, 123456789123456789012345678n]) {
      expect(parseAmount(formatAmount(x))).toBe(x);
    }
  });
});
