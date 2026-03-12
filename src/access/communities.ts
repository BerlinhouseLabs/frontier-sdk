import type { FrontierSDK } from '../sdk';
import type { PaginatedResponse } from './user';

/**
 * Community information
 */
export interface Community {
  /** Unique community ID */
  id: number;
  /** Display name */
  name: string;
  /** Description of the community */
  description: string;
  /** URL-friendly identifier */
  slug: string;
  /** Icon name for the community */
  iconName: string;
  /** Splash video URL, or null if not set */
  splashVideo: string | null;
}

/**
 * Pagination parameters for listing communities
 */
export interface ListCommunitiesParams {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset into the result set */
  offset?: number;
}

/**
 * Internship pass status
 */
export type InternshipPassStatus = 'active' | 'revoked';

/**
 * Internship pass information
 */
export interface InternshipPass {
  /** Unique pass ID */
  id: number;
  /** Email of the intern */
  email: string;
  /** Intern's first name */
  firstName: string;
  /** Intern's last name */
  lastName: string;
  /** Community ID the pass belongs to */
  community: number;
  /** Community display name */
  communityName: string;
  /** Pass status: active or revoked */
  status: InternshipPassStatus;
  /** When the pass was created */
  createdAt: string;
  /** When the pass was revoked, or null */
  revokedAt: string | null;
  /** When the pass was last updated */
  updatedAt: string;
}

/**
 * Payload for creating an internship pass
 */
export interface CreateInternshipPassRequest {
  /** Email of the intern */
  email: string;
  /** Intern's first name */
  firstName: string;
  /** Intern's last name */
  lastName: string;
  /** Community ID to assign the pass to */
  community: number;
}

/**
 * Pagination and filter parameters for listing internship passes
 */
export interface ListInternshipPassesParams {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset into the result set */
  offset?: number;
  /** When true, include revoked passes */
  includeRevoked?: boolean;
}

/**
 * Reassign request status
 */
export type ReassignRequestStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Reassign request information
 */
export interface ReassignRequest {
  /** Unique request ID */
  id: number;
  /** ID of the user who created the request */
  requester: number;
  /** Email of the requester */
  requesterEmail: string;
  /** ID of the member being reassigned */
  member: number;
  /** Email of the member being reassigned */
  memberEmail: string;
  /** ID of the target community */
  targetCommunity: number;
  /** Name of the target community */
  targetCommunityName: string;
  /** Request status */
  status: ReassignRequestStatus;
  /** When the request was created */
  createdAt: string;
  /** When the request was resolved, or null */
  resolvedAt: string | null;
  /** ID of the user who resolved the request, or null */
  resolvedBy: number | null;
  /** Email of the user who resolved the request, or null */
  resolvedByEmail: string | null;
}

/**
 * Payload for creating a reassign request
 */
export interface CreateReassignRequestPayload {
  /** Email of the member to reassign */
  memberEmail: string;
  /** Target community ID */
  targetCommunity: number;
}

/**
 * Pagination parameters for listing reassign requests
 */
export interface ListReassignRequestsParams {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset into the result set */
  offset?: number;
}

/**
 * Communities access class for community information, internship pass management,
 * and member reassignment requests.
 *
 * Access via: `sdk.getCommunities()`
 *
 * ## Access Rights
 *
 * **Community listing/retrieval**: No authentication required (public API).
 *
 * **Internship passes**: Requires authentication, an active subscription, and
 * community manager status. Only passes belonging to communities the caller
 * manages are accessible. Superusers can access all passes.
 *
 * **Reassign requests**: Requires authentication. Creating a request requires
 * managing the member's current community. Accepting requires managing the
 * target community. Listing shows requests where the caller manages either
 * the source or target community. Superusers can see and act on all requests.
 */
export class CommunitiesAccess {
  constructor(private sdk: FrontierSDK) {}

  // --- Communities ---

  /**
   * List all communities (paginated)
   *
   * Returns all communities visible to the public (hidden communities are excluded).
   *
   * @example
   * ```typescript
   * const response = await sdk.getCommunities().listCommunities();
   * console.log('Total communities:', response.count);
   * response.results.forEach(c => console.log(c.name, c.slug));
   * ```
   */
  async listCommunities(payload?: ListCommunitiesParams): Promise<PaginatedResponse<Community>> {
    return this.sdk.request('communities:listCommunities', payload);
  }

  /**
   * Get a community by ID or slug
   *
   * @param payload.idOrSlug - Numeric ID or slug string of the community
   * @throws {Error} If community is not found
   *
   * @example
   * ```typescript
   * const community = await sdk.getCommunities().getCommunity({ idOrSlug: 'arts-and-music' });
   * ```
   */
  async getCommunity(payload: { idOrSlug: string | number }): Promise<Community> {
    return this.sdk.request('communities:getCommunity', payload);
  }

  // --- Internship Passes ---

