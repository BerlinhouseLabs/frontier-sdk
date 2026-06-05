export { FrontierSDK } from './sdk';
export { WalletAccess, StorageAccess, ChainAccess, UserAccess, PartnershipsAccess, ThirdPartyAccess, CommunitiesAccess, EventsAccess, OfficesAccess, NavigationAccess } from './access';
export type { SDKRequest, SDKResponse } from './types';

// Export wallet types
export type {
  WalletBalance,
  SmartAccount,
  UserOperationReceipt,
  GasOverrides,
  ExecuteCall,
  SwapParams,
  SwapResult,
  SwapQuote,
  UsdDepositInstructions,
  EurDepositInstructions,
  OnRampResponse,
  LinkedBank,
  LinkedBanksResponse,
  LinkBankResponse,
  BillingAddress,
  AccountOwnerType,
} from './access/wallet';

// Token amount helpers (canonical: bigint base units)
export { parseAmount, formatAmount, FND_DECIMALS, InvalidAmountError } from './token-amount';

export { SwapResultStatus } from './access/wallet';

// Export chain types
export type {
  ChainConfig,
  Token,
  StableCoin,
} from './access/chain';

export { Underlying } from './access/chain';

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

// Export access controls types
export type {
  AccessControlsPayload,
  SignedAccessControls,
} from './access-controls';

// Export partnerships types
export type {
  SponsorPass,
  CreateSponsorPassRequest,
  Sponsor,
  ListSponsorsParams,
} from './access/partnerships';

// Export third-party types
export type {
  Developer,
  UpdateDeveloperRequest,
  RotateKeyResponse,
  App,
  AppStatus,
  AppPermission,
  CreateAppRequest,
  UpdateAppRequest,
  Webhook,
  WebhookStatus,
  WebhookEvent,
  WebhookScope,
  WebhookConfig,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  RotateWebhookKeyResponse,
  ListParams,
} from './access/third-party';

// Export communities types
export type {
  Community,
  ListCommunitiesParams,
  InternshipPass,
  InternshipPassStatus,
  CreateInternshipPassRequest,
  ListInternshipPassesParams,
  ReassignRequest,
  ReassignRequestStatus,
  CreateReassignRequestPayload,
  ListReassignRequestsParams,
} from './access/communities';

// Export events types
export type {
  Event,
  EventType,
  EventService,
  EventStatus,
  ReviewStatus,
  LocationType,
  ListEventsParams,
  CreateEventRequest,
  Location,
  ListLocationsParams,
  RoomBooking,
  ListRoomBookingsParams,
  CreateRoomBookingRequest,
  DepositStatus,
  EventDeposit,
  DepositPreflightToken,
  DepositPreflight,
  CryptoDepositStatus,
  DepositResult,
} from './access/events';

// Export offices types
export type {
  AccessPass,
  AccessPassStatus,
  CreateAccessPassRequest,
  ListAccessPassesParams,
} from './access/offices';

// Export navigation types
export type {
  NavigationOpenAppOptions,
  DeepLinkData,
} from './access/navigation';

// Export UI utilities
export { isInFrontierApp, getParentOrigin } from './ui-utils/detection';
export { renderStandaloneMessage, createStandaloneHTML } from './ui-utils/standalone';
