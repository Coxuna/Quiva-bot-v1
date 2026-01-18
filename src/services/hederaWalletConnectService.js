/**
 * Hedera WalletConnect Service using @reown/appkit-universal-connector
 * Handles wallet connection using UniversalConnector for Hedera
 */

import { UniversalConnector } from '@reown/appkit-universal-connector';

// Hedera network configurations
const hederaTestnet = {
  id: 296,
  chainNamespace: 'hedera',
  caipNetworkId: 'hedera:testnet',
  name: 'Hedera Testnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
  rpcUrls: { 
    default: { 
      http: ['https://testnet.hashio.io/api'] 
    } 
  }
};

const hederaMainnet = {
  id: 295,
  chainNamespace: 'hedera',
  caipNetworkId: 'hedera:mainnet',
  name: 'Hedera Mainnet',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
  rpcUrls: { 
    default: { 
      http: ['https://mainnet.hashio.io/api'] 
    } 
  }
};

class HederaWalletConnectService {
  constructor(config = {}) {
    this.projectId = config.projectId || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    this.network = config.network || import.meta.env.VITE_HEDERA_NETWORK || 'testnet';
    this.metadata = config.metadata || {
      name: 'Quiva Game',
      description: 'Connect your Hedera wallet to receive game rewards',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://example.com',
      icons: typeof window !== 'undefined' 
        ? [`${window.location.origin}/assets/token.png`]
        : ['https://avatars.githubusercontent.com/u/31002956'],
    };
    this.universalConnector = null;
    this.isInitialized = false;
    this.session = null;
  }

  /**
   * Initialize UniversalConnector
   */
  async initialize() {
    if (this.isInitialized && this.universalConnector) {
      return this.universalConnector;
    }

    if (!this.projectId) {
      throw new Error('WalletConnect Project ID is required. Set VITE_WALLETCONNECT_PROJECT_ID in .env');
    }

    try {
      // Select network based on configuration
      const hederaNetwork = this.network === 'mainnet' ? hederaMainnet : hederaTestnet;

      // Initialize UniversalConnector with Hedera configuration
      // Note: UniversalConnector uses CAIP-25 format for Hedera
      this.universalConnector = await UniversalConnector.init({
        projectId: this.projectId,
        metadata: this.metadata,
        networks: [{
          methods: [
            'hedera_signTransaction',
            'hedera_signAndExecuteTransaction',
            'hedera_signMessage',
            'hedera_signAndExecuteQuery',
            'hedera_executeTransaction',
          ],
          chains: [hederaNetwork],
          events: ['chainChanged', 'accountsChanged'],
          namespace: 'hedera',
        }],
      });

      this.isInitialized = true;
      console.log('✅ Hedera UniversalConnector initialized');

      // Setup event listeners for connection changes
      this.setupEventListeners();

      // Check for existing session after initialization
      await this.restoreSession();

      return this.universalConnector;
    } catch (error) {
      console.error('❌ Error initializing Hedera UniversalConnector:', error);
      throw error;
    }
  }

  /**
   * Connect wallet with timeout
   */
  async connect(timeoutMs = 60000) {
    if (!this.universalConnector) {
      await this.initialize();
    }

    try {
      // Wrap connection in a timeout promise
      const connectPromise = this.universalConnector.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout. Please try again.')), timeoutMs);
      });

