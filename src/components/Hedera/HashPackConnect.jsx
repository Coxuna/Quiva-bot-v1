import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/UserProvider';

/**
 * HashPack Wallet Connection Component
 * Allows users to connect their HashPack wallet to receive Hedera tokens
 */
const HashPackConnect = ({ onConnect, onDisconnect, className = '' }) => {
  const { user, updateUser } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if HashPack is installed
  const isHashPackInstalled = () => {
    return typeof window !== 'undefined' && window.hashpack;
  };

  // Check existing connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (!isHashPackInstalled()) {
      return;
    }

    try {
      const hashpack = window.hashpack;
      const connected = await hashpack.isConnected();
      
      if (connected) {
        const account = await hashpack.getAccountId();
        setAccountId(account);
        setIsConnected(true);
        
        // Update user profile with Hedera account ID
        if (user?.telegram_id && account !== user?.hedera_account_id) {
          await updateUser(user.telegram_id, { hedera_account_id: account });
        }
        
        if (onConnect) onConnect(account);
      }
    } catch (error) {
      console.error('Error checking HashPack connection:', error);
    }
  };

  const handleConnect = async () => {
    if (!isHashPackInstalled()) {
      setError('HashPack wallet is not installed. Please install it from https://hashpack.app');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hashpack = window.hashpack;
      
      // Request connection
      const result = await hashpack.connect();
      
      if (result && result.accountId) {
        const account = result.accountId;
        setAccountId(account);
        setIsConnected(true);
        
        // Save to user profile
        if (user?.telegram_id) {
          await updateUser(user.telegram_id, { hedera_account_id: account });
          console.log('✅ Hedera account ID saved to user profile:', account);
        }
        
        if (onConnect) onConnect(account);
      } else {
        throw new Error('Connection was cancelled or failed');
      }
    } catch (error) {
      console.error('Error connecting to HashPack:', error);
      setError(error.message || 'Failed to connect to HashPack wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (isHashPackInstalled()) {
        const hashpack = window.hashpack;
        await hashpack.disconnect();
      }
      
      setAccountId(null);
      setIsConnected(false);
      
      // Optionally remove from user profile
      // await updateUser(user.telegram_id, { hedera_account_id: null });
      
      if (onDisconnect) onDisconnect();
    } catch (error) {
      console.error('Error disconnecting from HashPack:', error);
    }
  };

  // If HashPack is not installed, show install button
  if (!isHashPackInstalled()) {
    return (
      <div className={`hashpack-connect ${className}`}>
        <a
          href="https://hashpack.app"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Install HashPack Wallet
        </a>
        <p className="text-xs text-gray-500 mt-2">
          Connect your Hedera wallet to receive tokens
        </p>
      </div>
    );
  }

  return (
    <div className={`hashpack-connect ${className}`}>
      {isConnected ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              Connected: {accountId ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}` : 'HashPack'}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-red-600 hover:text-red-700 underline"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-[#18325B] hover:bg-[#1e40af] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect HashPack Wallet'}
          </button>
          {error && (
            <p className="text-xs text-red-600 text-center max-w-xs">{error}</p>
          )}
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Connect to receive Hedera tokens as rewards
          </p>
        </div>
      )}
    </div>
  );
};

export default HashPackConnect;

