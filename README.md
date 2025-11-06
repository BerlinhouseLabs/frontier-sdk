# Frontier Wallet SDK

Official SDK for building apps on Frontier Wallet.

## Example Project

Check out [**frontier-kickstarter**](https://github.com/BerlinhouseLabs/frontier-kickstarter) - a complete example project that demonstrates how to use this SDK to build a decentralized crowdfunding platform on Frontier Wallet.

## Installation

```bash
npm install @frontier-wallet/sdk
```

## Quick Start

```typescript
import { FrontierSDK } from '@frontier-wallet/sdk';
import { isInFrontierApp, renderStandaloneMessage } from '@frontier-wallet/sdk/ui-utils';

// Initialize the SDK
const sdk = new FrontierSDK();

// Check if running in Frontier Wallet
if (!isInFrontierApp()) {
  renderStandaloneMessage(document.body, 'My App');
  return;
}

// Access wallet information
const balance = await sdk.getWallet().getBalance();
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
- `wallet:executeCall` - Execute arbitrary contract calls

### Storage Permissions
- `storage:get` - Read from storage
- `storage:set` - Write to storage
- `storage:remove` - Remove from storage
- `storage:clear` - Clear all storage
- `storage:*` - Full storage access (wildcard for all storage methods)

### User Permissions
- `user:getDetails` - Access current user details
- `user:getProfile` - Access user profile information

### Chain Permissions
- `chain:getCurrentNetwork` - Get current network name
- `chain:getAvailableNetworks` - Get list of available networks
- `chain:switchNetwork` - Switch to a different network
- `chain:getCurrentChainConfig` - Get full chain configuration

## Security

The SDK verifies that apps are running in legitimate Frontier Wallet instances. Allowed origins:

- `http://localhost:5173` (development)
- `https://sandbox.wallet.frontiertower.io`
- `https://alpha.wallet.frontiertower.io`
- `https://beta.wallet.frontiertower.io`
- `https://wallet.frontiertower.io` (production)

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
