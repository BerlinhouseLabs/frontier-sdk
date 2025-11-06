import type { FrontierSDK } from '../sdk';

/**
 * Chain configuration information
 */
export interface ChainConfig {
  /** Chain ID */
  id: number;
  /** Chain name */
  name: string;
  /** Network identifier */
  network: string;
  /** Native currency information */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** RPC URL */
  rpcUrl: string;
  /** Block explorer information */
  blockExplorer: {
    name: string;
    url: string;
  };
  /** Whether this is a testnet */
  testnet: boolean;
}

/**
 * Chain access class for interacting with blockchain networks
 * 
 * This class provides methods to:
 * - Query current network information
 * - Get available networks
 * - Switch between networks
 * - Get full chain configuration
 * 
 * All methods require appropriate permissions.
 */
export class ChainAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Get the current network name
   * 
   * Returns the network identifier for the currently active chain
   * (e.g., 'base', 'base-sepolia', 'ethereum').
   * 
   * @returns Network identifier string
   * 
   * @example
   * ```typescript
   * const network = await sdk.getChain().getCurrentNetwork();
   * console.log('Current network:', network); // 'base-sepolia'
   * ```
   */
  async getCurrentNetwork(): Promise<string> {
    return this.sdk.request('chain:getCurrentNetwork');
  }

  /**
   * Get all available networks
   * 
   * Returns a list of network identifiers that the app can switch to.
   * 
   * @returns Array of network identifier strings
   * 
   * @example
   * ```typescript
   * const networks = await sdk.getChain().getAvailableNetworks();
   * console.log('Available networks:', networks); // ['base', 'base-sepolia']
   * ```
   */
  async getAvailableNetworks(): Promise<string[]> {
    return this.sdk.request('chain:getAvailableNetworks');
  }

  /**
   * Switch to a different network
   * 
   * Changes the active blockchain network. This will affect all subsequent
   * wallet operations and contract interactions.
   * 
   * @param network - The network identifier to switch to
   * @throws {Error} If the network is not available or switching fails
   * 
   * @example
   * ```typescript
   * await sdk.getChain().switchNetwork('base');
   * console.log('Switched to Base mainnet');
   * ```
   */
  async switchNetwork(network: string): Promise<void> {
    return this.sdk.request('chain:switchNetwork', { network });
  }

  /**
   * Get full chain configuration for current network
   * 
   * Returns detailed configuration including chain ID, RPC URLs,
   * block explorer, and native currency information.
   * 
   * @returns Complete chain configuration object
   * 
   * @example
   * ```typescript
   * const config = await sdk.getChain().getCurrentChainConfig();
   * console.log('Chain ID:', config.id);
   * console.log('Block explorer:', config.blockExplorer.url);
   * ```
   */
  async getCurrentChainConfig(): Promise<ChainConfig> {
    return this.sdk.request('chain:getCurrentChainConfig');
  }
}
