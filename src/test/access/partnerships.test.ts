import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PartnershipsAccess,
  type SponsorPass,
  type CreateSponsorPassRequest,
  type Sponsor,
} from '../../access/partnerships';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

describe('PartnershipsAccess', () => {
  let partnershipsAccess: PartnershipsAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    partnershipsAccess = new PartnershipsAccess(mockSDK);
  });

  describe('createSponsorPass', () => {
    it('should request sponsor pass creation', async () => {
      const payload: CreateSponsorPassRequest = {
        sponsor: 123,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      };
      const mockPass = { id: 1 } as SponsorPass;

      vi.mocked(mockSDK.request).mockResolvedValue(mockPass);

      const result = await partnershipsAccess.createSponsorPass(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:createSponsorPass', payload);
      expect(result).toEqual(mockPass);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(partnershipsAccess.createSponsorPass({
        sponsor: 123,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      })).rejects.toThrow('Permission denied');
    });
  });

  describe('listActiveSponsorPasses', () => {
    it('should request active sponsor passes list', async () => {
      const mockResponse: PaginatedResponse<SponsorPass> = {
        count: 1,
        results: [{ id: 1 } as SponsorPass],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await partnershipsAccess.listActiveSponsorPasses({ limit: 10, offset: 0 });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:listActiveSponsorPasses', { limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<SponsorPass> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await partnershipsAccess.listActiveSponsorPasses();

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:listActiveSponsorPasses', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listSponsors', () => {
    it('should request sponsors list', async () => {
      const mockResponse: PaginatedResponse<Sponsor> = {
        count: 1,
        results: [{ id: 1 } as Sponsor],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await partnershipsAccess.listSponsors({ limit: 10, offset: 0 });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:listSponsors', { limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<Sponsor> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await partnershipsAccess.listSponsors();

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:listSponsors', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSponsor', () => {
    it('should request a sponsor by id', async () => {
      const mockSponsor: Sponsor = { id: 42 } as Sponsor;
      vi.mocked(mockSDK.request).mockResolvedValue(mockSponsor);

      const result = await partnershipsAccess.getSponsor({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:getSponsor', { id: 42 });
      expect(result).toEqual(mockSponsor);
    });
  });

  describe('listAllSponsorPasses', () => {
    it('should request all sponsor passes list', async () => {
      const mockResponse: PaginatedResponse<SponsorPass> = {
        count: 2,
        results: [{ id: 1 } as SponsorPass, { id: 2 } as SponsorPass],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await partnershipsAccess.listAllSponsorPasses({ limit: 10, offset: 0, includeRevoked: true });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:listAllSponsorPasses', {
        limit: 10,
        offset: 0,
        includeRevoked: true,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSponsorPass', () => {
    it('should request a sponsor pass by id', async () => {
      const mockPass = { id: 42 } as SponsorPass;
      vi.mocked(mockSDK.request).mockResolvedValue(mockPass);

      const result = await partnershipsAccess.getSponsorPass({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:getSponsorPass', { id: 42 });
      expect(result).toEqual(mockPass);
    });
  });

  describe('revokeSponsorPass', () => {
    it('should request sponsor pass revocation by id', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await partnershipsAccess.revokeSponsorPass({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('partnerships:revokeSponsorPass', { id: 42 });
    });
  });
});
