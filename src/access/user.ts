import type { FrontierSDK } from '../sdk';

/**
 * Basic user information
 */
export interface User {
  /** Unique user identifier */
  id: number;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** Whether user is active */
  isActive: boolean;
  /** Date user joined */
  dateJoined: string;
  /** Whether user is staff */
  isStaff: boolean;
  /** Whether user is superuser */
  isSuperuser: boolean;
}

/**
 * Detailed user profile information
 */
export interface UserProfile {
  /** Profile ID */
  id: number;
  /** Associated user ID */
  user: number;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Nickname */
  nickname: string;
  /** Profile picture URL */
  profilePicture: string;
  /** Phone number */
  phoneNumber: string;
  /** Community identifier */
  community: string;
  /** Community name */
  communityName: string;
  /** Organization name */
  organization: string;
  /** Role in organization */
  organizationRole: string;
  /** Social media site */
  socialSite: string;
  /** Social media handle */
  socialHandle: string;
  /** GitHub username */
  githubHandle: string;
  /** Current work description */
  currentWork: string;
  /** Notable work achievements */
  notableWork: string;
  /** Whether user wants to receive updates */
  receiveUpdates: boolean;
  /** Notification preference: community events */
  notificationCommunityEvent: boolean;
  /** Notification preference: tower events */
  notificationTowerEvent: boolean;
  /** Notification preference: upcoming events */
  notificationUpcomingEvent: boolean;
  /** Notification preference: tweet picked */
  notificationTweetPicked: boolean;
  /** Notification preference: event invites */
  notifyEventInvites: boolean;
  /** Whether user opted in for SMS */
  optInSms: boolean;
  /** How user heard about the platform */
  howDidYouHearAboutUs: string;
  /** User's bragging statement */
  braggingStatement: string;
  /** User's contribution statement */
  contributionStatement: string;
  /** Whether user has a usable password */
  hasUsablePassword: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Total count of items */
  count: number;
  /** Array of results */
  results: T[];
}

/**
 * Referral overview statistics
 */
export interface ReferralOverview {
  /** Total number of referrals */
  referralCount: number;
  /** User's ranking */
  ranking: number;
  /** Referral link */
  referralLink: string;
  /** Referral code */
  referralCode: string;
  /** Who referred this user */
  referredBy: string | null;
}

/**
 * Detailed referral information
 */
export interface ReferralDetails {
  /** Name of the referred user */
  name: string;
  /** Email of the referred user */
  email: string;
  /** Date when the referral was made */
  referralDate: string;
  /** Reward information (if any) */
  reward: string;
  /** Status of the referral */
  status: string;
}

/**
 * Single contact entry
 */
export interface UserContact {
  /** Contact email */
  email: string;
  /** Contact phone number */
  phone: string;
  /** Contact name */
  name: string;
}

/**
 * KYC verification status
 */
export type KycStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

/**
 * Terms of Service acceptance status
 */
export type TosStatus = 'pending' | 'approved';

/**
 * KYC status response
 */
export interface KycStatusResponse {
  /** Current KYC status */
  status: KycStatus;
  /** Whether KYC is approved */
  isApproved: boolean;
  /** Reason for rejection (if rejected) */
  rejectionReason: string | null;
  /** KYC link ID (if KYC has been started) */
  kycLinkId: string | null;
  /** URL to complete KYC verification (if KYC has been started) */
  kycLink: string | null;
  /** Terms of Service acceptance status */
  tosStatus: TosStatus | null;
  /** URL to accept Terms of Service */
  tosLink: string | null;
}

/**
 * User contact information payload
 */
export interface UserContactPayload {
  /** Array of contacts */
  contacts: UserContact[];
}

/**
 * User access class for interacting with user information
 * 
 * This class provides methods to:
 * - Get current user details
 * - Get detailed user profiles
 * - Access referral information
 * - Add user contact information
 * 
 * All methods require appropriate permissions and authentication.
 */
