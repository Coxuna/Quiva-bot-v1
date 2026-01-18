# Hedera WalletConnect Setup Guide

This guide explains how to set up the official Hedera WalletConnect integration using `@hashgraph/hedera-wallet-connect`.

## 📋 Prerequisites

1. **WalletConnect Project ID**: You need to create a project on WalletConnect Dashboard
2. **Hedera Wallet**: Users need a Hedera-compatible wallet that supports WalletConnect

## 🚀 Setup Steps

### Step 1: Get WalletConnect Project ID

1. **Visit WalletConnect Dashboard:**
   - Go to: https://dashboard.walletconnect.com/
   - Sign up or log in

2. **Create a New Project:**
   - Click "Create Project"
   - Enter project name (e.g., "Quiva Game")
   - Copy your **Project ID**

3. **Add to Environment Variables:**
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
   ```

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Hedera Configuration (existing)
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_TOKEN_ID=0.0.123456
VITE_HEDERA_OPERATOR_ID=0.0.123456
VITE_HEDERA_OPERATOR_KEY=your-key
```

### Step 3: How It Works

#### For Users:

1. **User opens the game**
2. **Clicks "Connect Wallet" button**
3. **Two connection methods:**

   **Method A: QR Code (Recommended)**
   - User opens their Hedera wallet app (HashPack, Blade, etc.)
   - Scans QR code displayed by the dApp
   - Approves connection in wallet
   - Wallet connects automatically

   **Method B: Manual URI**
   - User copies WalletConnect URI from dApp
   - Pastes it into wallet app
   - Approves connection
   - Wallet connects

4. **Once connected:**
   - Account ID is automatically saved to user profile
   - Tokens are automatically sent when points are earned

#### For Developers:

The integration uses:
- **WalletKit** from `@reown/walletkit` for wallet-side connection
- **Hedera namespace** in CAIP format: `hedera:testnet:0.0.xxxxxx`
- **Automatic session management** and account ID extraction

## 🔧 Technical Details

### Namespace Format

Hedera uses the following CAIP format:
- **Chain ID**: `hedera:testnet` or `hedera:mainnet`
- **Account ID**: `hedera:testnet:0.0.xxxxxx` (CAIP-10 format)

### Supported Methods

The integration supports:
- `hedera_signTransaction`
- `hedera_signMessage`
- `hedera_signAndExecuteTransaction`

### Supported Events

- `chainChanged`
- `accountsChanged`

## 📱 Compatible Wallets

Users can connect with any Hedera wallet that supports WalletConnect:
- **HashPack** - Full WalletConnect support
- **Blade Wallet** - WalletConnect support
- **Kabila** - WalletConnect support
- **Dropp** - WalletConnect support
- Other Hedera wallets with WalletConnect support

## 🎯 How It Works

1. **User clicks "Connect Wallet"** → Opens WalletConnect modal with QR code
2. **User scans QR code** with their Hedera wallet app
3. **Wallet approves connection** → Session established
4. **Account ID extracted** → Automatically saved to user profile
5. **Tokens automatically sent** when points are earned

## 🐛 Troubleshooting

### "WalletConnect Project ID is required"
- Make sure `VITE_WALLETCONNECT_PROJECT_ID` is set in `.env`
- Restart your development server after adding the variable

### "No active sessions"
- User needs to scan QR code or paste URI to connect
- Check that the wallet supports WalletConnect protocol

### "Account ID not found"
- Session might not have Hedera namespace
- Check that wallet is properly connected
- Verify namespace format in session

### Connection Issues
- Ensure wallet app is updated
- Check network connectivity
- Try disconnecting and reconnecting

## 📚 Resources

- **WalletConnect Dashboard**: https://dashboard.walletconnect.com/
- **WalletConnect Docs**: https://docs.walletconnect.com/
- **WalletKit Docs**: https://docs.reown.com/walletkit
- **Hedera Docs**: https://docs.hedera.com/

## 🔄 Migration from HashPack

If you were using HashPack directly:
1. Replace `useHashPack` hook with `useWalletConnect`
2. Replace `HashPackConnect` component with `WalletConnectButton`
3. Add `VITE_WALLETCONNECT_PROJECT_ID` to `.env`
4. Users will now connect via WalletConnect instead of direct HashPack extension

## ✅ Benefits of WalletConnect

- **Universal**: Works with any wallet that supports WalletConnect
- **Mobile Support**: Works with mobile wallet apps via QR code
- **Better UX**: Standardized connection flow
- **Future-proof**: Supports multiple chains and protocols

