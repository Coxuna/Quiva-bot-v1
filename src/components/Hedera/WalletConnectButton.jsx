import React from 'react';
import { useWalletConnect } from '../../hooks/useWalletConnect';

/**
 * WalletConnect Button Component
 * Allows users to connect their Hedera wallet via WalletConnect
 * Opens modal with QR code for scanning
 */
const WalletConnectButton = ({ onConnect, onDisconnect, className = '' }) => {
  const {
    isConnected,
    accountId,
    isLoading,
    error,
    connect,
    disconnect,
  } = useWalletConnect();
  
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const lastConnectedAccountRef = React.useRef(null);

  // Handle connect button click
  const handleConnect = async () => {
    try {
      await connect();
      // Connection happens asynchronously, onConnect will be called when connected
    } catch (error) {
      // Error is already handled in useWalletConnect hook
      console.log('Connection attempt completed');
    }
  };

  // Call onConnect when account is available (only once per account)
  React.useEffect(() => {
    if (isConnected && accountId && onConnect) {
      // Only call onConnect if this is a new account (prevent infinite loops)
      if (lastConnectedAccountRef.current !== accountId) {
        lastConnectedAccountRef.current = accountId;
        onConnect(accountId);
      }
    } else if (!isConnected) {
      // Reset when disconnected
      lastConnectedAccountRef.current = null;
    }
  }, [isConnected, accountId, onConnect]);

  // Handle disconnect
  const handleDisconnect = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isDisconnecting) {
      console.log('Already disconnecting, ignoring click');
      return;
    }
    
    try {
      setIsDisconnecting(true);
      console.log('Disconnect button clicked');
      await disconnect();
      console.log('Disconnect successful');
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className={`walletconnect-button ${className}`}>
      {isConnected ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              Connected: {accountId ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}` : 'Wallet'}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            type="button"
            disabled={isDisconnecting}
            className="text-xs text-red-600 hover:text-red-700 underline cursor-pointer px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              pointerEvents: 'auto',
              zIndex: 10,
              minWidth: '80px',
              minHeight: '24px',
              userSelect: 'none'
            }}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-[#18325B] hover:bg-[#1e40af] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            title="Click to open QR code scanner. Scan with your Hedera wallet app to connect"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && (
            <p className="text-xs text-red-600 text-center max-w-xs">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;

