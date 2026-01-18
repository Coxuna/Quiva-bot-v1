/**
 * Hedera Token Service (HTS) Integration
 * Handles token minting, transfers, and balance checks on Hedera network
 */

// Hedera SDK will be installed via npm
// For now, we'll create a service that can work with both direct SDK calls and API calls

class HederaTokenService {
  constructor(config = {}) {
    this.network = config.network || 'testnet'; // 'testnet' or 'mainnet'
    this.tokenId = config.tokenId || null; // Hedera token ID (e.g., '0.0.123456')
    this.operatorId = config.operatorId || null; // Operator account ID
    this.operatorKey = config.operatorKey || null; // Operator private key
    this.apiUrl = config.apiUrl || null; // Optional: Custom API endpoint
    
    // Network endpoints
    this.networkEndpoints = {
      testnet: [
        'https://testnet.hashio.io/api',
        'https://testnet.mirrornode.hedera.com/api'
      ],
      mainnet: [
        'https://mainnet.hashio.io/api',
        'https://mainnet.mirrornode.hedera.com/api'
      ]
    };
  }

  /**
   * Initialize Hedera client (requires @hiero-ledger/sdk)
   * This method should be called after installing the SDK
   */
  async initializeClient() {
    try {
      // Dynamic import to handle cases where SDK might not be installed
      const { Client, AccountId, PrivateKey } = await import('@hiero-ledger/sdk');
      
      // Use forTestnet() or forMainnet() based on network
      this.client = this.network === 'mainnet' 
        ? Client.forMainnet()
        : Client.forTestnet();
      
      if (this.operatorId && this.operatorKey) {
        const operatorId = AccountId.fromString(this.operatorId);
        
        // Check if key is in ECDSA format (starts with 0x) or standard format
        const operatorKey = this.operatorKey.startsWith('0x')
          ? PrivateKey.fromStringECDSA(this.operatorKey)
          : PrivateKey.fromString(this.operatorKey);
        
        this.client.setOperator(operatorId, operatorKey);
      }
      
      return true;
    } catch (error) {
      console.warn('Hedera SDK not available, using API fallback:', error.message);
      return false;
    }
  }

