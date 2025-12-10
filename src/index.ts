export { FrontierSDK } from './sdk';
export { WalletAccess, StorageAccess, ChainAccess, UserAccess } from './access';
export type { SDKRequest, SDKResponse } from './types';

// Export wallet types
export type {
  SmartAccount,
  UserOperationReceipt,
  GasOverrides,
  ExecuteCall,
  SwapParams,
  SwapResult,
  SwapQuote,
} from './access/wallet';

export { SwapResultStatus } from './access/wallet';

// Export chain types
export type {
  ChainConfig,
} from './access/chain';

// Export user types
export type {
  User,
  UserProfile,
  PaginatedResponse,
  ReferralOverview,
  ReferralDetails,
  UserContact,
  UserContactPayload,
} from './access/user';

// Export UI utilities
export { isInFrontierApp, getParentOrigin } from './ui-utils/detection';
export { renderStandaloneMessage, createStandaloneHTML } from './ui-utils/standalone';
