import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserAccess, type User, type UserProfile } from '../../access/user';
import type { FrontierSDK } from '../../sdk';

describe('UserAccess', () => {
  let userAccess: UserAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    userAccess = new UserAccess(mockSDK);
  });

  describe('getDetails', () => {
    it('should request current user details', async () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockUser);

      const result = await userAccess.getDetails();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getDetails');
      expect(result).toEqual(mockUser);
    });

    it('should return user with required fields', async () => {
      const mockUser: User = {
        id: '456',
        email: 'john@example.com',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockUser);

      const result = await userAccess.getDetails();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result.id).toBe('456');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle optional fields', async () => {
      const mockUser: User = {
        id: '789',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockUser);

      const result = await userAccess.getDetails();

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
      expect(result.username).toBeUndefined();
    });

    it('should throw error if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getDetails()).rejects.toThrow('Not authenticated');
    });
  });

  describe('getProfile', () => {
    it('should request user profile by ID', async () => {
      const mockProfile: UserProfile = {
        id: 456,
        user: 123,
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'johnd',
        profilePicture: 'https://example.com/pic.jpg',
        phoneNumber: '+1234567890',
        community: 'dev-community',
        communityName: 'Developer Community',
        organization: 'Tech Corp',
        organizationRole: 'Engineer',
        socialSite: 'twitter',
        socialHandle: '@johndoe',
        githubHandle: 'johndoe',
        currentWork: 'Building apps',
        notableWork: 'Open source contributor',
        receiveUpdates: true,
        notificationCommunityEvent: true,
        notificationTowerEvent: true,
        notificationUpcomingEvent: false,
        notificationTweetPicked: true,
        notifyEventInvites: true,
        optInSms: false,
        howDidYouHearAboutUs: 'Friend',
        braggingStatement: 'I build cool stuff',
        contributionStatement: 'Contributing to open source',
        hasUsablePassword: 'true',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockProfile);

      const result = await userAccess.getProfile(456);

      expect(mockSDK.request).toHaveBeenCalledWith('user:getProfile', { id: 456 });
      expect(result).toEqual(mockProfile);
    });

    it('should return complete user profile', async () => {
      const mockProfile: UserProfile = {
        id: 789,
        user: 456,
        firstName: 'Jane',
        lastName: 'Smith',
        nickname: 'janes',
        profilePicture: '',
        phoneNumber: '',
        community: 'designers',
        communityName: 'Design Community',
        organization: '',
        organizationRole: '',
        socialSite: 'github',
        socialHandle: '@janesmith',
        githubHandle: 'janesmith',
        currentWork: 'UI/UX Design',
        notableWork: 'Award-winning designs',
        receiveUpdates: false,
        notificationCommunityEvent: false,
        notificationTowerEvent: false,
        notificationUpcomingEvent: true,
        notificationTweetPicked: false,
        notifyEventInvites: false,
        optInSms: true,
        howDidYouHearAboutUs: 'Social media',
        braggingStatement: 'Designer extraordinaire',
        contributionStatement: 'Helping others learn design',
        hasUsablePassword: 'false',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockProfile);

      const result = await userAccess.getProfile(789);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('nickname');
      expect(result).toHaveProperty('githubHandle');
      expect(result).toHaveProperty('communityName');
      expect(result.nickname).toBe('janes');
      expect(result.githubHandle).toBe('janesmith');
    });

    it('should throw error if profile not found', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Profile not found'));

      await expect(userAccess.getProfile(999)).rejects.toThrow('Profile not found');
    });

    it('should throw error if access is denied', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Access denied'));

      await expect(userAccess.getProfile(123)).rejects.toThrow('Access denied');
    });
  });
});
