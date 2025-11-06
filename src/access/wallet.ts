import type { FrontierSDK } from '../sdk';

/**
 * Smart account information
 */
export interface SmartAccount {
  /** Unique identifier for the smart account */
  id: number;
  /** Owner's EOA address */
  ownerAddress: string;
  /** Deployed smart contract address (null if not yet deployed) */
  contractAddress: string | null;
  /** Network identifier (e.g., 'sepolia', 'mainnet') */
  network: string;
  /** Deployment status */
  status: string;
  /** Transaction hash of the deployment */
  deploymentTransactionHash: string;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Transaction receipt from a user operation
 */
export interface UserOperationReceipt {
  /** User operation hash */
  userOpHash: string;
  /** Transaction hash */
  transactionHash: string;
  /** Block number */
  blockNumber: bigint;
  /** Whether the operation was successful */
  success: boolean;
}

/**
 * Gas override options for transactions
 */
export interface GasOverrides {
  /** Maximum fee per gas */
  maxFeePerGas?: bigint;
  /** Maximum priority fee per gas */
  maxPriorityFeePerGas?: bigint;
  /** Gas limit */
  gasLimit?: bigint;
}

/**
 * Execute call parameters for arbitrary contract interactions
 */
export interface ExecuteCall {
  /** Target contract address */
  to: string;
  /** Value to send (in wei) */
  value?: bigint;
  /** Calldata */
  data: string;
}

/**
 * Wallet access class for interacting with the user's wallet
 * 
 * This class provides methods to:
 * - Query wallet addresses and smart accounts
 * - Check balances for stablecoins
 * - Transfer ERC20 tokens and native currency
 * - Execute arbitrary contract calls
 * 
 * All methods use the current chain from the chain manager.
 * All methods require appropriate permissions and may trigger biometric authentication.
 */
export class WalletAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * Get the current wallet balance
   * 
   * Returns the total USD stablecoin balance for the current network,
   * normalized to 18 decimals for consistency.
   * 
   * @returns Balance as bigint (18 decimals)
   * @throws {Error} If no wallet exists
   * 
   * @example
   * ```typescript
   * const balance = await sdk.getWallet().getBalance();
   * console.log('Balance:', balance.toString());
   * ```
   */
  async getBalance(): Promise<bigint> {
    return this.sdk.request('wallet:getBalance');
  }

  /**
   * Get the current wallet balance formatted for display
   * 
   * Returns the total USD stablecoin balance as a formatted string
   * with currency symbol (e.g., '$10.50').
   * 
   * @returns Formatted balance string with $ sign
   * @throws {Error} If no wallet exists
   * 
   * @example
   * ```typescript
   * const balance = await sdk.getWallet().getBalanceFormatted();
   * console.log('Balance:', balance); // '$10.50'
   * ```
   */
  async getBalanceFormatted(): Promise<string> {
    return this.sdk.request('wallet:getBalanceFormatted');
  }

  /**
   * Get the wallet address for the current network
   * 
   * Returns the smart account contract address for the current chain.
   * 
   * @returns The wallet address as a hex string
   * @throws {Error} If no wallet exists
   * 
   * @example
   * ```typescript
   * const address = await sdk.getWallet().getAddress();
   * console.log('Address:', address);
   * ```
   */
  async getAddress(): Promise<string> {
    return this.sdk.request('wallet:getAddress');
  }

  /**
   * Get smart account for the current network
   * 
   * Returns detailed information about the smart account including
   * deployment status and network information.
   * 
   * @returns Smart account information
   * @throws {Error} If no smart account found for current network
   * 
   * @example
   * ```typescript
   * const account = await sdk.getWallet().getSmartAccount();
   * console.log('Contract address:', account.contractAddress);
   * console.log('Network:', account.network);
   * ```
   */
  async getSmartAccount(): Promise<SmartAccount> {
    return this.sdk.request('wallet:getSmartAccount');
  }

  /**
   * Transfer ERC20 tokens
   * 
   * Sends ERC20 tokens to a recipient address using the current network.
   * Requires biometric authentication and sufficient balance.
   * 
   * @param tokenAddress - ERC20 token contract address
   * @param to - Recipient address
   * @param amount - Amount to send (in token's smallest unit, e.g., wei)
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If insufficient balance or transaction fails
   * 
   * @example
   * ```typescript
   * import { parseUnits } from 'viem';
   * 
   * const receipt = await sdk.getWallet().transferERC20(
   *   '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   parseUnits('10.5', 6) // 10.5 USDC (6 decimals)
   * );
   * console.log('Transaction:', receipt.transactionHash);
   * ```
   */
  async transferERC20(
    tokenAddress: string,
    to: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:transferERC20', {
      tokenAddress,
      to,
      amount,
      overrides,
    });
  }

  /**
   * Approve ERC20 tokens for spending
   * 
   * Approves a spender to transfer tokens on your behalf.
   * Required before interacting with DeFi protocols.
   * 
   * @param tokenAddress - ERC20 token contract address
   * @param spender - Address allowed to spend tokens
   * @param amount - Amount to approve (in token's smallest unit)
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If transaction fails
   * 
   * @example
   * ```typescript
   * import { parseUnits } from 'viem';
   * 
   * const receipt = await sdk.getWallet().approveERC20(
   *   '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC
   *   '0xProtocolAddress',
   *   parseUnits('100', 6) // Approve 100 USDC
   * );
   * ```
   */
  async approveERC20(
    tokenAddress: string,
    spender: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:approveERC20', {
      tokenAddress,
      spender,
      amount,
      overrides,
    });
  }

  /**
   * Transfer native currency (ETH)
   * 
   * Sends native currency to a recipient address.
   * Requires biometric authentication and sufficient balance.
   * 
   * @param to - Recipient address
   * @param amount - Amount to send in wei
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If insufficient balance or transaction fails
   * 
   * @example
   * ```typescript
   * import { parseEther } from 'viem';
   * 
   * const receipt = await sdk.getWallet().transferNative(
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   parseEther('0.1') // 0.1 ETH
   * );
   * ```
   */
  async transferNative(
    to: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:transferNative', {
      to,
      amount,
      overrides,
    });
  }

  /**
   * Execute arbitrary contract call
   * 
   * Executes a custom contract interaction with full control over
   * the target address, value, and calldata.
   * 
   * @param call - Execute call parameters
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If transaction fails
   * 
   * @example
   * ```typescript
   * import { encodeFunctionData } from 'viem';
   * 
   * const receipt = await sdk.getWallet().executeCall({
   *   to: '0xContractAddress',
   *   value: 0n,
   *   data: encodeFunctionData({
   *     abi: contractABI,
   *     functionName: 'someFunction',
   *     args: [arg1, arg2]
   *   })
   * });
   * ```
   */
  async executeCall(
    call: ExecuteCall,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:executeCall', {
      call,
      overrides,
    });
  }
}
