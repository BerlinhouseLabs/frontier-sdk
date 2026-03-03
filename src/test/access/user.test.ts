import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  UserAccess, 
  type User, 
  type UserProfile,
  type ReferralOverview,
  type ReferralDetails,
  type UserContactPayload,
  type PaginatedResponse,
  type KycStatusResponse
} from '../../access/user';
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
    it('should request current user profile', async () => {
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

      const result = await userAccess.getProfile();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getProfile');
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

      const result = await userAccess.getProfile();

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

      await expect(userAccess.getProfile()).rejects.toThrow('Profile not found');
    });

    it('should throw error if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getProfile()).rejects.toThrow('Not authenticated');
    });
  });

  describe('getReferralOverview', () => {
    it('should request referral overview for current user', async () => {
      const mockOverview: ReferralOverview = {
        totalReferrals: 10,
        activeReferrals: 7,
        totalRewards: 500,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockOverview);

      const result = await userAccess.getReferralOverview();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getReferralOverview');
      expect(result).toEqual(mockOverview);
    });

    it('should return overview with all fields', async () => {
      const mockOverview: ReferralOverview = {
        totalReferrals: 25,
        activeReferrals: 15,
        totalRewards: 1250,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockOverview);

      const result = await userAccess.getReferralOverview();

      expect(result).toHaveProperty('totalReferrals');
      expect(result).toHaveProperty('activeReferrals');
      expect(result).toHaveProperty('totalRewards');
      expect(result.totalReferrals).toBe(25);
      expect(result.activeReferrals).toBe(15);
      expect(result.totalRewards).toBe(1250);
    });

    it('should throw error if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getReferralOverview()).rejects.toThrow('Not authenticated');
    });
  });

  describe('getReferralDetails', () => {
    it('should request referral details without pagination', async () => {
      const mockDetails: PaginatedResponse<ReferralDetails> = {
        count: 2,
        results: [
          {
            id: 'ref1',
            email: 'user1@example.com',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            reward: 50,
          },
          {
            id: 'ref2',
            email: 'user2@example.com',
            status: 'pending',
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockDetails);

      const result = await userAccess.getReferralDetails();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getReferralDetails', undefined);
      expect(result).toEqual(mockDetails);
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it('should request referral details with pagination', async () => {
      const mockDetails: PaginatedResponse<ReferralDetails> = {
        count: 50,
        results: [
          {
            id: 'ref21',
            email: 'user21@example.com',
            status: 'active',
            createdAt: '2024-01-21T00:00:00Z',
            reward: 50,
          },
        ],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockDetails);

      const result = await userAccess.getReferralDetails(2);

      expect(mockSDK.request).toHaveBeenCalledWith('user:getReferralDetails', 2);
      expect(result).toEqual(mockDetails);
    });

    it('should return paginated response structure', async () => {
      const mockDetails: PaginatedResponse<ReferralDetails> = {
        count: 100,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockDetails);

      const result = await userAccess.getReferralDetails(5);

      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('results');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('should throw error if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getReferralDetails()).rejects.toThrow('Not authenticated');
    });
  });

  describe('addUserContact', () => {
    it('should add user contact information', async () => {
      const contactData: UserContactPayload = {
        email: 'contact@example.com',
        phoneNumber: '+1234567890',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await userAccess.addUserContact(contactData);

      expect(mockSDK.request).toHaveBeenCalledWith('user:addUserContact', contactData);
    });

    it('should handle contact data with only email', async () => {
      const contactData: UserContactPayload = {
        email: 'newemail@example.com',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await userAccess.addUserContact(contactData);

      expect(mockSDK.request).toHaveBeenCalledWith('user:addUserContact', contactData);
    });

    it('should handle contact data with additional fields', async () => {
      const contactData: UserContactPayload = {
        email: 'contact@example.com',
        phoneNumber: '+1234567890',
        preferredContact: 'email',
        notes: 'Important contact',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await userAccess.addUserContact(contactData);

      expect(mockSDK.request).toHaveBeenCalledWith('user:addUserContact', contactData);
    });

    it('should throw error if not authenticated', async () => {
      const contactData: UserContactPayload = {
        email: 'contact@example.com',
      };

      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.addUserContact(contactData)).rejects.toThrow('Not authenticated');
    });

    it('should throw error if data is invalid', async () => {
      const contactData: UserContactPayload = {
        email: 'invalid-email',
      };

      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Invalid email format'));

      await expect(userAccess.addUserContact(contactData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('getOrCreateKyc', () => {
    it('should request KYC status without redirectUri', async () => {
      const mockKycResponse: KycStatusResponse = {
        status: 'not_started',
        isApproved: false,
        rejectionReason: null,
        kycLinkId: 'kyc_new123',
        kycLink: 'https://verify.bridge.xyz/new123',
        tosStatus: 'pending',
        tosLink: 'https://bridge.xyz/tos/new123',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockKycResponse);

      const result = await userAccess.getOrCreateKyc();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getOrCreateKyc', undefined);
      expect(result).toEqual(mockKycResponse);
      expect(result.tosStatus).toBe('pending');
      expect(result.tosLink).toBe('https://bridge.xyz/tos/new123');
    });

    it('should request KYC status with redirectUri', async () => {
      const mockKycResponse: KycStatusResponse = {
        status: 'not_started',
        isApproved: false,
        rejectionReason: null,
        kycLinkId: 'kyc_new456',
        kycLink: 'https://verify.bridge.xyz/new456',
        tosStatus: 'pending',
        tosLink: 'https://bridge.xyz/tos/new456',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockKycResponse);

      const redirectUri = 'https://myapp.com/callback';
      const result = await userAccess.getOrCreateKyc(redirectUri);

      expect(mockSDK.request).toHaveBeenCalledWith('user:getOrCreateKyc', redirectUri);
      expect(result.kycLink).toBe('https://verify.bridge.xyz/new456');
    });

    it('should return approved status when KYC already completed', async () => {
      const mockKycResponse: KycStatusResponse = {
        status: 'approved',
        isApproved: true,
        rejectionReason: null,
        kycLinkId: 'kyc_existing123',
        kycLink: null,
        tosStatus: 'approved',
        tosLink: null,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockKycResponse);

      const result = await userAccess.getOrCreateKyc();

      expect(result.status).toBe('approved');
      expect(result.isApproved).toBe(true);
      expect(result.kycLink).toBeNull();
      expect(result.tosStatus).toBe('approved');
    });

    it('should return in_review status', async () => {
      const mockKycResponse: KycStatusResponse = {
        status: 'in_review',
        isApproved: false,
        rejectionReason: null,
        kycLinkId: 'kyc_pending123',
        kycLink: 'https://verify.bridge.xyz/pending123',
        tosStatus: 'approved',
        tosLink: null,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockKycResponse);

      const result = await userAccess.getOrCreateKyc();

      expect(result.status).toBe('in_review');
      expect(result.isApproved).toBe(false);
    });

    it('should return rejected status with reason', async () => {
      const mockKycResponse: KycStatusResponse = {
        status: 'rejected',
        isApproved: false,
        rejectionReason: 'Document verification failed',
        kycLinkId: 'kyc_rejected123',
        kycLink: null,
        tosStatus: 'approved',
        tosLink: null,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockKycResponse);

      const result = await userAccess.getOrCreateKyc();

      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Document verification failed');
    });

    it('should throw error if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getOrCreateKyc()).rejects.toThrow('Not authenticated');
    });
  });

  describe('getVerifiedAccessControls', () => {
    // Signed by API TEST_PRIVATE_KEY_HEX; public key for stage "test" is in access-controls.ts
    const VALID_SIGNED_ENVELOPE = {
      accessControls: 'eyJhZGRPbnMiOlsiZ2xvYmV0cm90dGVyIl0sImNvbW11bml0aWVzIjpbImFydHMtbXVzaWMiXSwiZW1haWwiOiJ0ZXN0QGZyb250aWVyLmNvbSIsImlzU3RhZmYiOmZhbHNlLCJpc1N1cGVydXNlciI6ZmFsc2UsImtpZCI6InYxIiwibWFuYWdlZENvbW11bml0aWVzIjpbXSwic21hcnRBY2NvdW50QWRkcmVzcyI6IjB4MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3OCIsInN1YnNjcmlwdGlvbkludGVydmFsIjoibW9udGhseSIsInN1YnNjcmlwdGlvblBsYW4iOiJjaXRpemVuIiwic3Vic2NyaXB0aW9uU3RhdHVzIjoiYWN0aXZlIiwic3Vic2NyaXB0aW9uVHlwZSI6ImNyeXB0byIsInRpbWVzdGFtcCI6IjIwMjUtMDEtMDFUMDA6MDA6MDArMDA6MDAifQ==',
      stage: 'test',
      signature: '035c41587812bad2f2aa4e33fe8e980a1a8818e67441b7da43f549c0fdfad29b661a003a87ca6d4c0eb17a90cee47d3908065018c84c405074bd85e10ded8dcf',
    };

    it('should request access controls and verify the signature', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(VALID_SIGNED_ENVELOPE);

      const result = await userAccess.getVerifiedAccessControls();

      expect(mockSDK.request).toHaveBeenCalledWith('user:getVerifiedAccessControls');
      expect(result.email).toBe('test@frontier.com');
      expect(result.subscriptionPlan).toBe('citizen');
      expect(result.subscriptionStatus).toBe('active');
      expect(result.addOns).toEqual(['globetrotter']);
      expect(result.communities).toEqual(['arts-music']);
    });

    it('should throw if host returns tampered payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue({
        ...VALID_SIGNED_ENVELOPE,
        accessControls: VALID_SIGNED_ENVELOPE.accessControls.slice(0, -2) + 'XX',
      });

      await expect(userAccess.getVerifiedAccessControls()).rejects.toThrow();
    });

    it('should throw if host returns tampered signature', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue({
        ...VALID_SIGNED_ENVELOPE,
        signature: 'aa' + VALID_SIGNED_ENVELOPE.signature.slice(2),
      });

      await expect(userAccess.getVerifiedAccessControls()).rejects.toThrow();
    });

    it('should throw if not authenticated', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Not authenticated'));

      await expect(userAccess.getVerifiedAccessControls()).rejects.toThrow('Not authenticated');
    });
  });
});
