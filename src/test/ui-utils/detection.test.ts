import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isInFrontierApp, getParentOrigin } from '../../ui-utils/detection';

describe('UI Utils - Detection', () => {
  let originalParent: Window;
  let originalReferrer: string;

  beforeEach(() => {
    originalParent = window.parent;
    originalReferrer = document.referrer;
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'parent', {
      value: originalParent,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document, 'referrer', {
      value: originalReferrer,
      writable: true,
      configurable: true,
    });
  });

  describe('isInFrontierApp', () => {
    it('should return false when not in iframe (parent === window)', () => {
      Object.defineProperty(window, 'parent', {
        value: window,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(false);
    });

    it('should return true for localhost:5173 origin', () => {
      // Mock parent window
      const mockParent = {
        location: {
          origin: 'http://localhost:5173',
        },
      };

      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(true);
    });

    it('should return true for production origin', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://wallet.frontiertower.io/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(true);
    });

    it('should return true for sandbox origin', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://sandbox.wallet.frontiertower.io/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(true);
    });

    it('should return true for alpha origin', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://alpha.wallet.frontiertower.io/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(true);
    });

    it('should return true for beta origin', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://beta.wallet.frontiertower.io/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(true);
    });

    it('should return false for unauthorized origin', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://evil.com/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(false);
    });

    it('should return false when no referrer and cross-origin parent', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true,
      });

      const mockParent = {
        location: {
          get origin() {
            throw new Error('Cross-origin access blocked');
          },
        },
      };

      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(isInFrontierApp()).toBe(false);
    });
  });

  describe('getParentOrigin', () => {
    it('should return null when not in iframe', () => {
      Object.defineProperty(window, 'parent', {
        value: window,
        writable: true,
        configurable: true,
      });

      expect(getParentOrigin()).toBeNull();
    });

    it('should return origin from referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://wallet.frontiertower.io/apps/test',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(getParentOrigin()).toBe('https://wallet.frontiertower.io');
    });

    it('should return origin from parent.location when accessible', () => {
      const mockParent = {
        location: {
          origin: 'http://localhost:5173',
        },
      };

      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(getParentOrigin()).toBe('http://localhost:5173');
    });

    it('should return null when no referrer and cross-origin parent', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true,
      });

      const mockParent = {
        location: {
          get origin() {
            throw new Error('Cross-origin access blocked');
          },
        },
      };

      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(getParentOrigin()).toBeNull();
    });

    it('should extract origin correctly from referrer with path', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://sandbox.wallet.frontiertower.io/apps/kickstarter?param=value',
        writable: true,
        configurable: true,
      });

      const mockParent = {};
      Object.defineProperty(window, 'parent', {
        value: mockParent,
        writable: true,
        configurable: true,
      });

      expect(getParentOrigin()).toBe('https://sandbox.wallet.frontiertower.io');
    });
  });
});
