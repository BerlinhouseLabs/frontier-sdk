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
 * Wallet balance breakdown
 */
export interface WalletBalance {
  /** Total balance including both native and internal FND */
  total: bigint;
  /** Native Frontier Network Dollar balance */
  fnd: bigint;
  /** Internal Frontier Network Dollar balance (for Network Society) */
  internalFnd: bigint;
}

/**
 * Formatted wallet balance breakdown
 */
export interface WalletBalanceFormatted {
  /** Total balance formatted with currency symbol */
  total: string;
  /** Native Frontier Network Dollar balance formatted with currency symbol */
  fnd: string;
  /** Internal Frontier Network Dollar balance formatted with currency symbol */
  internalFnd: string;
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
  target: string;
  /** Value to send (in wei) */
  value?: bigint;
  /** Calldata */
  data: string;
}

/**
 * Swap parameters for token swaps
 */
export interface SwapParams {
  /** Symbol of the token to swap from (e.g., 'USDC') */
  sourceToken: string;
  /** Symbol of the token to swap to (e.g., 'WETH') */
  targetToken: string;
  /** Network identifier for source chain (e.g., 'base') */
  sourceNetwork: string;
  /** Network identifier for target chain (e.g., 'ethereum') */
  targetNetwork: string;
  /** Amount to swap in human-readable format (e.g., '100.5') */
  amount: string;
}

/**
 * Swap result status
 */
export enum SwapResultStatus {
  COMPLETED = 'COMPLETED',
  SUBMITTED = 'SUBMITTED',
}

/**
 * Result of a swap operation
 */
export interface SwapResult {
  /** Source chain configuration */
  sourceChain: object;
  /** Target chain configuration */
  targetChain: object;
  /** Source token configuration */
  sourceToken: object;
  /** Target token configuration */
  targetToken: object;
  /** Status of the swap */
  status: SwapResultStatus;
}

/**
 * Quote for a swap operation
 */
export interface SwapQuote {
  /** Source chain configuration */
  sourceChain: object;
  /** Target chain configuration */
  targetChain: object;
  /** Source token configuration */
  sourceToken: object;
  /** Target token configuration */
  targetToken: object;
  /** Expected output amount in human-readable format */
  expectedAmountOut: string;
  /** Minimum output amount in human-readable format */
  minAmountOut: string;
}

/**
 * USD deposit instructions for fiat on-ramp
 */
export interface UsdDepositInstructions {
  /** Currency type */
  currency: 'usd';
  /** Bank name */
  bankName: string;
  /** Bank address */
  bankAddress: string;
  /** Bank routing number (ABA) */
  bankRoutingNumber: string;
  /** Bank account number */
  bankAccountNumber: string;
  /** Beneficiary name for the transfer */
  bankBeneficiaryName: string;
  /** Payment rail (e.g., 'ach', 'wire') */
  paymentRail: string;
}

/**
 * EUR deposit instructions for fiat on-ramp (SEPA)
 */
export interface EurDepositInstructions {
  /** Currency type */
  currency: 'eur';
  /** IBAN for SEPA transfer */
  iban: string;
  /** BIC/SWIFT code */
  bic: string;
  /** Beneficiary name for the transfer */
  accountHolderName: string;
}

/**
 * Response containing deposit instructions for fiat on-ramp
 */
export interface OnRampResponse<T = UsdDepositInstructions | EurDepositInstructions> {
  /** Currency type ('usd' or 'eur') */
  currency: 'usd' | 'eur';
  /** Deposit instructions specific to the currency */
  depositInstructions: T;
  /** Destination address where stablecoins will be sent */
  destinationAddress: string;
  /** Destination network */
  destinationNetwork: string;
}

/**
 * Linked bank account for withdrawals (off-ramp)
 */
export interface LinkedBank {
  /** External account ID */
  id: string;
  /** Bank name */
  bankName: string;
  /** Last 4 digits of account number */
  last4: string;
  /** Withdrawal address for this bank */
  withdrawalAddress: string;
  /** Network for withdrawals */
  network: string;
}

/**
 * Response containing linked bank accounts
 */
export interface LinkedBanksResponse {
  /** List of linked bank accounts */
  banks: LinkedBank[];
}

