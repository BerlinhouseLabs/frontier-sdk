import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainAccess, type ChainConfig } from '../../access/chain';
import type { FrontierSDK } from '../../sdk';

describe('ChainAccess', () => {
  let chainAccess: ChainAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    chainAccess = new ChainAccess(mockSDK);
  });

  describe('getCurrentNetwork', () => {
    it('should request current network', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue('base-sepolia');

      const result = await chainAccess.getCurrentNetwork();

      expect(mockSDK.request).toHaveBeenCalledWith('chain:getCurrentNetwork');
      expect(result).toBe('base-sepolia');
    });

    it('should return network identifier string', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue('base');

      const result = await chainAccess.getCurrentNetwork();

      expect(typeof result).toBe('string');
      expect(result).toBe('base');
    });
  });

  describe('getAvailableNetworks', () => {
    it('should request available networks', async () => {
      const mockNetworks = ['base', 'base-sepolia'];
      vi.mocked(mockSDK.request).mockResolvedValue(mockNetworks);

      const result = await chainAccess.getAvailableNetworks();

      expect(mockSDK.request).toHaveBeenCalledWith('chain:getAvailableNetworks');
      expect(result).toEqual(mockNetworks);
    });

    it('should return array of network identifiers', async () => {
      const mockNetworks = ['ethereum', 'sepolia', 'base'];
      vi.mocked(mockSDK.request).mockResolvedValue(mockNetworks);

      const result = await chainAccess.getAvailableNetworks();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result).toContain('ethereum');
    });
  });

  describe('switchNetwork', () => {
    it('should request network switch with network parameter', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await chainAccess.switchNetwork('base');

      expect(mockSDK.request).toHaveBeenCalledWith('chain:switchNetwork', { network: 'base' });
    });

    it('should handle successful network switch', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await expect(chainAccess.switchNetwork('base-sepolia')).resolves.toBeUndefined();
    });

    it('should throw error if network switch fails', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Network not available'));

      await expect(chainAccess.switchNetwork('invalid-network')).rejects.toThrow('Network not available');
    });
  });

  describe('getCurrentChainConfig', () => {
    it('should request current chain configuration', async () => {
      const mockConfig: ChainConfig = {
        id: 84532,
        name: 'Base Sepolia',
        network: 'base-sepolia',
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrl: 'https://sepolia.base.org',
        blockExplorer: {
          name: 'BaseScan',
          url: 'https://sepolia.basescan.org',
        },
        testnet: true,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockConfig);

      const result = await chainAccess.getCurrentChainConfig();

      expect(mockSDK.request).toHaveBeenCalledWith('chain:getCurrentChainConfig');
      expect(result).toEqual(mockConfig);
    });

    it('should return complete chain configuration', async () => {
      const mockConfig: ChainConfig = {
        id: 8453,
        name: 'Base',
        network: 'base',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrl: 'https://mainnet.base.org',
        blockExplorer: {
          name: 'BaseScan',
          url: 'https://basescan.org',
        },
        testnet: false,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockConfig);

      const result = await chainAccess.getCurrentChainConfig();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('nativeCurrency');
      expect(result).toHaveProperty('rpcUrl');
      expect(result).toHaveProperty('blockExplorer');
      expect(result).toHaveProperty('testnet');
      expect(result.testnet).toBe(false);
    });
  });
});