  /**
   * Create an internship pass
   *
   * Creates a new internship pass for the specified community. If the user
   * does not exist, an inactive account is created automatically.
   *
   * Requires: authenticated, active subscription, community manager of the target community.
   *
   * @throws {Error} If user already has an active subscription or caller is not a manager
   *
   * @example
   * ```typescript
   * const pass = await sdk.getCommunities().createInternshipPass({
   *   email: 'intern@example.com',
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   *   community: 5,
   * });
   * ```
   */
  async createInternshipPass(payload: CreateInternshipPassRequest): Promise<InternshipPass> {
    return this.sdk.request('communities:createInternshipPass', payload);
  }

  /**
   * List internship passes for managed communities (paginated)
   *
   * By default only active passes are returned; set `includeRevoked: true` to include revoked.
   *
   * Requires: authenticated, active subscription, community manager.
   *
   * @example
   * ```typescript
   * const passes = await sdk.getCommunities().listInternshipPasses({ limit: 20 });
   * passes.results.forEach(p => console.log(p.email, p.status));
   * ```
   */
  async listInternshipPasses(
    payload?: ListInternshipPassesParams
  ): Promise<PaginatedResponse<InternshipPass>> {
    return this.sdk.request('communities:listInternshipPasses', payload);
  }

  /**
   * Get an internship pass by ID
   *
   * Requires: authenticated, active subscription, community manager of the pass's community.
   *
   * @example
   * ```typescript
   * const pass = await sdk.getCommunities().getInternshipPass({ id: 42 });
   * ```
   */
  async getInternshipPass(payload: { id: number }): Promise<InternshipPass> {
    return this.sdk.request('communities:getInternshipPass', payload);
  }

  /**
   * Revoke an internship pass by ID
   *
   * Sets the pass status to revoked. Cannot revoke an already-revoked pass.
   *
   * Requires: authenticated, active subscription, community manager of the pass's community.
   *
   * @throws {Error} If pass is already revoked
   *
   * @example
   * ```typescript
   * await sdk.getCommunities().revokeInternshipPass({ id: 42 });
   * ```
   */
  async revokeInternshipPass(payload: { id: number }): Promise<void> {
    return this.sdk.request('communities:revokeInternshipPass', payload);
  }

  // --- Reassign Requests ---

  /**
   * Create a reassign request
   *
   * Requests to move a member from their current community to a target community.
   * The member must belong to a community the caller manages.
   *
   * Requires: authenticated. Caller must manage the member's current community.
   *
   * @throws {Error} If member has no active subscription, is already in the target community,
   *   or caller does not manage the member's community
   *
   * @example
   * ```typescript
   * const request = await sdk.getCommunities().createReassignRequest({
   *   memberEmail: 'user@example.com',
   *   targetCommunity: 3,
   * });
   * ```
   */
  async createReassignRequest(payload: CreateReassignRequestPayload): Promise<ReassignRequest> {
    return this.sdk.request('communities:createReassignRequest', payload);
  }

  /**
   * List pending reassign requests visible to the current user (paginated)
   *
   * Returns requests where the caller manages either the source or target community.
   * Superusers see all pending requests.
   *
   * @example
   * ```typescript
   * const requests = await sdk.getCommunities().listReassignRequests();
   * requests.results.forEach(r => console.log(r.memberEmail, '->', r.targetCommunityName));
   * ```
   */
  async listReassignRequests(
    payload?: ListReassignRequestsParams
  ): Promise<PaginatedResponse<ReassignRequest>> {
    return this.sdk.request('communities:listReassignRequests', payload);
  }

  /**
   * Get a reassign request by ID
   *
   * @example
   * ```typescript
   * const request = await sdk.getCommunities().getReassignRequest({ id: 7 });
   * ```
   */
  async getReassignRequest(payload: { id: number }): Promise<ReassignRequest> {
    return this.sdk.request('communities:getReassignRequest', payload);
  }

  /**
   * Accept a reassign request
   *
   * Moves the member to the target community and removes them from communities
   * managed by the requester. Only managers of the target community (or superusers) can accept.
   *
   * @returns Updated ReassignRequest with status 'accepted'
   * @throws {Error} If request is not pending or caller is not a target community manager
   *
   * @example
   * ```typescript
   * const accepted = await sdk.getCommunities().acceptReassignRequest({ id: 7 });
   * console.log(accepted.status); // 'accepted'
   * ```
   */
  async acceptReassignRequest(payload: { id: number }): Promise<ReassignRequest> {
    return this.sdk.request('communities:acceptReassignRequest', payload);
  }

  /**
   * Reject a reassign request
   *
   * Only pending requests can be rejected.
   *
   * @throws {Error} If request is not pending
   *
   * @example
   * ```typescript
   * await sdk.getCommunities().rejectReassignRequest({ id: 7 });
   * ```
   */
  async rejectReassignRequest(payload: { id: number }): Promise<void> {
    return this.sdk.request('communities:rejectReassignRequest', payload);
  }
}
