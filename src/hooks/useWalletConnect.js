import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserProvider';
import { createHederaWalletConnectService } from '../services/hederaWalletConnectService';

/**
 * Custom hook for Hedera WalletConnect integration
 * Uses @reown/appkit-universal-connector
 */
export const useWalletConnect = () => {
  const { user, updateUser } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [universalConnector, setUniversalConnector] = useState(null);
  const serviceRef = useRef(null);

  // Single save point for hedera_account_id to database
  const saveAccountIdToDB = useCallback(async (account) => {
    if (user?.telegram_id && account && account !== user?.hedera_account_id) {
      await updateUser(user.telegram_id, { hedera_account_id: account });
    }
  }, [user?.telegram_id, user?.hedera_account_id, updateUser]);

  // Check connection status
  const checkConnection = useCallback(async () => {
    if (!serviceRef.current) return;
    
    try {
      const service = serviceRef.current;
      const connected = await service.isConnected();
      setIsConnected(connected);

      if (connected) {
        const account = service.getHederaAccountId();
        setAccountId(account);
        
        // Save to database (single save point)
        await saveAccountIdToDB(account);
      } else {
        setAccountId(null);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      setAccountId(null);
    }
  }, [saveAccountIdToDB]);

  // Initialize Hedera WalletConnect service
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        const service = createHederaWalletConnectService({
          network: import.meta.env.VITE_HEDERA_NETWORK || 'testnet',
        });
        serviceRef.current = service;
        
        const connector = await service.initialize();
        setUniversalConnector(connector);

        // Check existing connections after initialization
        // Give it a moment for session restoration
        setTimeout(() => {
          checkConnection();
        }, 500);
      } catch (error) {
        console.error('Error initializing Hedera WalletConnect:', error);
        setError(error.message);
      }
    };

    initWalletConnect();
  }, [checkConnection]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!serviceRef.current) {
      setError('WalletConnect not initialized');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = serviceRef.current;
      
      // Connect wallet (shows QR code modal)
      const result = await service.connect();
      
      if (result && result.session) {
        setIsConnected(true);
        const account = service.getHederaAccountId();
        setAccountId(account);
        
        // Save to database (single save point)
        await saveAccountIdToDB(account);
        
        setIsLoading(false);
        return account;
      }
      
      // User cancelled or connection failed silently
      // Don't show error for user cancellation
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Only show error if it's not a user cancellation
      const errorMessage = error?.message || 'Failed to connect wallet';
      if (
        !errorMessage.includes('User rejected') &&
        !errorMessage.includes('User closed') &&
        !errorMessage.includes('cancelled') &&
        !errorMessage.includes('rejected') &&
        !errorMessage.includes('closed')
      ) {
        setError(errorMessage);
      }
      
      setIsLoading(false);
      return null;
    }
  }, [saveAccountIdToDB]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    try {
      const service = serviceRef.current;
      await service.disconnect();
      
      // Clear local state (UI only)
      setAccountId(null);
      setIsConnected(false);
      
      // Keep account ID in database to allow token transfers when wallet is disconnected
      // User can still receive tokens even if wallet is not actively connected
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error.message || 'Failed to disconnect wallet');
    }
  }, []);

  // Check connection periodically
  useEffect(() => {
    if (!serviceRef.current) return;

    const interval = setInterval(() => {
      checkConnection();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [checkConnection]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    isConnected,
    accountId: accountId || user?.hedera_account_id,
    isLoading,
    error,
    connect,
    disconnect,
    universalConnector,
  };
};

export default useWalletConnect;
