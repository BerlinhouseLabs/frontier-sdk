import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageAccess } from '../../access/storage';
import type { FrontierSDK } from '../../sdk';

describe('StorageAccess', () => {
  let storage: StorageAccess;
  let mockSDK: FrontierSDK;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = vi.fn();
    mockSDK = {
      request: mockRequest,
    } as any;

    storage = new StorageAccess(mockSDK);
  });

  describe('get', () => {
    it('should call SDK request with storage:get type', async () => {
      mockRequest.mockResolvedValue('test-value');

      const result = await storage.get('test-key');

      expect(mockRequest).toHaveBeenCalledWith('storage:get', { key: 'test-key' });
      expect(result).toBe('test-value');
    });

    it('should handle null values', async () => {
      mockRequest.mockResolvedValue(null);

      const result = await storage.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle undefined values', async () => {
      mockRequest.mockResolvedValue(undefined);

      const result = await storage.get('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle complex objects', async () => {
      const complexObject = {
        nested: { data: 'value' },
        array: [1, 2, 3],
      };
      mockRequest.mockResolvedValue(complexObject);

      const result = await storage.get('complex-key');

      expect(result).toEqual(complexObject);
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Permission denied'));

      await expect(storage.get('test-key')).rejects.toThrow('Permission denied');
    });
  });

  describe('set', () => {
    it('should call SDK request with storage:set type', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('test-key', 'test-value');

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'test-key',
        value: 'test-value',
      });
    });

    it('should handle string values', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('key', 'string-value');

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'key',
        value: 'string-value',
      });
    });

    it('should handle number values', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('counter', 42);

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'counter',
        value: 42,
      });
    });

    it('should handle boolean values', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('flag', true);

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'flag',
        value: true,
      });
    });

    it('should handle object values', async () => {
      mockRequest.mockResolvedValue(undefined);
      const obj = { nested: { data: 'value' } };

      await storage.set('object-key', obj);

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'object-key',
        value: obj,
      });
    });

    it('should handle array values', async () => {
      mockRequest.mockResolvedValue(undefined);
      const arr = [1, 2, 3, 'four'];

      await storage.set('array-key', arr);

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'array-key',
        value: arr,
      });
    });

    it('should handle null values', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('null-key', null);

      expect(mockRequest).toHaveBeenCalledWith('storage:set', {
        key: 'null-key',
        value: null,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Permission denied'));

      await expect(storage.set('test-key', 'value')).rejects.toThrow('Permission denied');
    });

    it('should return void', async () => {
      mockRequest.mockResolvedValue(undefined);

      const result = await storage.set('key', 'value');

      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should call SDK request with storage:remove type', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.remove('test-key');

      expect(mockRequest).toHaveBeenCalledWith('storage:remove', { key: 'test-key' });
    });

    it('should handle removing non-existent keys', async () => {
      mockRequest.mockResolvedValue(undefined);

      await expect(storage.remove('non-existent')).resolves.not.toThrow();
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Permission denied'));

      await expect(storage.remove('test-key')).rejects.toThrow('Permission denied');
    });

    it('should return void', async () => {
      mockRequest.mockResolvedValue(undefined);

      const result = await storage.remove('key');

      expect(result).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should call SDK request with storage:clear type', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.clear();

      expect(mockRequest).toHaveBeenCalledWith('storage:clear');
    });

    it('should not pass any payload', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.clear();

      expect(mockRequest).toHaveBeenCalledWith('storage:clear');
      expect(mockRequest).not.toHaveBeenCalledWith('storage:clear', expect.anything());
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Permission denied'));

      await expect(storage.clear()).rejects.toThrow('Permission denied');
    });

    it('should return void', async () => {
      mockRequest.mockResolvedValue(undefined);

      const result = await storage.clear();

      expect(result).toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should support chaining operations', async () => {
      mockRequest.mockResolvedValue(undefined);

      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      await storage.remove('key1');

      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid successive calls', async () => {
      mockRequest.mockResolvedValue(undefined);

      const promises = [
        storage.set('key1', 'value1'),
        storage.set('key2', 'value2'),
        storage.set('key3', 'value3'),
      ];

      await Promise.all(promises);

      expect(mockRequest).toHaveBeenCalledTimes(3);
    });
  });
});
