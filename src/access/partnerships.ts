import type { FrontierSDK } from '../sdk';
import type { PaginatedResponse } from './user';

/**
 * Sponsor passes API
 *
 * Sponsor pass creation and management
 */
export type SponsorPassStatus = 'active' | 'revoked';

export interface SponsorPass {
  id: number;
  sponsor: number;
  sponsorName: string;
  firstName: string;
  lastName: string;
  email: string;
  status: SponsorPassStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
}

/**
 * Payload for creating a SponsorPass.
 */
export interface CreateSponsorPassRequest {
  sponsor: number;
  firstName: string;
  lastName: string;
  email: string;
  expiresAt?: string;
}

export interface ListSponsorPassesParams {
  limit?: number;
  offset?: number;
}

export interface ListAllSponsorPassesParams extends ListSponsorPassesParams {
  includeRevoked?: boolean;
}

export interface Sponsor {
  id: number;
  name: string;
  dailyRate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListSponsorsParams {
  limit?: number;
  offset?: number;
}

/**
 * Partnerships access class for interacting with partnership-related features.
 *
 * This class provides methods to:
 * - Create SponsorPasses
 * - List active SponsorPasses
 * - List all SponsorPasses (optionally including revoked)
 * - Retrieve and revoke SponsorPasses
 */
export class PartnershipsAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Create a SponsorPass
   * Requires permission: `partnerships:createSponsorPass` or `partnerships:*`
   *
   * @param payload - SponsorPass creation payload
   * @returns Created SponsorPass
   *
   * @example
   * ```typescript
   * const pass = await sdk.getPartnerships().createSponsorPass({
   *   sponsor: 123,
   *   firstName: 'Ada',
   *   lastName: 'Lovelace',
   *   email: 'ada@example.com',
   * });
   * console.log('Created SponsorPass:', pass.id);
   * ```
   */
  async createSponsorPass(payload: CreateSponsorPassRequest): Promise<SponsorPass> {
    return this.sdk.request('partnerships:createSponsorPass', payload);
  }

  /**
   * List active SponsorPasses (paginated)
   * Requires permission: `partnerships:listActiveSponsorPasses` or `partnerships:*`
   *
   * @param payload.limit - Maximum number of results to return
   * @param payload.offset - Offset into the result set
   * @returns Paginated response of active SponsorPasses
   *
   * @example
   * ```typescript
   * const active = await sdk.getPartnerships().listActiveSponsorPasses({ limit: 20, offset: 0 });
   * console.log('Active count:', active.count);
   * ```
   */
  async listActiveSponsorPasses(
    payload?: ListSponsorPassesParams
  ): Promise<PaginatedResponse<SponsorPass>> {
    return this.sdk.request('partnerships:listActiveSponsorPasses', payload);
  }

  /**
   * List all SponsorPasses (paginated)
   * Requires permission: `partnerships:listAllSponsorPasses` or `partnerships:*`
   *
   * @param payload.includeRevoked - When true, include revoked passes
   * @returns Paginated response of SponsorPasses
   *
   * @example
   * ```typescript
   * const all = await sdk.getPartnerships().listAllSponsorPasses({ includeRevoked: true, limit: 50, offset: 0 });
   * console.log('Total passes:', all.count);
   * ```
   */
  async listAllSponsorPasses(
    payload?: ListAllSponsorPassesParams
  ): Promise<PaginatedResponse<SponsorPass>> {
    return this.sdk.request('partnerships:listAllSponsorPasses', payload);
  }

  async listSponsors(payload?: ListSponsorsParams): Promise<PaginatedResponse<Sponsor>> {
    return this.sdk.request('partnerships:listSponsors', payload);
  }

  async getSponsor(payload: { id: number }): Promise<Sponsor> {
    return this.sdk.request('partnerships:getSponsor', payload);
  }

  /**
   * Retrieve a specific SponsorPass by ID
   * Requires permission: `partnerships:getSponsorPass` or `partnerships:*`
   *
   * @param payload.id - SponsorPass ID
   * @returns SponsorPass
   *
   * @example
   * ```typescript
   * const pass = await sdk.getPartnerships().getSponsorPass({ id: 123 });
   * console.log('SponsorPass:', pass);
   * ```
   */
  async getSponsorPass(payload: { id: number }): Promise<SponsorPass> {
    return this.sdk.request('partnerships:getSponsorPass', payload);
  }

  /**
   * Revoke a SponsorPass by ID
   * Requires permission: `partnerships:revokeSponsorPass` or `partnerships:*`
   *
   * Note: backend revokes (does not delete).
   *
   * @param payload.id - SponsorPass ID
   *
   * @example
   * ```typescript
   * await sdk.getPartnerships().revokeSponsorPass({ id: 123 });
   * ```
   */
  async revokeSponsorPass(payload: { id: number }): Promise<void> {
    return this.sdk.request('partnerships:revokeSponsorPass', payload);
  }
}
