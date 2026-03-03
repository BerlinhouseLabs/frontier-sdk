import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CommunitiesAccess,
  type Community,
  type ListCommunitiesParams,
} from '../../access/communities';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

describe('CommunitiesAccess', () => {
  let communitiesAccess: CommunitiesAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    communitiesAccess = new CommunitiesAccess(mockSDK);
  });

  describe('listCommunities', () => {
    it('should request communities list with pagination params', async () => {
      const mockResponse: PaginatedResponse<Community> = {
        count: 2,
        results: [
          { id: 1, name: 'Arts & Music', description: 'Artists', slug: 'arts-and-music', iconName: 'music', splashVideo: null },
          { id: 2, name: 'Tech', description: 'Builders', slug: 'tech', iconName: 'cpu', splashVideo: 'https://example.com/tech.mp4' },
        ],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const params: ListCommunitiesParams = { limit: 10, offset: 0 };
      const result = await communitiesAccess.listCommunities(params);

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listCommunities', params);
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<Community> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await communitiesAccess.listCommunities();

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listCommunities', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(communitiesAccess.listCommunities()).rejects.toThrow('Permission denied');
    });
  });

  describe('getCommunity', () => {
    it('should request a community by slug', async () => {
      const mockCommunity: Community = {
        id: 1,
        name: 'Arts & Music',
        description: 'A community for artists',
        slug: 'arts-and-music',
        iconName: 'music',
        splashVideo: null,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockCommunity);

      const result = await communitiesAccess.getCommunity({ idOrSlug: 'arts-and-music' });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:getCommunity', { idOrSlug: 'arts-and-music' });
      expect(result).toEqual(mockCommunity);
    });

    it('should request a community by numeric ID', async () => {
      const mockCommunity: Community = {
        id: 3,
        name: 'Tech',
        description: 'A community for builders',
        slug: 'tech',
        iconName: 'cpu',
        splashVideo: 'https://example.com/tech.mp4',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockCommunity);

      const result = await communitiesAccess.getCommunity({ idOrSlug: 3 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:getCommunity', { idOrSlug: 3 });
      expect(result).toEqual(mockCommunity);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not found'));

      await expect(communitiesAccess.getCommunity({ idOrSlug: 'unknown' })).rejects.toThrow('Not found');
    });
  });
});
