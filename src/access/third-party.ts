import type { FrontierSDK } from '../sdk';
import type { PaginatedResponse } from './user';

// =============================================================================
// Developer Types
// =============================================================================

/**
 * Developer account information
 */
export interface Developer {
  /** Unique developer identifier */
  id: number;
  /** Developer name */
  name: string;
  /** Developer description */
  description: string;
  /** Developer email */
  email: string;
  /** API key */
  apiKey: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Request payload for updating developer information
 */
export interface UpdateDeveloperRequest {
  /** Developer name */
  name?: string;
  /** Developer description */
  description?: string;
  /** Developer email */
  email?: string;
}

/**
 * Response from rotating an API key
 */
export interface RotateKeyResponse {
  /** Response message */
  message: string;
  /** Updated developer with new API key */
  developer: Developer;
}

// =============================================================================
// App Types
// =============================================================================

/**
 * App status
 */
export type AppStatus =
  | 'in_review'
  | 'accepted'
  | 'released'
  | 'rejected'
  | 'request_deactivation'
  | 'deactivated';

/**
 * App permission type
 */
export type AppPermission = string;

/**
 * Registered app information
 */
export interface App {
  /** Unique app identifier */
  id: number;
  /** Developer ID */
  developer: number;
  /** App icon URL */
  icon: string | null;
  /** App name */
  name: string;
  /** Human-readable app identifier */
  readableId: string;
  /** App description */
  description: string;
  /** App URL */
  url: string;
  /** CNAME entry for domain verification */
  cnameEntry: string;
  /** TXT entry for domain verification */
  txtEntry: string | null;
  /** App permissions */
  permissions: AppPermission[];
  /** Permission disclaimer text */
  permissionDisclaimer: string;
  /** App status */
  status: AppStatus;
  /** Review notes from admin */
  reviewNotes: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Request payload for creating an app
 */
export interface CreateAppRequest {
  /** Developer ID */
  developer: number;
  /** App URL */
  url: string;
  /** CNAME entry for domain verification */
  cnameEntry: string;
  /** TXT entry for domain verification */
  txtEntry?: string;
  /** App permissions */
  permissions: AppPermission[];
  /** Permission disclaimer text */
  permissionDisclaimer: string;
}

/**
 * Request payload for updating an app
 */
export interface UpdateAppRequest {
  /** Developer ID */
  developer?: number;
  /** App URL */
  url?: string;
  /** CNAME entry for domain verification */
  cnameEntry?: string;
  /** TXT entry for domain verification */
  txtEntry?: string;
  /** App permissions */
  permissions?: AppPermission[];
  /** Permission disclaimer text */
  permissionDisclaimer?: string;
}

// =============================================================================
// Webhook Types
// =============================================================================

/**
 * Webhook status
 */
export type WebhookStatus = 'IN_REVIEW' | 'LIVE' | 'REJECTED';

/**
 * Webhook event type
 */
export type WebhookEvent = string;

/**
 * Webhook scope - maps event categories to specific IDs or '*' for all
 */
export type WebhookScope = Record<string, number[] | '*'>;

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  /** Event types subscribed to */
  events: WebhookEvent[];
  /** Scope of the webhook */
  scope: WebhookScope;
}

/**
 * Webhook information
 */
export interface Webhook {
  /** Unique webhook identifier */
  id: number;
  /** Developer ID */
  developer: number;
  /** Webhook name */
  name: string;
  /** Webhook description */
  description: string;
  /** Target URL for webhook delivery */
  targetUrl: string;
  /** Webhook configuration */
  config: WebhookConfig;
  /** Signing public key */
  signingPublicKey: string;
  /** Webhook status */
  status: WebhookStatus;
  /** Review notes from admin */
  reviewNotes: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Request payload for creating a webhook
 */
export interface CreateWebhookRequest {
  /** Developer ID */
  developer: number;
  /** Webhook name */
  name: string;
  /** Webhook description */
  description: string;
  /** Target URL for webhook delivery */
  targetUrl: string;
  /** Webhook configuration */
  config: WebhookConfig;
}

/**
 * Request payload for updating a webhook
 */
export interface UpdateWebhookRequest {
  /** Developer ID */
  developer?: number;
  /** Webhook name */
  name?: string;
  /** Webhook description */
  description?: string;
  /** Target URL for webhook delivery */
  targetUrl?: string;
  /** Webhook configuration */
  config?: WebhookConfig;
}

/**
 * Response from rotating a webhook signing key
 */
export interface RotateWebhookKeyResponse {
  /** Response message */
  message: string;
  /** Updated webhook with new signing key */
  webhook: Webhook;
}

// =============================================================================
// Pagination Types
// =============================================================================

/**
 * Pagination parameters
 */
export interface ListParams {
  /** Maximum number of results to return */
  limit?: number;
  /** Offset into the result set */
  offset?: number;
}

/**
 * Parameters for listing apps
 */
export interface ListAppsParams extends ListParams {
  /** Filter by developer ID */
  developerId?: number;
}

/**
 * Parameters for listing webhooks
 */
export interface ListWebhooksParams extends ListParams {
  /** Filter by developer ID */
  developerId?: number;
}

/**
 * Third-party access class for interacting with third-party developer features.
 *
 * This class provides methods to:
 * - Manage developer accounts
 * - Register and manage apps
 * - Configure webhooks for event notifications
 *
 * All methods require appropriate permissions and authentication.
 */
export class ThirdPartyAccess {
  constructor(private sdk: FrontierSDK) {}

