import type { SDKRequest, SDKResponse } from './types';
import { WalletAccess } from './access/wallet';
import { StorageAccess } from './access/storage';
import { ChainAccess } from './access/chain';
import { UserAccess } from './access/user';
import { PartnershipsAccess } from './access/partnerships';
import { ThirdPartyAccess } from './access/third-party';
import { CommunitiesAccess } from './access/communities';
import { EventsAccess } from './access/events';
import { OfficesAccess } from './access/offices';
import { NavigationAccess } from './access/navigation';

export class FrontierSDK {
  private requestId = 0;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();
  private wallet: WalletAccess;
  private storage: StorageAccess;
  private chain: ChainAccess;
  private user: UserAccess;
  private partnerships: PartnershipsAccess;
  private thirdParty: ThirdPartyAccess;
  private communities: CommunitiesAccess;
  private events: EventsAccess;
  private offices: OfficesAccess;
  private navigation: NavigationAccess;

  constructor() {
    this.wallet = new WalletAccess(this);
    this.storage = new StorageAccess(this);
    this.chain = new ChainAccess(this);
    this.user = new UserAccess(this);
    this.partnerships = new PartnershipsAccess(this);
    this.thirdParty = new ThirdPartyAccess(this);
    this.communities = new CommunitiesAccess(this);
    this.events = new EventsAccess(this);
    this.offices = new OfficesAccess(this);
    this.navigation = new NavigationAccess(this);

    window.addEventListener('message', this.handleMessage);
    this.notifyReady();
  }

  private handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;

    const response = event.data as SDKResponse;
    const pending = this.pendingRequests.get(response.requestId);
    
    if (pending) {
      if (response.type === 'error') {
        pending.reject(new Error(response.error));
      } else {
        pending.resolve(response.result);
      }
      this.pendingRequests.delete(response.requestId);
    }
  };

  /**
   * Internal request method used by access classes
   * @internal
   */
  request(type: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${this.requestId++}`;
      this.pendingRequests.set(requestId, { resolve, reject });

      const request: SDKRequest = { type, requestId, payload };
      window.parent.postMessage(request, '*');

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  private notifyReady(): void {
    window.parent.postMessage({ type: 'app:ready', payload: null }, '*');
  }

  /**
   * Get wallet access instance
   */
  getWallet(): WalletAccess {
    return this.wallet;
  }

  /**
   * Get storage access instance
   */
  getStorage(): StorageAccess {
    return this.storage;
  }

  /**
   * Get chain access instance
   */
  getChain(): ChainAccess {
    return this.chain;
  }

  /**
   * Get user access instance
   */
  getUser(): UserAccess {
    return this.user;
  }

  /**
   * Get partnerships access instance
   */
  getPartnerships(): PartnershipsAccess {
    return this.partnerships;
  }

  /**
   * Get third-party access instance
   */
  getThirdParty(): ThirdPartyAccess {
    return this.thirdParty;
  }

  /**
   * Get communities access instance
   */
  getCommunities(): CommunitiesAccess {
    return this.communities;
  }

  /**
   * Get events access instance
   */
  getEvents(): EventsAccess {
    return this.events;
  }

  /**
   * Get offices access instance
   */
  getOffices(): OfficesAccess {
    return this.offices;
  }

  /**
   * Get navigation access instance
   */
  getNavigation(): NavigationAccess {
    return this.navigation;
  }

  /**
   * Cleanup: Remove event listeners
   * Call this when your app is being destroyed
   */
  destroy(): void {
    window.removeEventListener('message', this.handleMessage);
    this.navigation.destroy();
    this.pendingRequests.clear();
  }
}
