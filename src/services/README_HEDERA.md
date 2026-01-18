# Hedera Token Service (HTS) Integration

This document explains how to set up and use the Hedera Token Service integration in the game.

## Overview

The Hedera Token Service integration allows the game to automatically award Hedera tokens to players when they earn points. The integration supports both direct SDK usage and API fallback methods.

## Setup

### 1. Install Dependencies

The Hedera SDK is already added to `package.json`. Install it by running:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Hedera Network Configuration
VITE_HEDERA_NETWORK=testnet  # or 'mainnet' for production

# Token Configuration
VITE_HEDERA_TOKEN_ID=0.0.123456  # Your Hedera token ID

# Operator Account (for minting/transferring tokens)
VITE_HEDERA_OPERATOR_ID=0.0.123456  # Your operator account ID
VITE_HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...  # Your operator private key (DER format)
```

**📖 Need help getting these values?** See the detailed setup guide: `HEDERA_SETUP_GUIDE.md`

**Quick Summary:**
- **Network**: Choose `testnet` (free) or `mainnet` (production)
- **Token ID**: Create a token via HashPack wallet or Hedera SDK
- **Operator ID**: Your Hedera account ID from HashPack wallet
- **Operator Key**: Export private key from HashPack (Settings → Security)

**Important Security Notes:**
- Never commit your `.env` file to version control
- The operator key should be kept secure
- For production, use environment variables from your hosting platform
- Consider using a dedicated operator account with limited permissions

### 3. User Hedera Account ID - WalletConnect Integration

The integration now supports **WalletConnect protocol**! Users can connect any Hedera wallet that supports WalletConnect (HashPack, Blade, etc.) directly in the game to receive tokens automatically.

#### How It Works:

1. **WalletConnect Button**: A `WalletConnectButton` component is available in the game header
2. **Universal Wallet Support**: Works with any Hedera wallet that supports WalletConnect protocol
3. **QR Code Connection**: Users can scan QR code from their wallet app or paste WalletConnect URI
4. **Automatic Account ID Storage**: When users connect their wallet, their Hedera account ID is automatically saved to their user profile
5. **Automatic Token Awards**: Once connected, tokens are automatically sent to the user's wallet when they earn points

#### WalletConnect Setup:

You need a WalletConnect Project ID:
1. Visit: https://dashboard.walletconnect.com/
2. Create a new project
3. Copy your Project ID
4. Add to `.env`: `VITE_WALLETCONNECT_PROJECT_ID=your-project-id`

See `WALLETCONNECT_SETUP.md` for detailed setup instructions.

#### User Database:

Add a `hedera_account_id` field to your user model:

```javascript
// In your user model/database
{
  telegram_id: "...",
  hedera_account_id: "0.0.123456",  // Automatically saved when wallet connects
  // ... other fields
}
```

#### User Experience:

1. User opens the game
2. If Hedera is enabled, a wallet connection section appears in the header
3. User clicks "Connect HashPack Wallet"
4. HashPack extension opens (if installed) or user is directed to install it
5. User approves connection
6. Account ID is saved automatically
7. Tokens are awarded automatically when points are earned

## How It Works

### Wallet Connection Flow

1. User sees "Connect HashPack Wallet" button in game header (if Hedera is enabled)
2. User clicks button → HashPack extension opens
3. User approves connection
4. Account ID is automatically saved to user profile
5. Connection status is displayed in the header

### Token Award Flow

1. Player earns points in the game
2. Points are saved to the database
3. `awardHederaTokens()` is called automatically
4. System checks if user has connected their wallet
   - If not connected, shows notification to connect wallet
   - If connected, proceeds with token transfer
5. System checks if user's account is associated with the token
6. If associated, tokens are transferred to the user's account
7. Success notification is shown to the user
8. Transaction is logged for verification

### Token Association

Before users can receive tokens, their Hedera account must be associated with your token. This is a one-time operation that users need to perform.

**Options for Token Association:**

1. **User-initiated**: Provide a button/link for users to associate the token
2. **Automatic**: Use the `associateToken()` method if you have the user's private key (not recommended for security)
3. **Backend Service**: Create a backend endpoint that handles association

## Usage

### Basic Integration

The integration is already added to `GamePlayWordFormedPointAwarded.jsx`. It will automatically:

- Initialize when the component loads
- Award tokens when points are earned
- Handle errors gracefully (game continues even if token award fails)

### Manual Token Award

You can also manually award tokens:

```javascript
import { createHederaTokenService } from '../../services/hederaTokenService';

const service = createHederaTokenService({
  network: 'testnet',
  tokenId: '0.0.123456',
  operatorId: '0.0.123456',
  operatorKey: 'your-private-key'
});

await service.initializeClient();
await service.transferTokens('0.0.123456', 100, 'Game reward');
```

### Check Token Balance

```javascript
const balance = await service.getTokenBalance('0.0.123456');
console.log('User token balance:', balance);
```

### Associate Token

```javascript
// User needs to provide their private key (or use wallet)
await service.associateToken('0.0.123456', 'user-private-key');
```

## Network Configuration

### Testnet
- Use for development and testing
- Free test tokens available from Hedera portal
- Network: `testnet`

### Mainnet
- Use for production
- Requires real HBAR for transaction fees
- Network: `mainnet`

## Transaction Fees

Hedera transactions require HBAR (Hedera's native cryptocurrency) to pay for:
- Token transfers
- Token minting
- Token association
- Balance queries

Ensure your operator account has sufficient HBAR balance.

## Error Handling

The integration is designed to be non-blocking:
- If token award fails, the game continues normally
- Errors are logged to console
- Users still receive their game points
- Token awards can be retried later if needed

## Security Best Practices

1. **Never expose private keys in client-side code**
   - Use environment variables
   - Consider using a backend service for sensitive operations

2. **Use dedicated operator account**
   - Don't use your main account
   - Limit permissions where possible

3. **Implement rate limiting**
   - Prevent abuse of token minting/transferring
   - Track token awards per user

4. **Monitor transactions**
   - Use Hedera Explorer to verify transactions
   - Set up alerts for unusual activity

## Troubleshooting

### "Token ID not configured"
- Check that `VITE_HEDERA_TOKEN_ID` is set in your `.env` file
- Restart your development server after adding env variables

### "Token not associated"
- User needs to associate their account with the token first
- Provide instructions or a button to trigger association

### "Insufficient balance"
- Operator account needs HBAR for transaction fees
- Check account balance on Hedera Explorer

### "SDK not available"
- Make sure `@hashgraph/sdk` is installed: `npm install`
- Check that imports are working correctly

## Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Token Service Guide](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service)
- [Hedera SDK Reference](https://github.com/hashgraph/hedera-sdk-js)
- [Hedera Explorer](https://hashscan.io/)

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify your environment variables are set correctly
3. Ensure your operator account has sufficient HBAR
4. Check that the token ID is correct and exists on the network

