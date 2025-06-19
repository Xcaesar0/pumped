import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi';
import { useUser } from '../hooks/useUser';
import Logo from './Logo';
import ProfileSettingsModal from './ProfileSettingsModal';

const Header = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, loading } = useUser();

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      open();
    }
  };

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleUserProfileClick = () => {
    if (isConnected && user) {
      setShowProfileModal(true);
    }
  };

  return (
    <>
      <header className="relative z-50 w-full border-b border-gray-800/50" style={{ backgroundColor: '#0C0C0C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo onClick={handleLogoClick} />

            {/* Right Side: Username + Connect Wallet */}
            <div className="flex items-center space-x-3">
              {/* Username Display (when connected) */}
              {isConnected && user && !loading && (
                <button
                  onClick={handleUserProfileClick}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                  style={{ backgroundColor: '#262626' }}
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">{user.username}</span>
                </button>
              )}

              {/* Loading indicator when user is being loaded */}
              {isConnected && loading && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              )}

              {/* Connect Wallet Button */}
              <button 
                onClick={handleWalletClick}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: isConnected ? '#ef4444' : '#52D593' }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    <span className="text-sm font-semibold text-black">Loading...</span>
                  </>
                ) : (
                  <>
                    <w3m-button />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connection Status (Mobile) */}
          {isConnected && address && (
            <div className="mt-3 sm:hidden p-2 rounded-lg border border-green-500/30" style={{ backgroundColor: '#262626' }}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-300">Connected:</span>
                <span className="text-xs font-mono text-green-400">{formatAddress(address)}</span>
              </div>
              {user && (
                <p className="text-xs text-blue-400 mt-1">@{user.username}</p>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Profile Settings Modal */}
      {showProfileModal && user && (
        <ProfileSettingsModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default Header;