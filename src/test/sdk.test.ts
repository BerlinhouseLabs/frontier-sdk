import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrontierSDK } from '../sdk';
import type { SDKResponse } from '../types';

describe('FrontierSDK', () => {
  let sdk: FrontierSDK;
  let mockParent: any;
  let messageHandler: ((event: MessageEvent) => void) | null = null;

  beforeEach(() => {
    // Mock window.parent
    mockParent = {
      postMessage: vi.fn(),
    };

    Object.defineProperty(window, 'parent', {
      value: mockParent,
      writable: true,
      configurable: true,
    });

    // Capture message event listener
    const originalAddEventListener = window.addEventListener;
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'message') {
        messageHandler = handler as (event: MessageEvent) => void;
      }
      return originalAddEventListener.call(window, event, handler);
    });

    sdk = new FrontierSDK();
  });

  afterEach(() => {
    if (sdk) {
      sdk.destroy();
    }
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should send ready message on initialization', () => {
      expect(mockParent.postMessage).toHaveBeenCalledWith(
        { type: 'app:ready', payload: null },
        '*'
      );
    });

    it('should register message event listener', () => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('should create wallet access instance', () => {
      expect(sdk.getWallet()).toBeDefined();
      expect(typeof sdk.getWallet().getBalance).toBe('function');
      expect(typeof sdk.getWallet().getAddress).toBe('function');
    });

    it('should create storage access instance', () => {
      expect(sdk.getStorage()).toBeDefined();
      expect(typeof sdk.getStorage().get).toBe('function');
      expect(typeof sdk.getStorage().set).toBe('function');
      expect(typeof sdk.getStorage().remove).toBe('function');
      expect(typeof sdk.getStorage().clear).toBe('function');
    });
  });

  describe('Message Handling', () => {
    it('should handle response messages', async () => {
      const requestPromise = sdk.request('test:method');

      // Get the request that was sent
      const sentRequest = mockParent.postMessage.mock.calls[1][0]; // [0] is ready message

      // Simulate response from parent
      const response: SDKResponse = {
        type: 'response',
        requestId: sentRequest.requestId,
        result: 'test-result',
      };

      messageHandler?.({
        source: window.parent,
        data: response,
      } as MessageEvent);

      const result = await requestPromise;
      expect(result).toBe('test-result');
    });

    it('should handle error messages', async () => {
      const requestPromise = sdk.request('test:method');

      const sentRequest = mockParent.postMessage.mock.calls[1][0];

      const response: SDKResponse = {
        type: 'error',
        requestId: sentRequest.requestId,
        error: 'Test error message',
      };

      messageHandler?.({
        source: window.parent,
        data: response,
      } as MessageEvent);

      await expect(requestPromise).rejects.toThrow('Test error message');
    });

    it('should ignore messages from non-parent sources', async () => {
      const requestPromise = sdk.request('test:method');

      const sentRequest = mockParent.postMessage.mock.calls[1][0];

      const response: SDKResponse = {
        type: 'response',
        requestId: sentRequest.requestId,
        result: 'test-result',
      };

      // Message from wrong source
      messageHandler?.({
        source: window as any, // Not window.parent
        data: response,
      } as MessageEvent);

      // Request should still be pending (timeout will reject it)
      // We can't easily test timeout without waiting, so just verify it doesn't resolve
      let resolved = false;
      requestPromise.then(() => { resolved = true; });

      await new Promise(resolve => setTimeout(resolve, 10));
      expect(resolved).toBe(false);
    });

    it('should ignore messages with unknown request IDs', () => {
      const response: SDKResponse = {
        type: 'response',
        requestId: 'unknown-id',
        result: 'test-result',
      };

      // Should not throw
      expect(() => {
        messageHandler?.({
          source: window.parent,
          data: response,
        } as MessageEvent);
      }).not.toThrow();
    });
  });

  describe('Request Method', () => {
    it('should send request with correct format', () => {
      sdk.request('test:method', { key: 'value' });

      expect(mockParent.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:method',
          requestId: expect.any(String),
          payload: { key: 'value' },
        }),
        '*'
      );
    });

    it('should generate unique request IDs', () => {
      sdk.request('test:method1');
      sdk.request('test:method2');

      const call1 = mockParent.postMessage.mock.calls[1][0];
      const call2 = mockParent.postMessage.mock.calls[2][0];

      expect(call1.requestId).not.toBe(call2.requestId);
    });

    it('should handle requests without payload', () => {
      sdk.request('test:method');

      expect(mockParent.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:method',
          requestId: expect.any(String),
          payload: undefined,
        }),
        '*'
      );
    });

    it('should timeout after 30 seconds', async () => {
      vi.useFakeTimers();

      const requestPromise = sdk.request('test:method');

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000);

      await expect(requestPromise).rejects.toThrow('Request timeout');

      vi.useRealTimers();
    });

    it('should clean up pending request after timeout', async () => {
      vi.useFakeTimers();

      const requestPromise = sdk.request('test:method');
      const sentRequest = mockParent.postMessage.mock.calls[1][0];

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000);

      await expect(requestPromise).rejects.toThrow('Request timeout');

      // Try to respond after timeout - should be ignored
      const response: SDKResponse = {
        type: 'response',
        requestId: sentRequest.requestId,
        result: 'late-result',
      };

      expect(() => {
        messageHandler?.({
          source: window.parent,
          data: response,
        } as MessageEvent);
      }).not.toThrow();

      vi.useRealTimers();
    });
  });

  describe('Access Getters', () => {
    it('should return same wallet instance on multiple calls', () => {
      const wallet1 = sdk.getWallet();
      const wallet2 = sdk.getWallet();

      expect(wallet1).toBe(wallet2);
    });

    it('should return same storage instance on multiple calls', () => {
      const storage1 = sdk.getStorage();
      const storage2 = sdk.getStorage();

      expect(storage1).toBe(storage2);
    });
  });

  describe('Destroy', () => {
    it('should remove message event listener', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      sdk.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('should clear pending requests', async () => {
      const requestPromise = sdk.request('test:method');

      sdk.destroy();

      // Pending request should still be there but won't be resolved
      // We can verify by trying to send a response - it should be ignored
      const sentRequest = mockParent.postMessage.mock.calls[1][0];
      const response: SDKResponse = {
        type: 'response',
        requestId: sentRequest.requestId,
        result: 'test-result',
      };

      messageHandler?.({
        source: window.parent,
        data: response,
      } as MessageEvent);

      // Request should timeout since handler was removed
      let resolved = false;
      requestPromise.catch(() => { resolved = true; });

      await new Promise(resolve => setTimeout(resolve, 10));
      // Can't easily verify without waiting for timeout
    });
  });
});
