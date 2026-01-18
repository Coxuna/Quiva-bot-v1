# Hedera Environment Variables Setup Guide

This guide will walk you through obtaining all the required Hedera environment variables.

## 📋 Required Variables

```env
VITE_HEDERA_NETWORK=testnet          # Network: 'testnet' or 'mainnet'
VITE_HEDERA_TOKEN_ID=0.0.123456      # Your Hedera token ID
VITE_HEDERA_OPERATOR_ID=0.0.123456   # Your operator account ID
VITE_HEDERA_OPERATOR_KEY=your-key    # Your operator private key
```

---

## 🚀 Step-by-Step Setup

### Step 1: Choose Your Network

**For Development/Testing:**
- Use **testnet** (free, for testing)
- Get free test HBAR from: https://portal.hedera.com/

**For Production:**
- Use **mainnet** (requires real HBAR)
- You'll need to purchase HBAR from an exchange

**For this guide, we'll use TESTNET.**

---

### Step 2: Create a Hedera Account (Operator Account)

You have several options:

#### Option A: Using HashPack Wallet (Recommended - Easiest)

1. **Install HashPack Extension:**
   - Chrome: https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/hashpack/
   - Or visit: https://hashpack.app

2. **Create a New Wallet:**
   - Open HashPack extension
   - Click "Create Wallet" or "Import Wallet"
   - Save your recovery phrase securely
   - Set a password

3. **Get Your Account ID:**
   - In HashPack, click on your account
   - Your Account ID will be displayed (format: `0.0.123456`)
   - **This is your `VITE_HEDERA_OPERATOR_ID`**

4. **Get Your Private Key:**
   - In HashPack, go to Settings → Security
   - Click "Export Private Key"
   - Enter your password
   - Copy the private key (DER format)
   - **This is your `VITE_HEDERA_OPERATOR_KEY`**

5. **Get Test HBAR:**
   - Switch to Testnet in HashPack (top right)
   - Visit: https://portal.hedera.com/
   - Click "Get Test HBAR"
   - Enter your Account ID
   - Receive free test HBAR

#### Option B: Using Hedera Portal (Web-based)

1. **Visit Hedera Portal:**
   - Go to: https://portal.hedera.com/

2. **Create Account:**
   - Click "Create Account"
   - Follow the instructions
   - Save your account ID and private key securely

3. **Get Test HBAR:**
   - Click "Get Test HBAR"
   - Enter your Account ID
   - Receive free test HBAR

#### Option C: Using Hedera SDK (Programmatic)

```javascript
// Example: Create account using SDK
const { Client, PrivateKey, AccountCreateTransaction } = require("@hashgraph/sdk");

async function createAccount() {
  const client = Client.forTestnet();
  
  // Generate a new private key
  const privateKey = PrivateKey.generate();
  const publicKey = privateKey.publicKey;
  
  // Create account transaction
  const transaction = await new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(100) // Initial balance in tinybars
    .execute(client);
  
  const receipt = await transaction.getReceipt(client);
  const accountId = receipt.accountId;
  
  console.log("Account ID:", accountId.toString());
  console.log("Private Key:", privateKey.toString());
  
  return { accountId, privateKey };
}
```

---

### Step 3: Create a Hedera Token

You need to create a fungible token on Hedera. Here are your options:

#### Option A: Using HashPack Wallet (Easiest)

1. **Open HashPack:**
   - Make sure you're on Testnet
   - Ensure you have some test HBAR (for fees)

2. **Create Token:**
   - Click "Tokens" → "Create Token"
   - Fill in token details:
     - **Name**: Your token name (e.g., "Game Rewards Token")
     - **Symbol**: Token symbol (e.g., "GRT")
     - **Decimals**: Usually 0 or 8
     - **Initial Supply**: Starting amount (e.g., 1000000)
     - **Max Supply**: Maximum tokens (or unlimited)
   - Click "Create"
   - Approve the transaction

3. **Get Token ID:**
   - After creation, you'll see your Token ID
   - Format: `0.0.123456`
   - **This is your `VITE_HEDERA_TOKEN_ID`**

#### Option B: Using Hedera SDK (Programmatic)

```javascript
const { 
  Client, 
  PrivateKey, 
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType
} = require("@hashgraph/sdk");

async function createToken(operatorId, operatorKey) {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  const transaction = await new TokenCreateTransaction()
    .setTokenName("Game Rewards Token")
    .setTokenSymbol("GRT")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(1000000)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Infinite)
    .execute(client);
  
  const receipt = await transaction.getReceipt(client);
  const tokenId = receipt.tokenId;
  
  console.log("Token ID:", tokenId.toString());
  return tokenId;
}
```

#### Option C: Using Hedera Console (Web-based)

1. **Visit Hedera Console:**
   - Go to: https://console.hedera.com/

2. **Create Token:**
   - Connect your wallet
   - Navigate to "Tokens" → "Create Token"
   - Fill in the form
   - Submit and get your Token ID