  /**
   * Transfer tokens to a user's Hedera account
   * @param {string} recipientAccountId - Recipient's Hedera account ID (e.g., '0.0.123456')
   * @param {number} amount - Amount of tokens to transfer
   * @param {string} memo - Optional memo for the transaction
   * @returns {Promise<Object>} Transaction result
   */
  async transferTokens(recipientAccountId, amount, memo = '') {
    try {
      // Try using SDK first
      if (this.client) {
        return await this.transferTokensWithSDK(recipientAccountId, amount, memo);
      }
      
      // Fallback to API call
      return await this.transferTokensWithAPI(recipientAccountId, amount, memo);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  /**
   * Transfer tokens using @hiero-ledger/sdk
   */
  async transferTokensWithSDK(recipientAccountId, amount, memo) {
    const { TransferTransaction, TokenId, AccountId, PrivateKey } = await import('@hiero-ledger/sdk');
    
    if (!this.tokenId) {
      throw new Error('Token ID not configured');
    }

    if (!this.client) {
      throw new Error('Hedera client not initialized');
    }

    if (!this.operatorKey) {
      throw new Error('Operator key not configured');
    }

    const tokenId = TokenId.fromString(this.tokenId);
    const recipientId = AccountId.fromString(recipientAccountId);
    
    // Check if key is in ECDSA format (starts with 0x) or standard format
    const operatorKey = this.operatorKey.startsWith('0x')
      ? PrivateKey.fromStringECDSA(this.operatorKey)
      : PrivateKey.fromString(this.operatorKey);

    // Create the token transfer transaction
    const transaction = new TransferTransaction()
      .addTokenTransfer(tokenId, this.client.operatorAccountId, -amount)
      .addTokenTransfer(tokenId, recipientId, amount)
      .setTransactionMemo(memo || `Game reward: ${amount} tokens`);

    // Execute the transaction (client will auto-sign if operator is set)
    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return {
      success: true,
      transactionId: txResponse.transactionId.toString(),
      receipt: receipt.status.toString(),
      amount,
      recipientAccountId
    };
  }

  /**
   * Transfer tokens using API (fallback method)
   */
  async transferTokensWithAPI(recipientAccountId, amount, memo) {
    // This would require a backend API endpoint
    // For now, we'll return a promise that can be handled by backend
    console.log('API transfer method - requires backend implementation');
    
    return {
      success: false,
      message: 'API transfer requires backend implementation',
      recipientAccountId,
      amount
    };
  }

  /**
   * Mint new tokens to a recipient
   * @param {string} recipientAccountId - Recipient's Hedera account ID
   * @param {number} amount - Amount of tokens to mint
   * @returns {Promise<Object>} Transaction result
   */
  async mintTokens(recipientAccountId, amount) {
    try {
      if (this.client) {
        return await this.mintTokensWithSDK(recipientAccountId, amount);
      }
      
      return await this.mintTokensWithAPI(recipientAccountId, amount);
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error(`Token minting failed: ${error.message}`);
    }
  }

  /**
   * Mint tokens using @hiero-ledger/sdk
   */
  async mintTokensWithSDK(recipientAccountId, amount) {
    const { TokenMintTransaction, TokenId, AccountId } = await import('@hiero-ledger/sdk');
    
    if (!this.tokenId) {
      throw new Error('Token ID not configured');
    }

    const tokenId = TokenId.fromString(this.tokenId);
    const recipientId = AccountId.fromString(recipientAccountId);

    const transaction = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(amount);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    // Then transfer to recipient
    return await this.transferTokens(recipientAccountId, amount, 'Minted game reward');
  }

  /**
   * Mint tokens using API (fallback)
   */
  async mintTokensWithAPI(recipientAccountId, amount) {
    console.log('API mint method - requires backend implementation');
    return {
      success: false,
      message: 'API mint requires backend implementation',
      recipientAccountId,
      amount
    };
  }

  /**
   * Get token balance for an account
   * @param {string} accountId - Hedera account ID
   * @returns {Promise<number>} Token balance
   */
  async getTokenBalance(accountId) {
    try {
      if (this.client) {
        return await this.getTokenBalanceWithSDK(accountId);
      }
      
      return await this.getTokenBalanceWithAPI(accountId);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  /**
   * Get token balance using @hiero-ledger/sdk
   */
  async getTokenBalanceWithSDK(accountId) {
    const { AccountBalanceQuery, AccountId, TokenId } = await import('@hiero-ledger/sdk');
    
    if (!this.tokenId) {
      throw new Error('Token ID not configured');
    }

    const query = new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId));

    const balance = await query.execute(this.client);
    const tokenId = TokenId.fromString(this.tokenId);
    const tokenBalance = balance.tokens.get(tokenId);

    return tokenBalance ? tokenBalance.toNumber() : 0;
  }

  /**
   * Get token balance using API
   */
  async getTokenBalanceWithAPI(accountId) {
    // Use mirror node API
    const endpoint = this.network === 'mainnet' 
      ? 'https://mainnet.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';
    
    try {
      const response = await fetch(`${endpoint}/api/v1/accounts/${accountId}/tokens`);
      const data = await response.json();
      
      if (this.tokenId && data.tokens) {
        const token = data.tokens.find(t => t.token_id === this.tokenId);
        return token ? parseFloat(token.balance) : 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching balance from API:', error);
      return 0;
    }
  }

  /**
   * Associate token with an account (required before receiving tokens)
   * @param {string} accountId - Account ID to associate
   * @param {string} privateKey - Account's private key (for signing)
   * @returns {Promise<Object>} Transaction result
   */
  async associateToken(accountId, privateKey) {
    try {
      if (this.client) {
        return await this.associateTokenWithSDK(accountId, privateKey);
      }
      
      return {
        success: false,
        message: 'Token association requires SDK or backend implementation'
      };
    } catch (error) {
      console.error('Error associating token:', error);
      throw new Error(`Token association failed: ${error.message}`);
    }
  }

  /**
   * Associate token using @hiero-ledger/sdk
   */
  async associateTokenWithSDK(accountId, privateKey) {
    const { TokenAssociateTransaction, AccountId, PrivateKey } = await import('@hiero-ledger/sdk');
    
    if (!this.tokenId) {
      throw new Error('Token ID not configured');
    }

    const accountIdObj = AccountId.fromString(accountId);
    
    // Check if key is in ECDSA format (starts with 0x) or standard format
    const accountKey = privateKey.startsWith('0x')
      ? PrivateKey.fromStringECDSA(privateKey)
      : PrivateKey.fromString(privateKey);
    
    const tokenId = TokenId.fromString(this.tokenId);

    const transaction = new TokenAssociateTransaction()
      .setAccountId(accountIdObj)
      .setTokenIds([tokenId]);

    // Execute the transaction (client will handle signing if operator is set)
    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return {
      success: true,
      transactionId: txResponse.transactionId.toString(),
      receipt: receipt.status.toString()
    };
  }

  /**
   * Check if account is associated with the token
   * @param {string} accountId - Account ID to check
   * @returns {Promise<boolean>} True if associated
   */
  async isTokenAssociated(accountId) {
    try {
      const balance = await this.getTokenBalance(accountId);
      // If we can query balance, token is associated
      return balance !== null;
    } catch (error) {
      // If query fails, token might not be associated
      return false;
    }
  }
}

// Export singleton instance factory
export const createHederaTokenService = (config) => {
  return new HederaTokenService(config);
};

// Export class for direct instantiation
export default HederaTokenService;

