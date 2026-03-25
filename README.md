# Frontier Wallet SDK

Official SDK for building apps on Frontier Wallet.

## Example Project

Check out [**frontier-kickstarter**](https://github.com/BerlinhouseLabs/frontier-kickstarter) - a complete example project that demonstrates how to use this SDK to build a decentralized crowdfunding platform on Frontier Wallet.

## Installation

```bash
npm install @frontiertower/frontier-sdk
```

## Quick Start

```typescript
import { FrontierSDK } from '@frontiertower/frontier-sdk';
import { isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk/ui-utils';

// Initialize the SDK
const sdk = new FrontierSDK();

// Check if running in Frontier Wallet
if (!isInFrontierApp()) {
  renderStandaloneMessage(document.body, 'My App');
  return;
}

// Access wallet information
/**
 * The wallet balance is split into two types:
 * - Frontier Network Dollar (FND): Freely convertible to fiat currency.
 * - Internal Frontier Network Dollar (iFND): Only convertible by Frontier Tower representatives;
 *   designed for circulation within the Network Society.
 */
const balance = await sdk.getWallet().getBalance();
console.log('Total FND:', balance.total.toString());
const address = await sdk.getWallet().getAddress();

// Use persistent storage
await sdk.getStorage().set('myKey', { value: 'myData' });
const data = await sdk.getStorage().get('myKey');
```


## Permissions

Your app must declare required permissions in the Frontier app registry:

### Wallet Permissions
- `wallet:getBalance` - Access wallet balance
- `wallet:getBalanceFormatted` - Access formatted wallet balance
- `wallet:getAddress` - Access wallet address
- `wallet:getSmartAccount` - Access smart account details
- `wallet:transferERC20` - Transfer ERC20 tokens
- `wallet:approveERC20` - Approve ERC20 token spending
- `wallet:transferNative` - Transfer native currency (ETH)
- `wallet:transferFrontierDollar` - Transfer Frontier Dollars
- `wallet:transferInternalFrontierDollar` - Transfer Internal Frontier Dollars
- `wallet:transferOverallFrontierDollar` - Transfer Frontier Dollars with iFND preferred
- `wallet:executeCall` - Execute arbitrary contract calls
- `wallet:executeBatchCall` - Execute multiple contract calls atomically
- `wallet:getSupportedTokens` - Get list of supported tokens for swaps
- `wallet:swap` - Execute token swaps (same-chain or cross-chain)
- `wallet:quoteSwap` - Get quotes for token swaps
- `wallet:getUsdDepositInstructions` - Get USD bank deposit instructions for fiat on-ramp
- `wallet:getEurDepositInstructions` - Get EUR (SEPA) deposit instructions for fiat on-ramp
- `wallet:getLinkedBanks` - Get linked bank accounts for withdrawals (off-ramp)
- `wallet:linkUsBankAccount` - Link a US bank account for USD withdrawals
- `wallet:linkEuroAccount` - Link a EUR/IBAN bank account for EUR withdrawals
- `wallet:deleteLinkedBank` - Delete a linked bank account
- `wallet:getDeprecatedSmartAccounts` - Get deprecated smart accounts with active gas sponsorship

### Storage Permissions
- `storage:get` - Read from storage
- `storage:set` - Write to storage
- `storage:remove` - Remove from storage
- `storage:clear` - Clear all storage

### User Permissions
- `user:getDetails` - Access current user details
- `user:getProfile` - Access current user profile information
- `user:getReferralOverview` - Access referral statistics
- `user:getReferralDetails` - Access detailed referral information
- `user:addUserContact` - Add user contact information
- `user:getOrCreateKyc` - Get or create KYC verification status
- `user:createSignupRequest` - Submit a new membership signup request with crypto payment
- `user:getVerifiedAccessControls` - Get cryptographically verified access controls

### Communities Permissions
- `communities:listCommunities` - List all visible communities (paginated)
- `communities:getCommunity` - Get a community by ID or slug
- `communities:createInternshipPass` - Create an internship pass for a managed community
- `communities:listInternshipPasses` - List internship passes for managed communities (paginated)
- `communities:getInternshipPass` - Retrieve an internship pass by ID
- `communities:revokeInternshipPass` - Revoke an internship pass
- `communities:createReassignRequest` - Create a member reassignment request
- `communities:listReassignRequests` - List pending reassignment requests (paginated)
- `communities:getReassignRequest` - Retrieve a reassignment request by ID
- `communities:acceptReassignRequest` - Accept a reassignment request (moves member)
- `communities:rejectReassignRequest` - Reject a reassignment request

### Partnerships Permissions
- `partnerships:listSponsors` - List sponsors you manage (paginated)
- `partnerships:getSponsor` - Retrieve a Sponsor by ID
- `partnerships:createSponsorPass` - Create a SponsorPass
- `partnerships:listActiveSponsorPasses` - List active SponsorPasses (paginated)
- `partnerships:listAllSponsorPasses` - List all SponsorPasses (paginated)
- `partnerships:getSponsorPass` - Retrieve a SponsorPass by ID
- `partnerships:revokeSponsorPass` - Revoke a SponsorPass by ID

### Third-Party Permissions
- `thirdParty:listDevelopers` - List developer accounts (paginated)
- `thirdParty:getDeveloper` - Get developer details by ID
- `thirdParty:updateDeveloper` - Update developer information
- `thirdParty:rotateDeveloperApiKey` - Rotate developer API key
- `thirdParty:listApps` - List registered apps (paginated)
- `thirdParty:createApp` - Register a new app
- `thirdParty:getApp` - Get app details by ID
- `thirdParty:updateApp` - Update an app
- `thirdParty:deleteApp` - Request app deactivation
- `thirdParty:listWebhooks` - List webhooks (paginated)
- `thirdParty:createWebhook` - Create a new webhook
- `thirdParty:getWebhook` - Get webhook details by ID
- `thirdParty:updateWebhook` - Update a webhook
- `thirdParty:deleteWebhook` - Delete a webhook
- `thirdParty:rotateWebhookSigningKey` - Rotate webhook signing key

### Offices Permissions
- `offices:createAccessPass` - Create an access pass for a membership contract
- `offices:listAccessPasses` - List access passes for managed contracts (paginated)
- `offices:getAccessPass` - Retrieve an access pass by ID
- `offices:revokeAccessPass` - Revoke an access pass

### Events Permissions
- `events:listEvents` - List events with optional filters (paginated)
- `events:createEvent` - Create a new event
- `events:addEventHost` - Add a co-host to an event
- `events:listLocations` - List available locations (event spaces and rooms)
- `events:listRoomBookings` - List room bookings (paginated)
- `events:createRoomBooking` - Create a room booking

### Chain Permissions
- `chain:getCurrentNetwork` - Get current network name
- `chain:getAvailableNetworks` - Get list of available networks
- `chain:switchNetwork` - Switch to a different network
- `chain:getCurrentChainConfig` - Get full chain configuration
- `chain:getContractAddresses` - Get FND, iFND, PaymentRouter, and SubscriptionManager contract addresses

### Navigation Permissions
- `navigation:openApp` - Navigate to another app (app-to-app deep linking)
- `navigation:close` - Close the current app and return to the host

## Navigation (App-to-App Deep Linking)

Apps can navigate to other apps using the Navigation access class. This enables deep linking between apps with optional path and query parameters.

### Opening Another App

```typescript
// Navigate to the payments app
await sdk.getNavigation().openApp('payments');

// Navigate with a deep link path and params
await sdk.getNavigation().openApp('payments', {
  path: '/scan',
  params: { amount: '50', ref: 'order-123' },
});
```

The target app must exist in the host's app registry. If the app is not found, the SDK throws an error.

### Receiving Deep Link Data

When your app is opened via another app's `openApp()` call, you can listen for the incoming deep link data:

```typescript
const sdk = new FrontierSDK();

// Register a callback for incoming deep links
const unsubscribe = sdk.getNavigation().onDeepLink((data) => {
  console.log('Deep link path:', data.path);   // e.g. '/scan'
  console.log('Deep link params:', data.params); // e.g. { amount: '50' }

  // Route to the appropriate view in your app
  if (data.path === '/scan') {
    showScanView(data.params);
  }
});

// Later, unsubscribe when no longer needed
unsubscribe();
```

### Closing the App

```typescript
// Close the current app and return to the previous screen
await sdk.getNavigation().close();
```

### Message Flow

```
App A                          Host PWA                         App B
  |                               |                               |
  |-- navigation:openApp -------->|                               |
  |   { appId: "B", path, params }|                               |
  |                               |-- store deep link intent ---->|
  |                               |-- navigate to /apps/B ------->|
  |                               |                               |
  |                               |<-- app:ready ----------------|
  |                               |-- navigation:deepLinkParams ->|
  |                               |   { path, params }            |
```

## Verified Access Controls

Third-party apps run inside sandboxed iframes hosted by the PWA (Frontier Wallet). Because all SDK communication passes through the PWA host via `postMessage`, the host is a potential man-in-the-middle: it could, in theory, modify or fabricate user data before relaying it to your app.

**`user:getVerifiedAccessControls`** solves this by providing a cryptographically signed payload directly from the Frontier API server. The SDK verifies the ECDSA secp256k1 signature against hardcoded per-environment public keys *inside your iframe*, meaning the host cannot tamper with the data without breaking the signature.

**Always use `getVerifiedAccessControls()` when making access decisions** — never trust unsigned user data from other SDK methods for gating features, content, or permissions.

```typescript
const access = await sdk.getUser().getVerifiedAccessControls();

// These fields are cryptographically guaranteed by the API server:
console.log(access.subscriptionStatus); // 'active', 'canceled', 'awaiting_approval', or null
console.log(access.subscriptionPlan);   // 'citizen', 'network-society', etc.
console.log(access.communities);        // ['arts-music', 'tech']
console.log(access.addOns);             // ['globetrotter']
console.log(access.email);              // user's email
```

The method throws if the signature is invalid or the public key for the environment is not configured. Wrap the call in a try/catch and deny access on failure.

## Security

The SDK verifies that apps are running in legitimate Frontier Wallet instances. Allowed origins:

- `http://localhost:5173` (development)
- `https://sandbox.os.frontiertower.io`
- `https://alpha.os.frontiertower.io`
- `https://beta.os.frontiertower.io`
- `https://os.frontiertower.io` (production)

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the SDK
npm run build

# Watch mode for development
npm run dev
```

### Publishing to npm

The package is published to npm as `@frontiertower/frontier-sdk`.

```bash
# 1. Log in to npm (one-time setup)
npm login

# 2. Bump the version (patch/minor/major)
npm version patch  # e.g. 0.15.0 → 0.15.1

# 3. Build and publish (prepublishOnly runs build automatically)
npm publish --access public
```

> **Note:** `npm publish` automatically runs `npm run build` via the `prepublishOnly` script before publishing.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Frontier Tower

## Support

For questions and support, please visit [Frontier Tower](https://frontiertower.io) or open an issue on GitHub.
