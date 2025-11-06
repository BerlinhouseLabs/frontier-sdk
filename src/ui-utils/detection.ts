/**
 * List of allowed Frontier Wallet origins
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://sandbox.wallet.frontiertower.io',
  'https://alpha.wallet.frontiertower.io',
  'https://beta.wallet.frontiertower.io',
  'https://wallet.frontiertower.io',
];

/**
 * Check if the app is running inside a Frontier Wallet iframe
 * Verifies both that it's in an iframe and that the parent origin is allowed
 */
export function isInFrontierApp(): boolean {
  // Check if running in iframe
  if (window.parent === window) {
    return false;
  }

  try {
    // Try to get parent origin (may throw if cross-origin)
    const parentOrigin = document.referrer ? new URL(document.referrer).origin : null;
    
    if (parentOrigin && ALLOWED_ORIGINS.includes(parentOrigin)) {
      return true;
    }

    // Fallback: check if we can access parent (same-origin)
    // This works for localhost development
    if (window.parent.location.origin && ALLOWED_ORIGINS.includes(window.parent.location.origin)) {
      return true;
    }
  } catch (e) {
    // Cross-origin access blocked - check referrer as fallback
    if (document.referrer) {
      const referrerOrigin = new URL(document.referrer).origin;
      return ALLOWED_ORIGINS.includes(referrerOrigin);
    }
  }

  return false;
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
