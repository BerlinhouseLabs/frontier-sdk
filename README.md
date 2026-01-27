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

### Chain Permissions
- `chain:getCurrentNetwork` - Get current network name
- `chain:getAvailableNetworks` - Get list of available networks
- `chain:switchNetwork` - Switch to a different network
- `chain:getCurrentChainConfig` - Get full chain configuration

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Frontier Tower

## Support

For questions and support, please visit [Frontier Tower](https://frontiertower.io) or open an issue on GitHub.