/**
 * Response from linking a bank account
 */
export interface LinkBankResponse {
  /** External account ID */
  externalAccountId: string;
  /** Bank name */
  bankName: string;
  /** Withdrawal address for this bank */
  withdrawalAddress: string;
  /** Network for withdrawals */
  network: string;
}

/**
 * Billing address for bank account linking
 */
export interface BillingAddress {
  /** Street address line 1 */
  streetLine1: string;
  /** Street address line 2 (optional) */
  streetLine2?: string;
  /** City */
  city: string;
  /** State/Province */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country code (e.g., 'USA') */
  country: string;
}

/**
 * Account owner type for IBAN accounts
 */
export type AccountOwnerType = 'individual' | 'business';

/**
 * Deprecated smart account information
 */
export interface DeprecatedSmartAccount {
  /** Unique identifier */
  id: number;
  /** Original EOA that controlled the smart account */
  ownerAddress: string;
  /** Deployed smart account contract address */
  contractAddress: string;
  /** Network identifier (e.g., 'base', 'base_sepolia') */
  network: string;
  /** When the account was deprecated */
  deprecatedAt: string;
  /** Smart account version at deployment */
  version: number;
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
   * Get the current wallet balance breakdown
   * 
   * Returns the balance breakdown including total, native FND,
   * and internal FND amounts.
   * 
   * @returns Balance breakdown object
   * @throws {Error} If no wallet exists
   * 
   * @example
   * ```typescript
   * const balance = await sdk.getWallet().getBalance();
   * console.log('Total Balance:', balance.total.toString());
   * console.log('FND Balance:', balance.fnd.toString());
   * ```
   */
  async getBalance(): Promise<WalletBalance> {
    return this.sdk.request('wallet:getBalance');
  }