---

### Step 4: Get Your Private Key Format

Hedera private keys can be in different formats. The SDK accepts:

1. **DER Format** (Recommended):
   - Format: `302e020100300506032b657004220420...` (long hex string)
   - This is what HashPack exports

2. **ED25519 Format**:
   - Format: `302a300506032b6570032100...` (hex string)

3. **String Format**:
   - Some wallets export as: `ed25519:...`

**For the SDK, use the DER format (the long hex string without the `ed25519:` prefix).**

---

### Step 5: Configure Your .env File

1. **Create `.env` file** in your project root (`Tonmics-bot-v1/.env`):

```env
# Hedera Network Configuration
VITE_HEDERA_NETWORK=testnet

# Your Hedera Token ID (from Step 3)
VITE_HEDERA_TOKEN_ID=0.0.123456

# Your Operator Account ID (from Step 2)
VITE_HEDERA_OPERATOR_ID=0.0.123456

# Your Operator Private Key (from Step 2, DER format)
VITE_HEDERA_OPERATOR_KEY=302e020100300506032b657004220420a1b2c3d4e5f6...
```

2. **Replace the values** with your actual:
   - Token ID
   - Account ID
   - Private Key

3. **Important Security Notes:**
   - ⚠️ **NEVER commit `.env` to Git**
   - Add `.env` to your `.gitignore` file
   - Keep your private key secure
   - Use different accounts for testnet and mainnet

---

## 🔍 Quick Reference: Where to Find Each Value

| Variable | Where to Find |
|----------|---------------|
| `VITE_HEDERA_NETWORK` | Choose: `testnet` or `mainnet` |
| `VITE_HEDERA_TOKEN_ID` | HashPack → Your Tokens → Token ID<br>Or after creating token via SDK/Console |
| `VITE_HEDERA_OPERATOR_ID` | HashPack → Account → Account ID<br>Format: `0.0.123456` |
| `VITE_HEDERA_OPERATOR_KEY` | HashPack → Settings → Security → Export Private Key<br>Format: Long hex string starting with `302e...` |

---

## ✅ Verification Steps

After setting up your `.env` file:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check the console:**
   - Look for: `✅ Hedera Token Service initialized successfully`
   - If you see errors, check:
     - Private key format is correct
     - Account ID format is correct (should be `0.0.xxxxxx`)
     - Token ID format is correct
     - You have sufficient HBAR for fees

3. **Test in the game:**
   - Open the game
   - You should see the HashPack wallet connection section
   - Connect your wallet
   - Play and earn points
   - Check if tokens are received

---

## 🆘 Troubleshooting

### "Invalid private key format"
- Make sure you're using the DER format (long hex string)
- Remove any `ed25519:` prefix if present
- Ensure there are no spaces or line breaks

### "Insufficient balance"
- You need HBAR to pay for transactions
- Get test HBAR from: https://portal.hedera.com/
- Check your balance in HashPack

### "Token not found"
- Verify your Token ID is correct
- Make sure you're on the correct network (testnet/mainnet)
- Check that the token exists on Hedera Explorer: https://hashscan.io/

### "Account not found"
- Verify your Account ID format: `0.0.xxxxxx`
- Make sure you're on the correct network
- Check your account exists on Hedera Explorer

---

## 🔗 Useful Resources

- **HashPack Wallet**: https://hashpack.app
- **Hedera Portal** (Get Test HBAR): https://portal.hedera.com/
- **Hedera Console**: https://console.hedera.com/
- **Hedera Explorer**: https://hashscan.io/
- **Hedera Documentation**: https://docs.hedera.com/
- **Hedera SDK Docs**: https://github.com/hashgraph/hedera-sdk-js

---

## 📝 Example .env File

Here's a complete example (replace with your actual values):

```env
# Hedera Network (testnet for development, mainnet for production)
VITE_HEDERA_NETWORK=testnet

# Your Hedera Token ID (create via HashPack or SDK)
VITE_HEDERA_TOKEN_ID=0.0.1234567

# Your Operator Account ID (from HashPack or Portal)
VITE_HEDERA_OPERATOR_ID=0.0.9876543

# Your Operator Private Key (DER format from HashPack)
VITE_HEDERA_OPERATOR_KEY=302e020100300506032b657004220420a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef
```

---

## 🎯 Quick Start Checklist

- [ ] Install HashPack wallet extension
- [ ] Create a new wallet or import existing
- [ ] Switch to Testnet in HashPack
- [ ] Get test HBAR from Hedera Portal
- [ ] Create a token in HashPack (or via SDK)
- [ ] Copy your Account ID (Operator ID)
- [ ] Export your Private Key (DER format)
- [ ] Create `.env` file with all variables
- [ ] Test the integration in your game

---

**Need Help?** Check the main README: `src/services/README_HEDERA.md`

