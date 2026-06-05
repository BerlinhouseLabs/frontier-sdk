/** Decimals for the Frontier Dollar (FND) token. */
export const FND_DECIMALS = 18;

/** Thrown when a string cannot be parsed as a plain base-10 token amount. */
export class InvalidAmountError extends Error {
  constructor(value: unknown) {
    super(`Invalid token amount: ${JSON.stringify(value)}`);
    this.name = 'InvalidAmountError';
  }
}

/**
 * Parse a plain decimal string (e.g. "75.5") into a bigint in base units.
 *
 * Symbol-free and locale-free by design: rejects currency symbols, thousand
 * separators, and comma decimals so a display string can never be mistaken for
 * an amount. Callers normalize locale input (e.g. "," -> ".") before calling.
 */
export function parseAmount(value: string, decimals: number = FND_DECIMALS): bigint {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new InvalidAmountError(value);
  }
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart = ''] = unsigned.split('.');
  if (fracPart.length > decimals) {
    throw new InvalidAmountError(value);
  }
  const combined = `${intPart}${fracPart.padEnd(decimals, '0')}`;
  const magnitude = BigInt(combined);
  return negative ? -magnitude : magnitude;
}

/**
 * Format a bigint base-unit amount into an exact, symbol-free decimal string
 * (e.g. "75.5"). Full precision, trailing zeros trimmed. Round-trips with
 * parseAmount. Display concerns (rounding, "$", separators) belong to the caller.
 */
export function formatAmount(amount: bigint, decimals: number = FND_DECIMALS): string {
  const negative = amount < 0n;
  const magnitude = negative ? -amount : amount;
  const base = 10n ** BigInt(decimals);
  const intPart = (magnitude / base).toString();
  const fracDigits = (magnitude % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  const result = fracDigits ? `${intPart}.${fracDigits}` : intPart;
  return negative ? `-${result}` : result;
}
