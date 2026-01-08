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
        ftd: 1000000000000000000n,
        internalFtd: 500000000000000000n,
      };
      mockRequest.mockResolvedValue(mockBalance);

      const result = await wallet.getBalance();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getBalance');
      expect(result).toEqual(mockBalance);
    });

    it('should handle zero balances', async () => {
      const zeroBalance = {
        total: 0n,
        ftd: 0n,
        internalFtd: 0n,
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
        ftd: '$10.00',
        internalFtd: '$5.00',
      };
      mockRequest.mockResolvedValue(mockFormatted);

      const result = await wallet.getBalanceFormatted();

      expect(mockRequest).toHaveBeenCalledWith('wallet:getBalanceFormatted');
      expect(result).toEqual(mockFormatted);
    });

    it('should handle zero balance formatted', async () => {
      const zeroFormatted = {
        total: '$0.00',
        ftd: '$0.00',
        internalFtd: '$0.00',
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
      to: '0x1111111111111111111111111111111111111111',
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
        to: '0x1111111111111111111111111111111111111111',
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
    const amount = '10.5';
    
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

    it('should handle different amount formats', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const wholeAmount = '100';

      await wallet.transferFrontierDollar(toAddress, wholeAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount: wholeAmount,
        overrides: undefined,
      });
    });

    it('should handle decimal amounts', async () => {
      mockRequest.mockResolvedValue(mockReceipt);
      const decimalAmount = '0.01';

      await wallet.transferFrontierDollar(toAddress, decimalAmount);

      expect(mockRequest).toHaveBeenCalledWith('wallet:transferFrontierDollar', {
        to: toAddress,
        amount: decimalAmount,
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
    const amount = '10.5';
    
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
    const amount = '10.5';
    
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
        to: '0x1111111111111111111111111111111111111111',
        value: 0n,
        data: '0x1234',
      },
      {
        to: '0x2222222222222222222222222222222222222222',
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
      const mockTokens = ['FTD', 'USDC', 'WETH'];
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

      const result = await wallet.swap('USDC', 'WETH', 'base', 'ethereum', '100.5');

      expect(mockRequest).toHaveBeenCalledWith('wallet:swap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'ethereum',
        amount: '100.5',
      });
      expect(result).toEqual(mockSwapResult);
    });

    it('should handle SUBMITTED status', async () => {
      const submittedResult: SwapResult = {
        ...mockSwapResult,
        status: SwapResultStatus.SUBMITTED,
      };
      mockRequest.mockResolvedValue(submittedResult);

      const result = await wallet.swap('USDC', 'FTD', 'base', 'ethereum', '50');

      expect(result.status).toBe(SwapResultStatus.SUBMITTED);
    });

    it('should handle same-chain swaps', async () => {
      mockRequest.mockResolvedValue(mockSwapResult);

      await wallet.swap('USDC', 'WETH', 'base', 'base', '100');

      expect(mockRequest).toHaveBeenCalledWith('wallet:swap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'base',
        amount: '100',
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Token not supported'));

      await expect(wallet.swap('INVALID', 'WETH', 'base', 'ethereum', '100')).rejects.toThrow('Token not supported');
    });
  });

  describe('quoteSwap', () => {
    const mockQuote: SwapQuote = {
      sourceChain: { network: 'base' },
      targetChain: { network: 'ethereum' },
      sourceToken: { symbol: 'USDC' },
      targetToken: { symbol: 'WETH' },
      expectedAmountOut: '0.05',
      minAmountOut: '0.048',
    };

    it('should call SDK request with wallet:quoteSwap type', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      const result = await wallet.quoteSwap('USDC', 'WETH', 'base', 'ethereum', '100.5');

      expect(mockRequest).toHaveBeenCalledWith('wallet:quoteSwap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'ethereum',
        amount: '100.5',
      });
      expect(result).toEqual(mockQuote);
    });

    it('should return expected and minimum amounts', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      const result = await wallet.quoteSwap('USDC', 'WETH', 'base', 'ethereum', '100');

      expect(result.expectedAmountOut).toBe('0.05');
      expect(result.minAmountOut).toBe('0.048');
    });

    it('should handle same-chain quotes', async () => {
      mockRequest.mockResolvedValue(mockQuote);

      await wallet.quoteSwap('USDC', 'WETH', 'base', 'base', '100');

      expect(mockRequest).toHaveBeenCalledWith('wallet:quoteSwap', {
        sourceToken: 'USDC',
        targetToken: 'WETH',
        sourceNetwork: 'base',
        targetNetwork: 'base',
        amount: '100',
      });
    });

    it('should propagate errors from SDK', async () => {
      mockRequest.mockRejectedValue(new Error('Network not found'));

      await expect(wallet.quoteSwap('USDC', 'WETH', 'invalid', 'ethereum', '100')).rejects.toThrow('Network not found');
    });
  });

  describe('Integration', () => {
    it('should support sequential wallet operations', async () => {
      const mockBalance = {
        total: 1000000000000000000n,
        ftd: 1000000000000000000n,
        internalFtd: 0n,
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
        ftd: 1000000000000000000n,
        internalFtd: 0n,
      };
      const mockFormatted = {
        total: '$1.00',
        ftd: '$1.00',
        internalFtd: '$0.00',
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
        ftd: 1000000000000000000n,
        internalFtd: 0n,
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
});