      const result = await Promise.race([connectPromise, timeoutPromise]);
      this.session = result.session;
      console.log('✅ Wallet connected:', result);
      return result;
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      
      // Handle specific error cases
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      // Check if user cancelled the connection (common case)
      if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User closed') ||
        errorMessage.includes('cancelled') ||
        errorMessage.includes('rejected') ||
        errorMessage.includes('closed') ||
        errorMessage === 'Unknown error' || // Often means user closed modal
        errorMessage.includes('User denied') ||
        errorMessage.includes('Connection timeout')
      ) {
        // User cancelled or timeout - don't throw error, just return null
        if (errorMessage.includes('Connection timeout')) {
          console.log('ℹ️ Connection timeout');
        } else {
          console.log('ℹ️ User cancelled wallet connection');
        }
        return null;
      }
      
      // Network or other errors - throw with better message
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw with original message if it's a specific error
      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect() {
    if (!this.universalConnector) {
      console.log('ℹ️ No connector to disconnect');
      this.session = null;
      return;
    }

    try {
      // Check if disconnect method exists
      if (typeof this.universalConnector.disconnect === 'function') {
        await this.universalConnector.disconnect();
      } else if (typeof this.universalConnector.killSession === 'function') {
        // Alternative method name
        await this.universalConnector.killSession();
      } else {
        console.log('ℹ️ No disconnect method found, clearing session manually');
      }
      
      this.session = null;
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
      // Clear session even if disconnect fails
      this.session = null;
      // Don't throw - allow disconnect to complete even if connector fails
      console.log('ℹ️ Session cleared despite disconnect error');
    }
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    // Return current session if exists
    if (this.session) {
      return [this.session];
    }
    return [];
  }

  /**
   * Get Hedera account ID from active session
   * @returns {string|null} Account ID in format 0.0.xxxxxx
   */
  getHederaAccountId() {
    if (!this.session) {
      return null;
    }

    try {
      // Extract account from session namespaces
      const hederaNamespace = this.session.namespaces?.hedera;
      if (hederaNamespace?.accounts && hederaNamespace.accounts.length > 0) {
        const account = hederaNamespace.accounts[0];
        // Parse CAIP-10 format: hedera:testnet:0.0.xxxxxx -> 0.0.xxxxxx
        const parts = account.split(':');
        if (parts.length >= 3) {
          return parts[2];
        }
        return account;
      }
    } catch (error) {
      console.error('Error extracting account ID:', error);
    }

    return null;
  }

  /**
   * Check if wallet is connected
   */
  async isConnected() {
    // First check our stored session
    if (this.session !== null && this.session !== undefined) {
      return true;
    }

    // If no stored session, try to restore from connector
    if (this.universalConnector) {
      await this.restoreSession();
      return this.session !== null && this.session !== undefined;
    }

    return false;
  }

  /**
   * Restore existing session from UniversalConnector
   */
  async restoreSession() {
    if (!this.universalConnector) {
      return;
    }

    try {
      // Check if UniversalConnector has methods to get active sessions
      // UniversalConnector may store sessions internally
      if (typeof this.universalConnector.getActiveSessions === 'function') {
        const sessions = await this.universalConnector.getActiveSessions();
        if (sessions && sessions.length > 0) {
          this.session = sessions[0];
          console.log('✅ Restored existing session:', this.session);
          return;
        }
      }

      // Alternative: Check if there's a session property
      if (this.universalConnector.session) {
        this.session = this.universalConnector.session;
        console.log('✅ Found session in connector:', this.session);
        return;
      }

      // Try to get session from connector state
      if (this.universalConnector.state?.session) {
        this.session = this.universalConnector.state.session;
        console.log('✅ Found session in connector state:', this.session);
        return;
      }

      // Check for session in connector's internal storage
      // UniversalConnector might use different property names
      const connectorKeys = Object.keys(this.universalConnector);
      for (const key of connectorKeys) {
        const value = this.universalConnector[key];
        if (value && typeof value === 'object' && value.session) {
          this.session = value.session;
          console.log('✅ Found session in connector property:', key, this.session);
          return;
        }
      }

      console.log('ℹ️ No existing session found');
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }

  /**
   * Setup event listeners for connection changes
   */
  setupEventListeners() {
    if (!this.universalConnector) {
      return;
    }

    try {
      // Listen for session events if available
      if (typeof this.universalConnector.on === 'function') {
        // Listen for session events
        this.universalConnector.on('session_proposal', (proposal) => {
          console.log('📋 Session proposal:', proposal);
        });

        this.universalConnector.on('session_connect', (session) => {
          console.log('🔗 Session connected:', session);
          this.session = session;
        });

        this.universalConnector.on('session_delete', () => {
          console.log('🗑️ Session deleted');
          this.session = null;
        });

        this.universalConnector.on('session_update', (session) => {
          console.log('🔄 Session updated:', session);
          this.session = session;
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Get current session
   */
  getSession() {
    return this.session;
  }
}

// Export singleton instance factory
let hederaWalletConnectInstance = null;

export const createHederaWalletConnectService = (config) => {
  if (!hederaWalletConnectInstance) {
    hederaWalletConnectInstance = new HederaWalletConnectService(config);
  }
  return hederaWalletConnectInstance;
};

// Export class for direct instantiation
export default HederaWalletConnectService;