export class UserAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Get current user details
   * 
   * Returns basic information about the currently authenticated user,
   * including their ID, email, and name.
   * 
   * @returns User object with basic information
   * @throws {Error} If user is not authenticated
   * 
   * @example
   * ```typescript
   * const user = await sdk.getUser().getDetails();
   * console.log('User email:', user.email);
   * console.log('User name:', `${user.firstName} ${user.lastName}`);
   * ```
   */
  async getDetails(): Promise<User> {
    return this.sdk.request('user:getDetails');
  }

  /**
   * Get current user profile
   * 
   * Returns detailed profile information for the currently authenticated user,
   * including social media handles, preferences, and community information.
   * 
   * @returns UserProfile object with detailed information
   * @throws {Error} If user is not authenticated or profile is not found
   * 
   * @example
   * ```typescript
   * const profile = await sdk.getUser().getProfile();
   * console.log('Nickname:', profile.nickname);
   * console.log('GitHub:', profile.githubHandle);
   * console.log('Community:', profile.communityName);
   * ```
   */
  async getProfile(): Promise<UserProfile> {
    return this.sdk.request('user:getProfile');
  }

  /**
   * Get referral overview for current user
   * 
   * Returns statistics about the user's referrals, including total count,
   * active referrals, and total rewards earned.
   * 
   * @returns ReferralOverview object with referral statistics
   * @throws {Error} If user is not authenticated
   * 
   * @example
   * ```typescript
   * const overview = await sdk.getUser().getReferralOverview();
   * console.log('Total referrals:', overview.totalReferrals);
   * console.log('Total rewards:', overview.totalRewards);
   * ```
   */
  async getReferralOverview(): Promise<ReferralOverview> {
    return this.sdk.request('user:getReferralOverview');
  }

  /**
   * Get referral details for current user with optional pagination
   * 
   * Returns detailed information about each referral, including status,
   * date, and rewards. Supports pagination for large result sets.
   * 
   * @param page - Optional page number for pagination (1-indexed)
   * @returns Paginated response with referral details
   * @throws {Error} If user is not authenticated
   * 
   * @example
   * ```typescript
   * const details = await sdk.getUser().getReferralDetails();
   * console.log('Total referrals:', details.count);
   * details.results.forEach(ref => {
   *   console.log(`${ref.email} - ${ref.status}`);
   * });
   * 
   * // With pagination
   * const page2 = await sdk.getUser().getReferralDetails(2);
   * ```
   */
  async getReferralDetails(page?: number): Promise<PaginatedResponse<ReferralDetails>> {
    return this.sdk.request('user:getReferralDetails', page);
  }

  /**
   * Add user contact information
   * 
   * Submits contact information for the current user. This can include
   * email, phone number, or other contact details.
   * 
   * @param data - Contact information payload
   * @returns Promise that resolves when contact is added
   * @throws {Error} If user is not authenticated or data is invalid
   * 
   * @example
   * ```typescript
   * await sdk.getUser().addUserContact({
   *   email: 'contact@example.com',
   *   phoneNumber: '+1234567890'
   * });
   * ```
   */
  async addUserContact(data: UserContactPayload): Promise<void> {
    return this.sdk.request('user:addUserContact', data);
  }

  /**
   * Get or create KYC status
   * 
   * Returns the current KYC verification status. If KYC has not been started,
   * it will be initiated and the response will include a URL to complete verification.
   * 
   * @param redirectUri - Optional URL to redirect user after KYC completion
   * @returns KycStatusResponse with status and verification link if applicable
   * @throws {Error} If user is not authenticated
   * 
   * @example
   * ```typescript
   * const kyc = await sdk.getUser().getOrCreateKyc();
   * if (kyc.status === 'not_started' && kyc.kycLink) {
   *   // Redirect user to complete KYC
   *   window.open(kyc.kycLink, '_blank');
   * } else if (kyc.isApproved) {
   *   console.log('KYC approved!');
   * }
   * 
   * // With redirect URI
   * const kycWithRedirect = await sdk.getUser().getOrCreateKyc('https://myapp.com/callback');
   * ```
   */
  async getOrCreateKyc(redirectUri?: string): Promise<KycStatusResponse> {
    return this.sdk.request('user:getOrCreateKyc', redirectUri);
  }
}