  // ===========================================================================
  // Developer Methods
  // ===========================================================================

  /**
   * List developer accounts (paginated)
   * Requires permission: `thirdParty:listDevelopers` or `thirdParty:*`
   *
   * @param payload.limit - Maximum number of results to return
   * @param payload.offset - Offset into the result set
   * @returns Paginated response of developers
   *
   * @example
   * ```typescript
   * const developers = await sdk.getThirdParty().listDevelopers({ limit: 20, offset: 0 });
   * console.log('Total developers:', developers.count);
   * ```
   */
  async listDevelopers(payload?: ListParams): Promise<PaginatedResponse<Developer>> {
    return this.sdk.request('thirdParty:listDevelopers', payload);
  }

  /**
   * Get developer details by ID
   * Requires permission: `thirdParty:getDeveloper` or `thirdParty:*`
   *
   * @param payload.id - Developer ID
   * @returns Developer details
   *
   * @example
   * ```typescript
   * const developer = await sdk.getThirdParty().getDeveloper({ id: 123 });
   * console.log('Developer:', developer.name);
   * ```
   */
  async getDeveloper(payload: { id: number }): Promise<Developer> {
    return this.sdk.request('thirdParty:getDeveloper', payload);
  }

  /**
   * Update developer information
   * Requires permission: `thirdParty:updateDeveloper` or `thirdParty:*`
   *
   * @param payload.id - Developer ID
   * @param payload.data - Update data
   * @returns Updated developer
   *
   * @example
   * ```typescript
   * const developer = await sdk.getThirdParty().updateDeveloper({
   *   id: 123,
   *   data: { name: 'New Name', website: 'https://example.com' }
   * });
   * ```
   */
  async updateDeveloper(payload: {
    id: number;
    data: UpdateDeveloperRequest;
  }): Promise<Developer> {
    return this.sdk.request('thirdParty:updateDeveloper', payload);
  }

  /**
   * Rotate developer API key
   * Requires permission: `thirdParty:rotateDeveloperApiKey` or `thirdParty:*`
   *
   * Note: The new API key is only shown once in the response
   *
   * @param payload.id - Developer ID
   * @returns Response containing the new API key
   *
   * @example
   * ```typescript
   * const result = await sdk.getThirdParty().rotateDeveloperApiKey({ id: 123 });
   * console.log('New API key:', result.apiKey);
   * // Store this key securely - it won't be shown again!
   * ```
   */
  async rotateDeveloperApiKey(payload: { id: number }): Promise<RotateKeyResponse> {
    return this.sdk.request('thirdParty:rotateDeveloperApiKey', payload);
  }

  // ===========================================================================
  // App Methods
  // ===========================================================================

  /**
   * List registered apps (paginated)
   * Requires permission: `thirdParty:listApps` or `thirdParty:*`
   *
   * @param payload.limit - Maximum number of results to return
   * @param payload.offset - Offset into the result set
   * @param payload.developerId - Filter by developer ID
   * @returns Paginated response of apps
   *
   * @example
   * ```typescript
   * const apps = await sdk.getThirdParty().listApps({ limit: 20, offset: 0 });
   * console.log('Total apps:', apps.count);
   *
   * // Filter by developer
   * const devApps = await sdk.getThirdParty().listApps({ developerId: 123 });
   * ```
   */
  async listApps(payload?: ListAppsParams): Promise<PaginatedResponse<App>> {
    return this.sdk.request('thirdParty:listApps', payload);
  }

  /**
   * Register a new app
   * Requires permission: `thirdParty:createApp` or `thirdParty:*`
   *
   * Note: App name, description, and icon are automatically fetched from the URL's metadata
   *
   * @param payload - App creation payload with URL
   * @returns Created app
   *
   * @example
   * ```typescript
   * const app = await sdk.getThirdParty().createApp({
   *   url: 'https://myapp.example.com'
   * });
   * console.log('Created app:', app.id, app.name);
   * ```
   */
  async createApp(payload: CreateAppRequest): Promise<App> {
    return this.sdk.request('thirdParty:createApp', payload);
  }

  /**
   * Get app details by ID
   * Requires permission: `thirdParty:getApp` or `thirdParty:*`
   *
   * @param payload.id - App ID
   * @returns App details
   *
   * @example
   * ```typescript
   * const app = await sdk.getThirdParty().getApp({ id: 123 });
   * console.log('App:', app.name, app.status);
   * ```
   */
  async getApp(payload: { id: number }): Promise<App> {
    return this.sdk.request('thirdParty:getApp', payload);
  }

