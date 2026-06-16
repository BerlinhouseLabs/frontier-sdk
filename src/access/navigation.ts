import type { FrontierSDK } from '../sdk';

export interface NavigationOpenAppOptions {
  path?: string;
  params?: Record<string, string>;
}

export interface DeepLinkData {
  path?: string;
  params?: Record<string, string>;
}

/**
 * Navigation access class for app-to-app deep linking
 */
export class NavigationAccess {
  private deepLinkCallbacks: Array<(data: DeepLinkData) => void> = [];
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor(private sdk: FrontierSDK) {
    this.messageHandler = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type === 'navigation:deepLinkParams') {
        const data = event.data.payload as DeepLinkData;
        for (const cb of this.deepLinkCallbacks) {
          cb(data);
        }
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Navigate the host to another app
   * Requires permission: navigation:openApp or navigation:*
   * @param appId - Target app ID from the registry
   * @param options - Optional deep link path and params for the target app
   */
  async openApp(
    appId: string,
    options?: NavigationOpenAppOptions,
  ): Promise<void> {
    return this.sdk.request('navigation:openApp', {
      appId,
      path: options?.path,
      params: options?.params,
    });
  }

  /**
   * Ask the host app to open an external URL.
   * Requires permission: navigation:openExternalUrl or navigation:*
   * @param url - External URL to open from the host context
   */
  async openExternalUrl(url: string): Promise<void> {
    return this.sdk.request('navigation:openExternalUrl', { url });
  }

  /**
   * Close the current app and return to the previous screen
   * Requires permission: navigation:close or navigation:*
   */
  async close(): Promise<void> {
    return this.sdk.request('navigation:close');
  }

  /**
   * Register a callback for incoming deep link data.
   * Called when this app was opened via another app's openApp() call.
   * @param callback - Receives the deep link path and params
   * @returns Unsubscribe function
   */
  onDeepLink(callback: (data: DeepLinkData) => void): () => void {
    this.deepLinkCallbacks.push(callback);
    return () => {
      this.deepLinkCallbacks = this.deepLinkCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  /**
   * Cleanup: remove event listeners
   * @internal
   */
  destroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.deepLinkCallbacks = [];
  }
}
