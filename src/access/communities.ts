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
 * Communities access class for retrieving community information
 *
 * This class provides methods to:
 * - List all visible communities
 * - Retrieve a specific community by ID or slug
 *
 * All methods require appropriate permissions.
 */
export class CommunitiesAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * List all communities (paginated)
   *
   * Returns all communities visible to the public (hidden communities are excluded).
   *
   * @param payload.limit - Maximum number of results to return
   * @param payload.offset - Offset into the result set
   * @returns Paginated response of Community objects
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
   * @returns Community object
   * @throws {Error} If community is not found
   *
   * @example
   * ```typescript
   * const community = await sdk.getCommunities().getCommunity({ idOrSlug: 'arts-and-music' });
   * console.log('Community:', community.name);
   *
   * // By numeric ID
   * const byId = await sdk.getCommunities().getCommunity({ idOrSlug: 3 });
   * ```
   */
  async getCommunity(payload: { idOrSlug: string | number }): Promise<Community> {
    return this.sdk.request('communities:getCommunity', payload);
  }
}
