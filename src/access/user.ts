import type { FrontierSDK } from '../sdk';

/**
 * Basic user information
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's first name (optional) */
  firstName?: string;
  /** User's last name (optional) */
  lastName?: string;
  /** Username (optional) */
  username?: string;
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
 * User access class for interacting with user information
 * 
 * This class provides methods to:
 * - Get current user details
 * - Get detailed user profiles
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
   * Get user profile by ID
   * 
   * Returns detailed profile information for a specific user,
   * including social media handles, preferences, and community information.
   * 
   * @param id - The profile ID to fetch
   * @returns UserProfile object with detailed information
   * @throws {Error} If profile is not found or access is denied
   * 
   * @example
   * ```typescript
   * const profile = await sdk.getUser().getProfile(123);
   * console.log('Nickname:', profile.nickname);
   * console.log('GitHub:', profile.githubHandle);
   * console.log('Community:', profile.communityName);
   * ```
   */
  async getProfile(id: number): Promise<UserProfile> {
    return this.sdk.request('user:getProfile', { id });
  }
}