  /**
   * Get the current wallet balance formatted for display
   * 
   * Returns the balance breakdown as formatted strings
   * with currency symbol (e.g., { total: '$10.50', ... }).
   * 
   * @returns Formatted balance breakdown object
   * @throws {Error} If no wallet exists
   * 
   * @example
   * ```typescript
   * const balance = await sdk.getWallet().getBalanceFormatted();
   * console.log('Total:', balance.total); // '$10.50'
   * ```
   */
  async getBalanceFormatted(): Promise<WalletBalanceFormatted> {
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
   *   target: '0xContractAddress',
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

  /**
   * Transfer Frontier Dollars to another address
   *
   * Sends Frontier Dollars (the native stablecoin) to a recipient address.
   * Requires biometric authentication and sufficient balance.
   *
   * @param to - Recipient address
   * @param amount - Amount to send in base units (bigint), e.g. parseAmount('10.5')
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If insufficient balance or transaction fails
   *
   * @example
   * ```typescript
   * import { parseAmount } from '@frontiertower/frontier-sdk';
   *
   * const receipt = await sdk.getWallet().transferFrontierDollar(
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   parseAmount('10.5') // 10.5 Frontier Dollars in base units
   * );
   * console.log('Transaction:', receipt.transactionHash);
   * ```
   */
  async transferFrontierDollar(
    to: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:transferFrontierDollar', {
      to,
      amount,
      overrides,
    });
  }

  /**
   * Transfer Internal Frontier Dollars to another address
   *
   * Sends Internal Frontier Dollars (for Network Society spending) to a recipient address.
   * Requires biometric authentication and sufficient balance.
   *
   * @param to - Recipient address
   * @param amount - Amount to send in base units (bigint), e.g. parseAmount('10.5')
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If insufficient balance or transaction fails
   *
   * @example
   * ```typescript
   * import { parseAmount } from '@frontiertower/frontier-sdk';
   *
   * const receipt = await sdk.getWallet().transferInternalFrontierDollar(
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   parseAmount('10.5') // 10.5 Internal Frontier Dollars in base units
   * );
   * ```
   */
  async transferInternalFrontierDollar(
    to: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:transferInternalFrontierDollar', {
      to,
      amount,
      overrides,
    });
  }

  /**
   * Transfer Frontier Dollars with Internal Frontier Network Dollars (iFND) preferred
   *
   * This method will use Internal Frontier Dollars first, and if insufficient,
   * it will use regular Frontier Dollars to complete the transfer.
   *
   * @param to - Recipient address
   * @param amount - Amount to send in base units (bigint), e.g. parseAmount('10.5')
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If insufficient total balance or transaction fails
   *
   * @example
   * ```typescript
   * import { parseAmount } from '@frontiertower/frontier-sdk';
   *
   * const receipt = await sdk.getWallet().transferOverallFrontierDollar(
   *   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
   *   parseAmount('10.5')
   * );
   * ```
   */
  async transferOverallFrontierDollar(
    to: string,
    amount: bigint,
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:transferOverallFrontierDollar', {
      to,
      amount,
      overrides,
    });
  }

  /**
   * Execute multiple calls atomically with a single signature
   * 
   * Executes multiple contract interactions in a single transaction.
   * All calls are executed atomically - if one fails, all fail.
   * 
   * @param calls - Array of execute call parameters
   * @param overrides - Optional gas overrides
   * @returns User operation receipt with transaction details
   * @throws {Error} If any transaction fails
   * 
   * @example
   * ```typescript
   * import { encodeFunctionData } from 'viem';
   * 
   * const receipt = await sdk.getWallet().executeBatchCall([
   *   {
   *     target: '0xToken1',
   *     value: 0n,
   *     data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [...] })
   *   },
   *   {
   *     target: '0xProtocol',
   *     value: 0n,
   *     data: encodeFunctionData({ abi: protocolAbi, functionName: 'deposit', args: [...] })
   *   }
   * ]);
   * ```
   */
  async executeBatchCall(
    calls: ExecuteCall[],
    overrides?: GasOverrides
  ): Promise<UserOperationReceipt> {
    return this.sdk.request('wallet:executeBatchCall', {
      calls,
      overrides,
    });
  }

  /**
   * Get list of supported token symbols for the current chain
   * 
   * Returns an array of token symbols that are supported for swaps
   * and other operations on the current network.
   * 
   * @returns Array of token symbols (e.g., ['FND', 'USDC', 'WETH'])
   * 
   * @example
   * ```typescript
   * const tokens = await sdk.getWallet().getSupportedTokens();
   * console.log('Supported tokens:', tokens); // ['FND', 'USDC', 'WETH']
   * ```
   */
  async getSupportedTokens(): Promise<string[]> {
    return this.sdk.request('wallet:getSupportedTokens');
  }

  /**
   * Execute a token swap
   *
   * @param sourceToken - Symbol of the token to swap from (e.g., 'USDC')
   * @param targetToken - Symbol of the token to swap to (e.g., 'WETH')
   * @param sourceNetwork - Network identifier for source chain (e.g., 'base')
   * @param targetNetwork - Network identifier for target chain (e.g., 'ethereum')
   * @param amount - Amount to swap in human-readable format (e.g., '100.5')
   * @returns Swap result with status and transaction details
   * @throws {Error} If swap fails or tokens/networks are not supported
   * 
   * @example
   * ```typescript
   * const result = await sdk.getWallet().swap(
   *   'USDC',
   *   'WETH',
   *   'base',
   *   'ethereum',
   *   '100.5'
   * );
   * console.log('Swap status:', result.status);
   * ```
   */
  async swap(
    sourceToken: string,
    targetToken: string,
    sourceNetwork: string,
    targetNetwork: string,
    amount: string
  ): Promise<SwapResult> {
    return this.sdk.request('wallet:swap', {
      sourceToken,
      targetToken,
      sourceNetwork,
      targetNetwork,
      amount,
    });
  }

  /**
   * Get a quote for a token swap without executing it
   * 
   * Returns the expected output amount for a given swap.
   * Useful for displaying swap previews to users before confirmation.
   * 
   * @param sourceToken - Symbol of the token to swap from (e.g., 'USDC')
   * @param targetToken - Symbol of the token to swap to (e.g., 'WETH')
   * @param sourceNetwork - Network identifier for source chain (e.g., 'base')
   * @param targetNetwork - Network identifier for target chain (e.g., 'ethereum')
   * @param amount - Amount to swap in human-readable format (e.g., '100.5')
   * @returns Quote with expected and minimum output amounts
   * @throws {Error} If tokens/networks are not supported
   * 
   * @example
   * ```typescript
   * const quote = await sdk.getWallet().quoteSwap(
   *   'USDC',
   *   'WETH',
   *   'base',
   *   'ethereum',
   *   '100.5'
   * );
   * console.log('Expected output:', quote.expectedAmountOut);
   * console.log('Minimum output:', quote.minAmountOut);
   * ```
   */
  async quoteSwap(
    sourceToken: string,
    targetToken: string,
    sourceNetwork: string,
    targetNetwork: string,
    amount: string
  ): Promise<SwapQuote> {
    return this.sdk.request('wallet:quoteSwap', {
      sourceToken,
      targetToken,
      sourceNetwork,
      targetNetwork,
      amount,
    });
  }

  /**
   * Get USD deposit instructions for fiat on-ramp
   * 
   * Returns US bank details where user should send their USD deposit.
   * The deposited fiat will be converted to stablecoins and sent to
   * the user's wallet address.
   * 
   * Requires approved KYC verification.
   * 
   * @returns Bank details including routing number, account number, and beneficiary info
   * @throws {Error} If KYC is not approved
   * 
   * @example
   * ```typescript
   * const instructions = await sdk.getWallet().getUsdDepositInstructions();
   * console.log('Bank:', instructions.depositInstructions.bankName);
   * console.log('Routing:', instructions.depositInstructions.bankRoutingNumber);
   * console.log('Account:', instructions.depositInstructions.bankAccountNumber);
   * console.log('Beneficiary:', instructions.depositInstructions.bankBeneficiaryName);
   * ```
   */
  async getUsdDepositInstructions(): Promise<OnRampResponse<UsdDepositInstructions>> {
    return this.sdk.request('wallet:getUsdDepositInstructions');
  }

  /**
   * Get EUR deposit instructions for fiat on-ramp (SEPA)
   * 
   * Returns SEPA bank details where user should send their EUR deposit.
   * The deposited fiat will be converted to stablecoins and sent to
   * the user's wallet address.
   * 
   * Requires approved KYC verification.
   * 
   * @returns SEPA bank details including IBAN, BIC, and beneficiary info
   * @throws {Error} If KYC is not approved
   * 
   * @example
   * ```typescript
   * const instructions = await sdk.getWallet().getEurDepositInstructions();
   * console.log('IBAN:', instructions.depositInstructions.iban);
   * console.log('BIC:', instructions.depositInstructions.bic);
   * console.log('Bank:', instructions.depositInstructions.bankName);
   * console.log('Beneficiary:', instructions.depositInstructions.beneficiaryName);
   * ```
   */
  async getEurDepositInstructions(): Promise<OnRampResponse<EurDepositInstructions>> {
    return this.sdk.request('wallet:getEurDepositInstructions');
  }

  /**
   * Get all linked bank accounts for withdrawals (off-ramp)
   * 
   * Returns a list of bank accounts that have been linked for
   * withdrawing stablecoins to fiat.
   * 
   * Requires approved KYC verification.
   * 
   * @returns List of linked bank accounts with withdrawal addresses
   * @throws {Error} If KYC is not approved
   * 
   * @example
   * ```typescript
   * const { banks } = await sdk.getWallet().getLinkedBanks();
   * banks.forEach(bank => {
   *   console.log(`${bank.bankName} (****${bank.last4})`);
   * });
   * ```
   */
  async getLinkedBanks(): Promise<LinkedBanksResponse> {
    return this.sdk.request('wallet:getLinkedBanks');
  }

  /**
   * Link a US bank account for withdrawals (off-ramp)
   * 
   * Links a US bank account (checking or savings) for withdrawing
   * stablecoins to USD via ACH transfer.
   * 
   * Requires approved KYC verification.
   * 
   * @param accountOwnerName - Full name of the account owner
   * @param bankName - Name of the bank (e.g., 'Chase', 'Bank of America')
   * @param routingNumber - Bank routing number (9 digits)
   * @param accountNumber - Bank account number
   * @param checkingOrSavings - Account type: 'checking' or 'savings'
   * @param address - Billing address for the account
   * @returns Linked bank details with withdrawal address
   * @throws {Error} If KYC is not approved or bank details are invalid
   * 
   * @example
   * ```typescript
   * const result = await sdk.getWallet().linkUsBankAccount(
   *   'John Doe',
   *   'Chase',
   *   '121000248',
   *   '1234567890',
   *   'checking',
   *   {
   *     streetLine1: '123 Main St',
   *     city: 'San Francisco',
   *     state: 'CA',
   *     postalCode: '94102',
   *     country: 'USA'
   *   }
   * );
   * console.log('Linked bank:', result.bankName);
   * ```
   */
  async linkUsBankAccount(
    accountOwnerName: string,
    bankName: string,
    routingNumber: string,
    accountNumber: string,
    checkingOrSavings: 'checking' | 'savings',
    address: BillingAddress
  ): Promise<LinkBankResponse> {
    return this.sdk.request('wallet:linkUsBankAccount', {
      accountOwnerName,
      bankName,
      routingNumber,
      accountNumber,
      checkingOrSavings,
      address,
    });
  }

  /**
   * Link a EUR/IBAN bank account for withdrawals (off-ramp)
   * 
   * Links a European bank account via IBAN for withdrawing
   * stablecoins to EUR via SEPA transfer.
   * 
   * Requires approved KYC verification.
   * 
   * @param accountOwnerName - Full name of the account owner
   * @param accountOwnerType - Type of account owner: 'individual' or 'business'
   * @param firstName - First name of the account owner
   * @param lastName - Last name of the account owner
   * @param ibanAccountNumber - IBAN account number
   * @param bic - Optional BIC/SWIFT code
   * @returns Linked bank details with withdrawal address
   * @throws {Error} If KYC is not approved or bank details are invalid
   * 
   * @example
   * ```typescript
   * const result = await sdk.getWallet().linkEuroAccount(
   *   'Hans Mueller',
   *   'individual',
   *   'Hans',
   *   'Mueller',
   *   'DE89370400440532013000',
   *   'COBADEFFXXX' // optional BIC
   * );
   * console.log('Linked bank:', result.bankName);
   * ```
   */
  async linkEuroAccount(
    accountOwnerName: string,
    accountOwnerType: AccountOwnerType,
    firstName: string,
    lastName: string,
    ibanAccountNumber: string,
    bic?: string
  ): Promise<LinkBankResponse> {
    return this.sdk.request('wallet:linkEuroAccount', {
      accountOwnerName,
      accountOwnerType,
      firstName,
      lastName,
      ibanAccountNumber,
      bic,
    });
  }

  /**
   * Delete a linked bank account
   * 
   * Removes a previously linked bank account from the user's off-ramp options.
   * 
   * @param bankId - The ID of the linked bank account to delete
   * @throws {Error} If the bank account doesn't exist or deletion fails
   * 
   * @example
   * ```typescript
   * await sdk.getWallet().deleteLinkedBank('bank_abc123');
   * console.log('Bank account deleted');
   * ```
   */
  async deleteLinkedBank(bankId: string): Promise<void> {
    return this.sdk.request('wallet:deleteLinkedBank', { bankId });
  }

  /**
   * Get all deprecated smart accounts for the authenticated user
   * 
   * Returns a list of deprecated smart accounts that still have active
   * gas sponsorship. These are accounts from previous smart account versions
   * that users may still need to interact with (e.g., to withdraw funds).
   * 
   * @returns List of deprecated smart accounts with their details
   * 
   * @example
   * ```typescript
   * const deprecatedAccounts = await sdk.getWallet().getDeprecatedSmartAccounts();
   * deprecatedAccounts.forEach(account => {
   *   console.log(`Account ${account.contractAddress} on ${account.network}`);
   *   console.log(`Deprecated at: ${account.deprecatedAt}`);
   *   console.log(`Version: ${account.version}`);
   * });
   * ```
   */
  async getDeprecatedSmartAccounts(): Promise<DeprecatedSmartAccount[]> {
    return this.sdk.request('wallet:getDeprecatedSmartAccounts');
  }
}
