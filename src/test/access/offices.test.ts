import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  OfficesAccess,
  type AccessPass,
  type CreateAccessPassRequest,
  type ListAccessPassesParams,
} from '../../access/offices';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

const mockAccessPass: AccessPass = {
  id: 1,
  email: 'visitor@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  status: 'active',
  membershipContract: 5,
  contractReference: 'REF-001',
  createdAt: '2026-01-15T10:00:00Z',
  revokedAt: null,
  updatedAt: '2026-01-15T10:00:00Z',
};

describe('OfficesAccess', () => {
  let officesAccess: OfficesAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    officesAccess = new OfficesAccess(mockSDK);
  });

  describe('createAccessPass', () => {
    it('should request creation with correct payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockAccessPass);

      const payload: CreateAccessPassRequest = {
        email: 'visitor@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        membershipContract: 5,
      };
      const result = await officesAccess.createAccessPass(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('offices:createAccessPass', payload);
      expect(result).toEqual(mockAccessPass);
    });

    it('should propagate validation errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('You are not authorized to use this contract.'));

      await expect(
        officesAccess.createAccessPass({
          email: 'x@y.com',
          firstName: 'A',
          lastName: 'B',
          membershipContract: 999,
        })
      ).rejects.toThrow('not authorized');
    });
  });

  describe('listAccessPasses', () => {
    it('should request with pagination and filter params', async () => {
      const mockResponse: PaginatedResponse<AccessPass> = {
        count: 1,
        results: [mockAccessPass],
      };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const params: ListAccessPassesParams = { limit: 20, offset: 0, includeRevoked: true };
      const result = await officesAccess.listAccessPasses(params);

      expect(mockSDK.request).toHaveBeenCalledWith('offices:listAccessPasses', params);
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<AccessPass> = { count: 0, results: [] };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await officesAccess.listAccessPasses();

      expect(mockSDK.request).toHaveBeenCalledWith('offices:listAccessPasses', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(officesAccess.listAccessPasses()).rejects.toThrow('Permission denied');
    });
  });

  describe('getAccessPass', () => {
    it('should request by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockAccessPass);

      const result = await officesAccess.getAccessPass({ id: 1 });

      expect(mockSDK.request).toHaveBeenCalledWith('offices:getAccessPass', { id: 1 });
      expect(result).toEqual(mockAccessPass);
    });

    it('should propagate 404 errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not found'));

      await expect(officesAccess.getAccessPass({ id: 999 })).rejects.toThrow('Not found');
    });
  });

  describe('revokeAccessPass', () => {
    it('should request revocation by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await officesAccess.revokeAccessPass({ id: 1 });

      expect(mockSDK.request).toHaveBeenCalledWith('offices:revokeAccessPass', { id: 1 });
    });

    it('should propagate error if already revoked', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Access pass is already revoked.'));

      await expect(officesAccess.revokeAccessPass({ id: 1 })).rejects.toThrow('already revoked');
    });
  });
});
