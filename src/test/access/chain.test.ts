import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainAccess, Underlying, type ChainConfig, type StableCoin, type Token } from '../../access/chain';
import type { FrontierSDK } from '../../sdk';

describe('ChainAccess', () => {
  let chainAccess: ChainAccess;
  let mockSDK: FrontierSDK;

  const mockStableCoin: StableCoin = {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    underlying: Underlying.USD,
  };

  const mockToken: Token = {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
  };

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
        bridgeSwapRouterFactoryAddress: '0x1234567890123456789012345678901234567890',
        uniswapV3FactoryAddress: '0x0987654321098765432109876543210987654321',
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorer: {
          name: 'BaseScan',
          url: 'https://sepolia.basescan.org',
        },
        stableCoins: [mockStableCoin],
        supportedTokens: [mockToken],
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
        bridgeSwapRouterFactoryAddress: '0x1234567890123456789012345678901234567890',
        uniswapV3FactoryAddress: '0x0987654321098765432109876543210987654321',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorer: {
          name: 'BaseScan',
          url: 'https://basescan.org',
        },
        stableCoins: [mockStableCoin],
        supportedTokens: [mockToken],
        testnet: false,
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockConfig);

      const result = await chainAccess.getCurrentChainConfig();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('bridgeSwapRouterFactoryAddress');
      expect(result).toHaveProperty('uniswapV3FactoryAddress');
      expect(result).toHaveProperty('nativeCurrency');
      expect(result).toHaveProperty('blockExplorer');
      expect(result).toHaveProperty('stableCoins');
      expect(result).toHaveProperty('supportedTokens');
      expect(result).toHaveProperty('testnet');
      expect(result.testnet).toBe(false);
      expect(result.stableCoins).toHaveLength(1);
      expect(result.supportedTokens).toHaveLength(1);
    });
  });
});
