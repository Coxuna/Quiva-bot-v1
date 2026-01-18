import { useState, useEffect, useCallback } from 'react';
import { useUser } from './UserProvider';

/**
 * Custom hook for HashPack wallet integration
 * Provides wallet connection state and methods
 */
export const useHashPack = () => {
  const { user, updateUser } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if HashPack extension is installed
  const isInstalled = () => {
    return typeof window !== 'undefined' && window.hashpack;
  };

  // Check existing connection
  const checkConnection = useCallback(async () => {
    if (!isInstalled()) {
      return;
    }

    try {
      const hashpack = window.hashpack;
      const connected = await hashpack.isConnected();
      
      if (connected) {
        const account = await hashpack.getAccountId();
        setAccountId(account);
        setIsConnected(true);
        
        // Update user profile if account ID changed
        if (user?.telegram_id && account !== user?.hedera_account_id) {
          await updateUser(user.telegram_id, { hedera_account_id: account });
        }
      } else {
        setIsConnected(false);
        setAccountId(null);
      }
    } catch (error) {
      console.error('Error checking HashPack connection:', error);
      setIsConnected(false);
      setAccountId(null);
    }
  }, [user, updateUser]);

  // Connect to HashPack wallet
  const connect = useCallback(async () => {
    if (!isInstalled()) {
      setError('HashPack wallet is not installed. Please install it from https://hashpack.app');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hashpack = window.hashpack;
      const result = await hashpack.connect();
      
      if (result && result.accountId) {
        const account = result.accountId;
        setAccountId(account);
        setIsConnected(true);
        
        // Save to user profile
        if (user?.telegram_id) {
          await updateUser(user.telegram_id, { hedera_account_id: account });
        }
        
        return account;
      } else {
        throw new Error('Connection was cancelled or failed');
      }
    } catch (error) {
      console.error('Error connecting to HashPack:', error);
      setError(error.message || 'Failed to connect to HashPack wallet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  // Disconnect from HashPack wallet
  const disconnect = useCallback(async () => {
    try {
      if (isInstalled()) {
        const hashpack = window.hashpack;
        await hashpack.disconnect();
      }
      
      setAccountId(null);
      setIsConnected(false);
      setError(null);
    } catch (error) {
      console.error('Error disconnecting from HashPack:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for connection changes
    if (isInstalled()) {
      const hashpack = window.hashpack;
      
      // Check connection periodically
      const interval = setInterval(() => {
        checkConnection();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [checkConnection]);

  return {
    isInstalled: isInstalled(),
    isConnected,
    accountId: accountId || user?.hedera_account_id,
    isLoading,
    error,
    connect,
    disconnect,
    checkConnection
  };
};

export default useHashPack;

