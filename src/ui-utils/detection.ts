/**
 * List of allowed Frontier Wallet origins
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://sandbox.os.frontiertower.io',
  'https://alpha.os.frontiertower.io',
  'https://beta.os.frontiertower.io',
  'https://os.frontiertower.io',
];

/**
 * Check if the app is running inside a Frontier Wallet iframe
 * Simply checks if the window is embedded in an iframe
 */
export function isInFrontierApp(): boolean {
  return window.self !== window.top;
}

/**
 * Get the parent Frontier Wallet origin if available
 */
export function getParentOrigin(): string | null {
  try {
    if (window.parent !== window) {
      if (document.referrer) {
        return new URL(document.referrer).origin;
      }
      return window.parent.location.origin;
    }
  } catch (e) {
    if (document.referrer) {
      return new URL(document.referrer).origin;
    }
  }
  return null;
}
