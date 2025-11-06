import type { FrontierSDK } from '../sdk';

/**
 * Storage access class for persistent app storage
 */
export class StorageAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Get data from persistent storage
   * Requires permission: storage:get or storage:*
   */
  async get(key: string): Promise<any> {
    return this.sdk.request('storage:get', { key });
  }

  /**
   * Store data persistently
   * Requires permission: storage:set or storage:*
   */
  async set(key: string, value: any): Promise<void> {
    return this.sdk.request('storage:set', { key, value });
  }

  /**
   * Remove data from persistent storage
   * Requires permission: storage:remove or storage:*
   */
  async remove(key: string): Promise<void> {
    return this.sdk.request('storage:remove', { key });
  }

  /**
   * Clear all data from persistent storage
   * Requires permission: storage:clear or storage:*
   */
  async clear(): Promise<void> {
    return this.sdk.request('storage:clear');
  }
}
