import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletAccess } from '../../access/wallet';
import type { FrontierSDK } from '../../sdk';
import type { SmartAccount, UserOperationReceipt, GasOverrides, ExecuteCall, SwapResult, SwapQuote } from '../../access/wallet';
import { SwapResultStatus } from '../../access/wallet';

describe('WalletAccess', () => {
  let wallet: WalletAccess;
  let mockSDK: FrontierSDK;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = vi.fn();
    mockSDK = {
      request: mockRequest,
    } as any;

    wallet = new WalletAccess(mockSDK);
  });

  describe('getBalance', () => {
    it('should call SDK request with wallet:getBalance type', async () => {
      const mockBalance = {
        total: 1500000000000000000n,
        fnd: 1000000000000000000n,
        internalFnd: 500000000000000000n,
      };
      mockRequest.mockResolvedValue(mockBalance);

      const result = await wallet.getBalance();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getBalance');
      expect(result).toEqual(mockBalance);
    });

    it('should handle zero balances', async () => {
      const zeroBalance = {
        total: 0n,
        fnd: 0n,
        internalFnd: 0n,
      };
      mockRequest.mockResolvedValue(zeroBalance);

      const result = await wallet.getBalance();

      expect(result).toEqual(zeroBalance);
    });

    it('should handle large balances', async () => {
      const largeBalance = 1000000000000000000000000n; // 1 million
      mockRequest.mockResolvedValue(largeBalance);

      const result = await wallet.getBalance();

      expect(result).toBe(largeBalance);
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('No wallet found'));

      await expect(wallet.getBalance()).rejects.toThrow('No wallet found');
    });
  });

  describe('getBalanceFormatted', () => {
    it('should call SDK request with wallet:getBalanceFormatted type', async () => {
      const mockFormatted = {
        total: '$15.00',
        fnd: '$10.00',
        internalFnd: '$5.00',
      };
      mockRequest.mockResolvedValue(mockFormatted);

      const result = await wallet.getBalanceFormatted();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getBalanceFormatted');
      expect(result).toEqual(mockFormatted);
    });

    it('should handle zero balance formatted', async () => {
      const zeroFormatted = {
        total: '$0.00',
        fnd: '$0.00',
        internalFnd: '$0.00',
      };
      mockRequest.mockResolvedValue(zeroFormatted);

      const result = await wallet.getBalanceFormatted();

      expect(result).toEqual(zeroFormatted);
    });

    it('should handle large formatted balances', async () => {
      mockRequest.mockResolvedValue('$1000000.00');

      const result = await wallet.getBalanceFormatted();

      expect(result).toBe('$1000000.00');
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('No wallet found'));

      await expect(wallet.getBalanceFormatted()).rejects.toThrow('No wallet found');
    });
  });

  describe('getAddress', () => {
    it('should call SDK request with wallet:getAddress type', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      mockRequest.mockResolvedValue(mockAddress);

      const result = await wallet.getAddress();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getAddress');
      expect(result).toBe(mockAddress);
    });

    it('should handle different address formats', async () => {
      const checksumAddress = '0xAbCdEf1234567890123456789012345678901234';
      mockRequest.mockResolvedValue(checksumAddress);

      const result = await wallet.getAddress();

      expect(result).toBe(checksumAddress);
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('No wallet found'));

      await expect(wallet.getAddress()).rejects.toThrow('No wallet found');
    });
  });

  describe('getSmartAccount', () => {
    const mockAccount: SmartAccount = {
      id: 1,
      ownerAddress: '0x1234567890123456789012345678901234567890',
      contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      network: 'sepolia',
      status: 'deployed',
      deploymentTransactionHash: '0xhash123',
      createdAt: '2024-01-01T00:00:00Z',
    };

    it('should call SDK request with wallet:getSmartAccount type', async () => {
      mockRequest.mockResolvedValue(mockAccount);

      const result = await wallet.getSmartAccount();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getSmartAccount');
      expect(result).toEqual(mockAccount);
    });

    it('should return account with all properties', async () => {
      mockRequest.mockResolvedValue(mockAccount);

      const result = await wallet.getSmartAccount();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('ownerAddress');
      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('deploymentTransactionHash');
      expect(result).toHaveProperty('createdAt');
    });

    it('should handle account with null contract address', async () => {
      const undeployedAccount = { ...mockAccount, contractAddress: null };
      mockRequest.mockResolvedValue(undeployedAccount);

      const result = await wallet.getSmartAccount();

      expect(result.contractAddress).toBeNull();
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('No smart account found for sepolia network'));

      await expect(wallet.getSmartAccount()).rejects.toThrow('No smart account found for sepolia network');
    });
  });

  describe('transferERC20', () => {
    const tokenAddress = '0x1111111111111111111111111111111111111111';
    const toAddress = '0x2222222222222222222222222222222222222222';
    const amount = 1000000n;
    
    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:transferERC20 type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.transferERC20(tokenAddress, toAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferERC20', {
        tokenAddress,
        to: toAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
        maxPriorityFeePerGas: 50000n,
      };

      await wallet.transferERC20(tokenAddress, toAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferERC20', {
        tokenAddress,
        to: toAddress,
        amount,
        overrides,
      });
    });

    it('should handle different token amounts', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const largeAmount = 1000000000000n;

      await wallet.transferERC20(tokenAddress, toAddress, largeAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferERC20', {
        tokenAddress,
        to: toAddress,
        amount: largeAmount,
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Insufficient balance'));

      await expect(wallet.transferERC20(tokenAddress, toAddress, amount)).rejects.toThrow('Insufficient balance');
    });
  });

  describe('approveERC20', () => {
    const tokenAddress = '0x1111111111111111111111111111111111111111';
    const spenderAddress = '0x3333333333333333333333333333333333333333';
    const amount = 1000000n;
    
    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:approveERC20 type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.approveERC20(tokenAddress, spenderAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:approveERC20', {
        tokenAddress,
        spender: spenderAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
      };

      await wallet.approveERC20(tokenAddress, spenderAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:approveERC20', {
        tokenAddress,
        spender: spenderAddress,
        amount,
        overrides,
      });
    });

    it('should handle unlimited approval', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const maxUint256 = 2n ** 256n - 1n;

      await wallet.approveERC20(tokenAddress, spenderAddress, maxUint256);

      expect(mockRequest).toHaveBeenCalledWith('wallet:approveERC20', {
        tokenAddress,
        spender: spenderAddress,
        amount: maxUint256,
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Transaction failed'));

      await expect(wallet.approveERC20(tokenAddress, spenderAddress, amount)).rejects.toThrow('Transaction failed');
    });
  });

  describe('transferNative', () => {
    const toAddress = '0x2222222222222222222222222222222222222222';
    const amount = 1000000000000000000n; // 1 ETH
    
    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:transferNative type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.transferNative(toAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferNative', {
        to: toAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
        maxPriorityFeePerGas: 50000n,
        gasLimit: 21000n,
      };

      await wallet.transferNative(toAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferNative', {
        to: toAddress,
        amount,
        overrides,
      });
    });

    it('should handle different ETH amounts', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const smallAmount = 100000000000000n; // 0.0001 ETH

      await wallet.transferNative(toAddress, smallAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferNative', {
        to: toAddress,
        amount: smallAmount,
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Insufficient balance'));

      await expect(wallet.transferNative(toAddress, amount)).rejects.toThrow('Insufficient balance');
    });
  });

  describe('executeCall', () => {
    const call: ExecuteCall = {
      target: '0x1111111111111111111111111111111111111111',
      value: 0n,
      data: '0x1234',
    };
    
    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:executeCall type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.executeCall(call);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeCall', {
        call,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
      };

      await wallet.executeCall(call, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeCall', {
        call,
        overrides,
      });
    });

    it('should handle calls with value', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const callWithValue: ExecuteCall = {
        ...call,
        value: 1000000000000000000n,
      };

      await wallet.executeCall(callWithValue);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeCall', {
        call: callWithValue,
        overrides: undefined,
      });
    });

    it('should handle complex calldata', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const complexCall: ExecuteCall = {
        target: '0x1111111111111111111111111111111111111111',
        value: 0n,
        data: '0xa9059cbb0000000000000000000000002222222222222222222222222222222222222222000000000000000000000000000000000000000000000000000000000000000a',
      };

      await wallet.executeCall(complexCall);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeCall', {
        call: complexCall,
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Transaction failed'));

      await expect(wallet.executeCall(call)).rejects.toThrow('Transaction failed');
    });
  });

  describe('transferFrontierDollar', () => {
    const toAddress = '0x2222222222222222222222222222222222222222';
    const amount = 10500000000000000000n;

    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:transferFrontierDollar type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.transferFrontierDollar(toAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
        maxPriorityFeePerGas: 50000n,
      };

      await wallet.transferFrontierDollar(toAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount,
        overrides,
      });
    });

    it('should accept large whole-unit amounts', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const wholeAmount = 100000000000000000000n;

      await wallet.transferFrontierDollar(toAddress, wholeAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount: wholeAmount,
        overrides: undefined,
      });
    });

    it('should pass sub-unit bigint amounts through unchanged', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const smallAmount = 10000000000000000n;

      await wallet.transferFrontierDollar(toAddress, smallAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount: smallAmount,
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Insufficient balance'));

      await expect(wallet.transferFrontierDollar(toAddress, amount)).rejects.toThrow('Insufficient balance');
    });
  });

  describe('transferInternalFrontierDollar', () => {
    const toAddress = '0x2222222222222222222222222222222222222222';
    const amount = 10500000000000000000n;

    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:transferInternalFrontierDollar type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.transferInternalFrontierDollar(toAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferInternalFrontierDollar', {
        to: toAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
      };

      await wallet.transferInternalFrontierDollar(toAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferInternalFrontierDollar', {
        to: toAddress,
        amount,
        overrides,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Insufficient internal balance'));

      await expect(wallet.transferInternalFrontierDollar(toAddress, amount)).rejects.toThrow('Insufficient internal balance');
    });
  });

  describe('transferOverallFrontierDollar', () => {
    const toAddress = '0x2222222222222222222222222222222222222222';
    const amount = 10500000000000000000n;

    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:transferOverallFrontierDollar type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.transferOverallFrontierDollar(toAddress, amount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferOverallFrontierDollar', {
        to: toAddress,
        amount,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
      };

      await wallet.transferOverallFrontierDollar(toAddress, amount, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferOverallFrontierDollar', {
        to: toAddress,
        amount,
        overrides,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Insufficient total balance'));

      await expect(wallet.transferOverallFrontierDollar(toAddress, amount)).rejects.toThrow('Insufficient total balance');
    });
  });

  describe('executeBatchCall', () => {
    const calls: ExecuteCall[] = [
      {
        target: '0x1111111111111111111111111111111111111111',
        value: 0n,
        data: '0x1234',
      },
      {
        target: '0x2222222222222222222222222222222222222222',
        value: 100n,
        data: '0x5678',
      },
    ];
    
    const mockReceipt: UserOperationReceipt = {
      userOpHash: '0xhash',
      transactionHash: '0xtxhash',
      blockNumber: 12345n,
      success: true,
    };

    it('should call SDK request with wallet:executeBatchCall type', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      const result = await wallet.executeBatchCall(calls);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeBatchCall', {
        calls,
        overrides: undefined,
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should support gas overrides', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const overrides: GasOverrides = {
        maxFeePerGas: 1000000n,
      };

      await wallet.executeBatchCall(calls, overrides);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeBatchCall', {
        calls,
        overrides,
      });
    });

    it('should handle empty calls array', async () => {
      mockRequest.mockResolvedValue(mockReceipt);

      await wallet.executeBatchCall([]);

      expect(mockRequest).toHaveBeenCalledWith('wallet:executeBatchCall', {
        calls: [],
        overrides: undefined,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Batch execution failed'));

      await expect(wallet.executeBatchCall(calls)).rejects.toThrow('Batch execution failed');
    });
  });

  describe('getSupportedTokens', () => {
    it('should call SDK request with wallet:getSupportedTokens type', async () => {
      const mockTokens = ['FND', 'USDC', 'WETH'];
      mockRequest.mockResolvedValue(mockTokens);

      const result = await wallet.getSupportedTokens();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getSupportedTokens');
      expect(result).toEqual(mockTokens);
    });

    it('should handle empty token list', async () => {
      mockRequest.mockResolvedValue([]);

      const result = await wallet.getSupportedTokens();

      expect(result).toEqual([]);
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Failed to get tokens'));

      await expect(wallet.getSupportedTokens()).rejects.toThrow('Failed to get tokens');
    });
  });

  describe('swap', () => {
    const mockSwapResult: SwapResult = {
      sourceChain: { network: 'base' },
      targetChain: { network: 'ethereum' },
      sourceToken: { symbol: 'USDC' },
      targetToken: { symbol: 'WETH' },
      status: SwapResultStatus.COMPLETED,
    };

    it('should call SDK request with wallet:swap type', async () => {
      mockRequest.mockResolvedValue(mockSwapResult);

      const result = await wallet.swap('USDC', 'WETH', 'base', 'ethereum', 100500000n);

      expect(mockRequest).toHaveBeenCalledWith('wallet:swap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'ethereum',
        amount: 100500000n,
      });
      expect(result).toEqual(mockSwapResult);
    });

    it('should handle SUBMITTED status', async () => {
      const submittedResult: SwapResult = {
        ...mockSwapResult,
        status: SwapResultStatus.SUBMITTED,
      };
      mockRequest.mockResolvedValue(submittedResult);

      const result = await wallet.swap('USDC', 'FND', 'base', 'ethereum', 50000000n);

      expect(result.status).toBe(SwapResultStatus.SUBMITTED);
    });

    it('should handle same-chain swaps', async () => {
      mockRequest.mockResolvedValue(mockSwapResult);

      await wallet.swap('USDC', 'WETH', 'base', 'base', 100000000n);

      expect(mockRequest).toHaveBeenCalledWith('wallet:swap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'base',
        amount: 100000000n,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Token not supported'));

      await expect(wallet.swap('INVALID', 'WETH', 'base', 'ethereum', 100000000n)).rejects.toThrow('Token not supported');
    });
  });

  describe('quoteSwap', () => {
    const mockQuote: SwapQuote = {
      sourceChain: { network: 'base' },
      targetChain: { network: 'ethereum' },
      sourceToken: { symbol: 'USDC' },
      targetToken: { symbol: 'WETH' },
      expectedAmountOut: 95000000000000000000n,
      minAmountOut: 94000000000000000000n,
    };

    it('should call SDK request with wallet:quoteSwap type', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      const result = await wallet.quoteSwap('USDC', 'WETH', 'base', 'ethereum', 100500000n);

      expect(mockRequest).toHaveBeenCalledWith('wallet:quoteSwap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'ethereum',
        amount: 100500000n,
      });
      expect(result).toEqual(mockQuote);
    });

    it('should return expected and minimum amounts', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      const result = await wallet.quoteSwap('USDC', 'WETH', 'base', 'ethereum', 100000000n);

      expect(result.expectedAmountOut).toBe(95000000000000000000n);
      expect(result.minAmountOut).toBe(94000000000000000000n);
    });

    it('should handle same-chain quotes', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      await wallet.quoteSwap('USDC', 'WETH', 'base', 'base', 100000000n);

      expect(mockRequest).toHaveBeenCalledWith('wallet:quoteSwap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'base',
        amount: 100000000n,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Network not found'));

      await expect(wallet.quoteSwap('USDC', 'WETH', 'invalid', 'ethereum', 100000000n)).rejects.toThrow('Network not found');
    });
  });

  describe('Integration', () => {
    it('should support sequential wallet operations', async () => {
      const mockBalance = {
        total: 1000000000000000000n,
        fnd: 1000000000000000000n,
        internalFnd: 0n,
      };
      mockRequest
        .mockResolvedValueOnce('0x1234567890123456789012345678901234567890')
        .mockResolvedValueOnce(mockBalance);

      const address = await wallet.getAddress();
      const balance = await wallet.getBalance();

      expect(address).toBe('0x1234567890123456789012345678901234567890');
      expect(balance).toEqual(mockBalance);
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle parallel wallet queries', async () => {
      const mockBalance = {
        total: 1000000000000000000n,
        fnd: 1000000000000000000n,
        internalFnd: 0n,
      };
      const mockFormatted = {
        total: '$1.00',
        fnd: '$1.00',
        internalFnd: '$0.00',
      };
      mockRequest
        .mockResolvedValueOnce('0x1234567890123456789012345678901234567890')
        .mockResolvedValueOnce(mockBalance)
        .mockResolvedValueOnce(mockFormatted);

      const [address, balance, formatted] = await Promise.all([
        wallet.getAddress(),
        wallet.getBalance(),
        wallet.getBalanceFormatted(),
      ]);

      expect(address).toBe('0x1234567890123456789012345678901234567890');
      expect(balance).toEqual(mockBalance);
      expect(formatted).toEqual(mockFormatted);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle transaction workflow', async () => {
      const mockBalance = {
        total: 1000000000000000000n,
        fnd: 1000000000000000000n,
        internalFnd: 0n,
      };
      const mockReceipt: UserOperationReceipt = {
        userOpHash: '0xhash',
        transactionHash: '0xtxhash',
        blockNumber: 12345n,
        success: true,
      };

      mockRequest
        .mockResolvedValueOnce(mockBalance) // Check balance
        .mockResolvedValueOnce(mockReceipt); // Execute transfer

      const balance = await wallet.getBalance();
      expect(balance.total).toBeGreaterThan(0n);

      const receipt = await wallet.transferNative('0x2222222222222222222222222222222222222222', 100000000000000000n);
      expect(receipt.success).toBe(true);
    });

    it('should handle permission errors gracefully', async () => {
      mockRequest.mockRejectedValue(new Error('Permission denied: wallet:getBalance'));

      await expect(wallet.getBalance()).rejects.toThrow('Permission denied');
    });
  });

  describe('getUsdDepositInstructions', () => {
    const mockUsdResponse = {
      currency: 'usd' as const,
      depositInstructions: {
        currency: 'usd' as const,
        bankName: 'Test Bank',
        bankAddress: '123 Bank St, New York, NY',
        bankRoutingNumber: '123456789',
        bankAccountNumber: '987654321',
        bankBeneficiaryName: 'Frontier User',
        paymentRail: 'ach',
      },
      destinationAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should call SDK request with wallet:getUsdDepositInstructions type', async () => {
      mockRequest.mockResolvedValue(mockUsdResponse);

      const result = await wallet.getUsdDepositInstructions();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getUsdDepositInstructions');
      expect(result).toEqual(mockUsdResponse);
    });

    it('should return USD deposit instructions with all fields', async () => {
      mockRequest.mockResolvedValue(mockUsdResponse);

      const result = await wallet.getUsdDepositInstructions();

      expect(result.currency).toBe('usd');
      expect(result.depositInstructions.bankName).toBe('Test Bank');
      expect(result.depositInstructions.bankRoutingNumber).toBe('123456789');
      expect(result.depositInstructions.bankAccountNumber).toBe('987654321');
      expect(result.depositInstructions.bankBeneficiaryName).toBe('Frontier User');
      expect(result.depositInstructions.paymentRail).toBe('ach');
      expect(result.destinationAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle wire payment rail', async () => {
      const wireResponse = {
        ...mockUsdResponse,
        depositInstructions: {
          ...mockUsdResponse.depositInstructions,
          paymentRail: 'wire',
        },
      };
      mockRequest.mockResolvedValue(wireResponse);

      const result = await wallet.getUsdDepositInstructions();

      expect(result.depositInstructions.paymentRail).toBe('wire');
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('KYC not approved'));

      await expect(wallet.getUsdDepositInstructions()).rejects.toThrow('KYC not approved');
    });
  });

  describe('getEurDepositInstructions', () => {
    const mockEurResponse = {
      currency: 'eur' as const,
      depositInstructions: {
        currency: 'eur' as const,
        iban: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
        bankName: 'Commerzbank',
        beneficiaryName: 'Frontier User',
      },
      destinationAddress: '0x1234567890123456789012345678901234567890',
    };

    it('should call SDK request with wallet:getEurDepositInstructions type', async () => {
      mockRequest.mockResolvedValue(mockEurResponse);

      const result = await wallet.getEurDepositInstructions();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getEurDepositInstructions');
      expect(result).toEqual(mockEurResponse);
    });

    it('should return EUR deposit instructions with all fields', async () => {
      mockRequest.mockResolvedValue(mockEurResponse);

      const result = await wallet.getEurDepositInstructions();

      expect(result.currency).toBe('eur');
      expect(result.depositInstructions.iban).toBe('DE89370400440532013000');
      expect(result.depositInstructions.bic).toBe('COBADEFFXXX');
      expect(result.depositInstructions.bankName).toBe('Commerzbank');
      expect(result.depositInstructions.beneficiaryName).toBe('Frontier User');
      expect(result.destinationAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle different IBAN formats', async () => {
      const frenchResponse = {
        ...mockEurResponse,
        depositInstructions: {
          ...mockEurResponse.depositInstructions,
          iban: 'FR7630006000011234567890189',
          bic: 'BNPAFRPP',
          bankName: 'BNP Paribas',
        },
      };
      mockRequest.mockResolvedValue(frenchResponse);

      const result = await wallet.getEurDepositInstructions();

      expect(result.depositInstructions.iban).toBe('FR7630006000011234567890189');
      expect(result.depositInstructions.bic).toBe('BNPAFRPP');
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('KYC not approved'));

      await expect(wallet.getEurDepositInstructions()).rejects.toThrow('KYC not approved');
    });
  });

  describe('getLinkedBanks', () => {
    const mockLinkedBanksResponse = {
      banks: [
        {
          id: 'ea_abc123',
          bankName: 'Chase',
          last4: '1111',
          withdrawalAddress: '0x1234567890abcdef',
          chain: 'base',
        },
        {
          id: 'ea_def456',
          bankName: 'Deutsche Bank',
          last4: '3000',
          withdrawalAddress: '0xabcdef1234567890',
          chain: 'base',
        },
      ],
    };

    it('should call SDK request with wallet:getLinkedBanks type', async () => {
      mockRequest.mockResolvedValue(mockLinkedBanksResponse);

      const result = await wallet.getLinkedBanks();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getLinkedBanks');
      expect(result).toEqual(mockLinkedBanksResponse);
    });

    it('should return empty array when no banks linked', async () => {
      mockRequest.mockResolvedValue({ banks: [] });

      const result = await wallet.getLinkedBanks();

      expect(result.banks).toEqual([]);
    });

    it('should return bank details with all fields', async () => {
      mockRequest.mockResolvedValue(mockLinkedBanksResponse);

      const result = await wallet.getLinkedBanks();

      expect(result.banks[0].id).toBe('ea_abc123');
      expect(result.banks[0].bankName).toBe('Chase');
      expect(result.banks[0].last4).toBe('1111');
      expect(result.banks[0].withdrawalAddress).toBe('0x1234567890abcdef');
      expect(result.banks[0].chain).toBe('base');
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('KYC not approved'));

      await expect(wallet.getLinkedBanks()).rejects.toThrow('KYC not approved');
    });
  });

  describe('linkUsBankAccount', () => {
    const mockLinkResponse = {
      externalAccountId: 'ea_abc123',
      bankName: 'Chase',
      withdrawalAddress: '0x1234567890abcdef',
      chain: 'base',
    };

    const mockAddress = {
      streetLine1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
    };

    it('should call SDK request with wallet:linkUsBankAccount type', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      const result = await wallet.linkUsBankAccount(
        'John Doe',
        'Chase',
        '121000248',
        '1210002481111',
        'checking',
        mockAddress
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkUsBankAccount', {
        accountOwnerName: 'John Doe',
        bankName: 'Chase',
        routingNumber: '121000248',
        accountNumber: '1210002481111',
        checkingOrSavings: 'checking',
        address: mockAddress,
      });
      expect(result).toEqual(mockLinkResponse);
    });

    it('should support savings account type', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      await wallet.linkUsBankAccount(
        'John Doe',
        'Chase',
        '121000248',
        '1210002481111',
        'savings',
        mockAddress
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkUsBankAccount', {
        accountOwnerName: 'John Doe',
        bankName: 'Chase',
        routingNumber: '121000248',
        accountNumber: '1210002481111',
        checkingOrSavings: 'savings',
        address: mockAddress,
      });
    });

    it('should handle address with streetLine2', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);
      const addressWithLine2 = {
        ...mockAddress,
        streetLine2: 'Apt 4B',
      };

      await wallet.linkUsBankAccount(
        'John Doe',
        'Chase',
        '121000248',
        '1210002481111',
        'checking',
        addressWithLine2
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkUsBankAccount', {
        accountOwnerName: 'John Doe',
        bankName: 'Chase',
        routingNumber: '121000248',
        accountNumber: '1210002481111',
        checkingOrSavings: 'checking',
        address: addressWithLine2,
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Invalid routing number'));

      await expect(
        wallet.linkUsBankAccount('John Doe', 'Chase', '000000000', '1111', 'checking', mockAddress)
      ).rejects.toThrow('Invalid routing number');
    });
  });

  describe('linkEuroAccount', () => {
    const mockLinkResponse = {
      externalAccountId: 'ea_xyz789',
      bankName: 'Deutsche Bank',
      withdrawalAddress: '0xabcdef1234567890',
      chain: 'base',
    };

    it('should call SDK request with wallet:linkEuroAccount type', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      const result = await wallet.linkEuroAccount(
        'Hans Mueller',
        'individual',
        'Hans',
        'Mueller',
        'DE89370400440532013000',
        'COBADEFFXXX'
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkEuroAccount', {
        accountOwnerName: 'Hans Mueller',
        accountOwnerType: 'individual',
        firstName: 'Hans',
        lastName: 'Mueller',
        ibanAccountNumber: 'DE89370400440532013000',
        bic: 'COBADEFFXXX',
      });
      expect(result).toEqual(mockLinkResponse);
    });

    it('should link EUR account without BIC', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      await wallet.linkEuroAccount(
        'Hans Mueller',
        'individual',
        'Hans',
        'Mueller',
        'DE89370400440532013000'
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkEuroAccount', {
        accountOwnerName: 'Hans Mueller',
        accountOwnerType: 'individual',
        firstName: 'Hans',
        lastName: 'Mueller',
        ibanAccountNumber: 'DE89370400440532013000',
        bic: undefined,
      });
    });

    it('should support business account type', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      await wallet.linkEuroAccount(
        'Acme GmbH',
        'business',
        'Acme',
        'GmbH',
        'DE89370400440532013000'
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkEuroAccount', {
        accountOwnerName: 'Acme GmbH',
        accountOwnerType: 'business',
        firstName: 'Acme',
        lastName: 'GmbH',
        ibanAccountNumber: 'DE89370400440532013000',
        bic: undefined,
      });
    });

    it('should handle different IBAN formats with BIC', async () => {
      mockRequest.mockResolvedValue(mockLinkResponse);

      await wallet.linkEuroAccount(
        'Jean Dupont',
        'individual',
        'Jean',
        'Dupont',
        'FR7630006000011234567890189',
        'BNPAFRPP'
      );

      expect(mockRequest).toHaveBeenCalledWith('wallet:linkEuroAccount', {
        accountOwnerName: 'Jean Dupont',
        accountOwnerType: 'individual',
        firstName: 'Jean',
        lastName: 'Dupont',
        ibanAccountNumber: 'FR7630006000011234567890189',
        bic: 'BNPAFRPP',
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Invalid IBAN'));

      await expect(
        wallet.linkEuroAccount('Hans Mueller', 'individual', 'Hans', 'Mueller', 'INVALID')
      ).rejects.toThrow('Invalid IBAN');
    });
  });

  describe('deleteLinkedBank', () => {
    it('should call SDK request with correct method and bank ID', async () => {
      mockRequest.mockResolvedValue(undefined);

      await wallet.deleteLinkedBank('bank_abc123');

      expect(mockRequest).toHaveBeenCalledWith('wallet:deleteLinkedBank', {
        bankId: 'bank_abc123',
      });
    });

    it('should handle different bank ID formats', async () => {
      mockRequest.mockResolvedValue(undefined);

      await wallet.deleteLinkedBank('ea_def456');

      expect(mockRequest).toHaveBeenCalledWith('wallet:deleteLinkedBank', {
        bankId: 'ea_def456',
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Bank not found'));

      await expect(wallet.deleteLinkedBank('invalid_id')).rejects.toThrow('Bank not found');
    });
  });
});
