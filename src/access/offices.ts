import type { FrontierSDK } from '../sdk';
import type { PaginatedResponse } from './user';

/**
 * Access pass status
 */
export type AccessPassStatus = 'active' | 'revoked';

/**
 * Access pass for a membership contract
 */
export interface AccessPass {
  /** Unique access pass ID */
  id: number;
  /** Email of the pass holder */
  email: string;
  /** Pass holder's first name */
  firstName: string;
  /** Pass holder's last name */
  lastName: string;
  /** Pass status: active or revoked */
  status: AccessPassStatus;
  /** Membership contract ID this pass belongs to */
  membershipContract: number;
  /** Human-readable contract reference number */
  contractReference: string;
  /** When the pass was created (ISO 8601) */
  createdAt: string;
  /** When the pass was revoked, or null */
  revokedAt: string | null;
  /** When the pass was last updated (ISO 8601) */
  updatedAt: string;
}

/**
 * Payload for creating an access pass
 */
export interface CreateAccessPassRequest {
  /** Email of the pass holder */
  email: string;
  /** Pass holder's first name */
  firstName: string;
  /** Pass holder's last name */
  lastName: string;
  /** Membership contract ID */
  membershipContract: number;
}

/**
 * Pagination and filter parameters for listing access passes
 */
export interface ListAccessPassesParams {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset into the result set */
  offset?: number;
  /** When true, include revoked passes */
  includeRevoked?: boolean;
}

/**
 * Offices access class for managing office access passes.
 *
 * Access via: `sdk.getOffices()`
 *
 * ## Access Rights
 *
 * All endpoints require authentication and an active subscription.
 * Additionally, the caller must be a manager of the membership contract's
 * organization (or a superuser). Only passes for contracts the caller
 * manages are visible.
 */
export class OfficesAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Create an access pass for a membership contract
   *
   * If the user (by email) does not exist, an inactive account is created automatically.
   * Each user can only have one active pass per contract.
   *
   * @param payload - Pass holder details and contract ID
   * @returns The created access pass
   * @throws {Error} If caller is not a contract manager or user already has an active pass
   *
   * @example
   * ```typescript
   * const pass = await sdk.getOffices().createAccessPass({
   *   email: 'visitor@example.com',
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   *   membershipContract: 5,
   * });
   * ```
   */
  async createAccessPass(payload: CreateAccessPassRequest): Promise<AccessPass> {
    return this.sdk.request('offices:createAccessPass', payload);
  }

  /**
   * List access passes for contracts the user manages (paginated)
   *
   * By default only active passes are returned; set `includeRevoked: true` to include revoked.
   * Results are ordered newest first.
   *
   * @example
   * ```typescript
   * const passes = await sdk.getOffices().listAccessPasses({ limit: 20 });
   * passes.results.forEach(p => console.log(p.email, p.status));
   * ```
   */
  async listAccessPasses(
    payload?: ListAccessPassesParams
  ): Promise<PaginatedResponse<AccessPass>> {
    return this.sdk.request('offices:listAccessPasses', payload);
  }

  /**
   * Get an access pass by ID
   *
   * @param payload.id - Access pass ID
   * @throws {Error} If not found or caller lacks permission
   *
   * @example
   * ```typescript
   * const pass = await sdk.getOffices().getAccessPass({ id: 42 });
   * ```
   */
  async getAccessPass(payload: { id: number }): Promise<AccessPass> {
    return this.sdk.request('offices:getAccessPass', payload);
  }

  /**
   * Revoke an access pass by ID
   *
   * Marks the pass as revoked and disables building access.
   * Cannot revoke an already-revoked pass.
   *
   * @param payload.id - Access pass ID
   * @throws {Error} If pass is already revoked or caller lacks permission
   *
   * @example
   * ```typescript
   * await sdk.getOffices().revokeAccessPass({ id: 42 });
   * ```
   */
  async revokeAccessPass(payload: { id: number }): Promise<void> {
    return this.sdk.request('offices:revokeAccessPass', payload);
  }
}
