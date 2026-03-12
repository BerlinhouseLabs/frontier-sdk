import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CommunitiesAccess,
  type Community,
  type ListCommunitiesParams,
  type InternshipPass,
  type CreateInternshipPassRequest,
  type ListInternshipPassesParams,
  type ReassignRequest,
  type CreateReassignRequestPayload,
  type ListReassignRequestsParams,
} from '../../access/communities';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

const mockInternshipPass: InternshipPass = {
  id: 1,
  email: 'intern@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  community: 5,
  communityName: 'Tech',
  status: 'active',
  createdAt: '2026-01-15T10:00:00Z',
  revokedAt: null,
  updatedAt: '2026-01-15T10:00:00Z',
};

const mockReassignRequest: ReassignRequest = {
  id: 7,
  requester: 10,
  requesterEmail: 'manager@example.com',
  member: 20,
  memberEmail: 'user@example.com',
  targetCommunity: 3,
  targetCommunityName: 'Arts & Music',
  status: 'pending',
  createdAt: '2026-03-01T09:00:00Z',
  resolvedAt: null,
  resolvedBy: null,
  resolvedByEmail: null,
};

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

  // --- Internship Passes ---

  describe('createInternshipPass', () => {
    it('should request creation with correct payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockInternshipPass);

      const payload: CreateInternshipPassRequest = {
        email: 'intern@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        community: 5,
      };
      const result = await communitiesAccess.createInternshipPass(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('communities:createInternshipPass', payload);
      expect(result).toEqual(mockInternshipPass);
    });

    it('should propagate validation errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('This user already has an active subscription.'));

      await expect(
        communitiesAccess.createInternshipPass({
          email: 'existing@example.com',
          firstName: 'John',
          lastName: 'Smith',
          community: 5,
        })
      ).rejects.toThrow('This user already has an active subscription.');
    });
  });

  describe('listInternshipPasses', () => {
    it('should request with pagination and filter params', async () => {
      const mockResponse: PaginatedResponse<InternshipPass> = {
        count: 1,
        results: [mockInternshipPass],
      };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const params: ListInternshipPassesParams = { limit: 20, offset: 0, includeRevoked: true };
      const result = await communitiesAccess.listInternshipPasses(params);

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listInternshipPasses', params);
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<InternshipPass> = { count: 0, results: [] };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await communitiesAccess.listInternshipPasses();

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listInternshipPasses', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(communitiesAccess.listInternshipPasses()).rejects.toThrow('Permission denied');
    });
  });

  describe('getInternshipPass', () => {
    it('should request by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockInternshipPass);

      const result = await communitiesAccess.getInternshipPass({ id: 1 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:getInternshipPass', { id: 1 });
      expect(result).toEqual(mockInternshipPass);
    });

    it('should propagate 404 errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not found'));

      await expect(communitiesAccess.getInternshipPass({ id: 999 })).rejects.toThrow('Not found');
    });
  });

  describe('revokeInternshipPass', () => {
    it('should request revocation by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await communitiesAccess.revokeInternshipPass({ id: 1 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:revokeInternshipPass', { id: 1 });
    });

    it('should propagate error if already revoked', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('This internship is already revoked.'));

      await expect(communitiesAccess.revokeInternshipPass({ id: 1 })).rejects.toThrow('already revoked');
    });
  });

  // --- Reassign Requests ---

  describe('createReassignRequest', () => {
    it('should request creation with correct payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockReassignRequest);

      const payload: CreateReassignRequestPayload = {
        memberEmail: 'user@example.com',
        targetCommunity: 3,
      };
      const result = await communitiesAccess.createReassignRequest(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('communities:createReassignRequest', payload);
      expect(result).toEqual(mockReassignRequest);
    });

    it('should propagate permission errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Member is not part of any community you manage.'));

      await expect(
        communitiesAccess.createReassignRequest({ memberEmail: 'other@example.com', targetCommunity: 3 })
      ).rejects.toThrow('not part of any community you manage');
    });
  });

  describe('listReassignRequests', () => {
    it('should request with pagination params', async () => {
      const mockResponse: PaginatedResponse<ReassignRequest> = {
        count: 1,
        results: [mockReassignRequest],
      };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const params: ListReassignRequestsParams = { limit: 10, offset: 0 };
      const result = await communitiesAccess.listReassignRequests(params);

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listReassignRequests', params);
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<ReassignRequest> = { count: 0, results: [] };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await communitiesAccess.listReassignRequests();

      expect(mockSDK.request).toHaveBeenCalledWith('communities:listReassignRequests', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getReassignRequest', () => {
    it('should request by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(mockReassignRequest);

      const result = await communitiesAccess.getReassignRequest({ id: 7 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:getReassignRequest', { id: 7 });
      expect(result).toEqual(mockReassignRequest);
    });
  });

  describe('acceptReassignRequest', () => {
    it('should request acceptance and return updated request', async () => {
      const accepted = { ...mockReassignRequest, status: 'accepted' as const, resolvedAt: '2026-03-02T10:00:00Z', resolvedBy: 10, resolvedByEmail: 'manager@example.com' };
      vi.mocked(mockSDK.request).mockResolvedValue(accepted);

      const result = await communitiesAccess.acceptReassignRequest({ id: 7 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:acceptReassignRequest', { id: 7 });
      expect(result.status).toBe('accepted');
      expect(result.resolvedAt).not.toBeNull();
    });

    it('should propagate error if not pending', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Only pending requests can be accepted.'));

      await expect(communitiesAccess.acceptReassignRequest({ id: 7 })).rejects.toThrow('Only pending requests');
    });

    it('should propagate error if not target manager', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Only managers of the target community can accept.'));

      await expect(communitiesAccess.acceptReassignRequest({ id: 7 })).rejects.toThrow('managers of the target community');
    });
  });

  describe('rejectReassignRequest', () => {
    it('should request rejection by ID', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await communitiesAccess.rejectReassignRequest({ id: 7 });

      expect(mockSDK.request).toHaveBeenCalledWith('communities:rejectReassignRequest', { id: 7 });
    });

    it('should propagate error if not pending', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Only pending requests can be rejected.'));

      await expect(communitiesAccess.rejectReassignRequest({ id: 7 })).rejects.toThrow('Only pending requests');
    });
  });
});