  /**
   * Update an app
   * Requires permission: `thirdParty:updateApp` or `thirdParty:*`
   *
   * @param payload.id - App ID
   * @param payload.data - Update data
   * @returns Updated app
   *
   * @example
   * ```typescript
   * const app = await sdk.getThirdParty().updateApp({
   *   id: 123,
   *   data: { name: 'Updated App Name', description: 'New description' }
   * });
   * ```
   */
  async updateApp(payload: { id: number; data: UpdateAppRequest }): Promise<App> {
    return this.sdk.request('thirdParty:updateApp', payload);
  }

  /**
   * Request app deactivation
   * Requires permission: `thirdParty:deleteApp` or `thirdParty:*`
   *
   * @param payload.id - App ID
   *
   * @example
   * ```typescript
   * await sdk.getThirdParty().deleteApp({ id: 123 });
   * ```
   */
  async deleteApp(payload: { id: number }): Promise<void> {
    return this.sdk.request('thirdParty:deleteApp', payload);
  }

  // ===========================================================================
  // Webhook Methods
  // ===========================================================================

  /**
   * List webhooks (paginated)
   * Requires permission: `thirdParty:listWebhooks` or `thirdParty:*`
   *
   * Note: Maximum 3 webhooks per developer account
   *
   * @param payload.limit - Maximum number of results to return
   * @param payload.offset - Offset into the result set
   * @param payload.developerId - Filter by developer ID
   * @returns Paginated response of webhooks
   *
   * @example
   * ```typescript
   * const webhooks = await sdk.getThirdParty().listWebhooks({ limit: 10, offset: 0 });
   * console.log('Total webhooks:', webhooks.count);
   *
   * // Filter by developer
   * const devWebhooks = await sdk.getThirdParty().listWebhooks({ developerId: 123 });
   * ```
   */
  async listWebhooks(payload?: ListWebhooksParams): Promise<PaginatedResponse<Webhook>> {
    return this.sdk.request('thirdParty:listWebhooks', payload);
  }

  /**
   * Create a new webhook
   * Requires permission: `thirdParty:createWebhook` or `thirdParty:*`
   *
   * Note: New webhooks require admin approval before going live
   *
   * @param payload - Webhook creation payload
   * @returns Created webhook
   *
   * @example
   * ```typescript
   * const webhook = await sdk.getThirdParty().createWebhook({
   *   url: 'https://myapp.example.com/webhooks',
   *   events: ['app.approved', 'user.registered']
   * });
   * console.log('Created webhook:', webhook.id);
   * ```
   */
  async createWebhook(payload: CreateWebhookRequest): Promise<Webhook> {
    return this.sdk.request('thirdParty:createWebhook', payload);
  }

  /**
   * Get webhook details by ID
   * Requires permission: `thirdParty:getWebhook` or `thirdParty:*`
   *
   * @param payload.id - Webhook ID
   * @returns Webhook details
   *
   * @example
   * ```typescript
   * const webhook = await sdk.getThirdParty().getWebhook({ id: 123 });
   * console.log('Webhook:', webhook.url, webhook.status);
   * ```
   */
  async getWebhook(payload: { id: number }): Promise<Webhook> {
    return this.sdk.request('thirdParty:getWebhook', payload);
  }

  /**
   * Update a webhook
   * Requires permission: `thirdParty:updateWebhook` or `thirdParty:*`
   *
   * Note: Config changes require admin approval before going live
   *
   * @param payload.id - Webhook ID
   * @param payload.data - Update data
   * @returns Updated webhook
   *
   * @example
   * ```typescript
   * const webhook = await sdk.getThirdParty().updateWebhook({
   *   id: 123,
   *   data: { url: 'https://newurl.example.com/webhooks' }
   * });
   * ```
   */
  async updateWebhook(payload: {
    id: number;
    data: UpdateWebhookRequest;
  }): Promise<Webhook> {
    return this.sdk.request('thirdParty:updateWebhook', payload);
  }

  /**
   * Delete a webhook
   * Requires permission: `thirdParty:deleteWebhook` or `thirdParty:*`
   *
   * @param payload.id - Webhook ID
   *
   * @example
   * ```typescript
   * await sdk.getThirdParty().deleteWebhook({ id: 123 });
   * ```
   */
  async deleteWebhook(payload: { id: number }): Promise<void> {
    return this.sdk.request('thirdParty:deleteWebhook', payload);
  }

  /**
   * Rotate webhook signing key
   * Requires permission: `thirdParty:rotateWebhookSigningKey` or `thirdParty:*`
   *
   * Note: The new signing public key is returned in the response
   *
   * @param payload.id - Webhook ID
   * @returns Response containing the new signing public key
   *
   * @example
   * ```typescript
   * const result = await sdk.getThirdParty().rotateWebhookSigningKey({ id: 123 });
   * console.log('New signing key:', result.signingPublicKey);
   * ```
   */
  async rotateWebhookSigningKey(payload: {
    id: number;
  }): Promise<RotateWebhookKeyResponse> {
    return this.sdk.request('thirdParty:rotateWebhookSigningKey', payload);
  }
}
