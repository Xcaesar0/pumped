import React, { useState, useEffect } from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'
import { useUser } from '../hooks/useUser'
import { useReferralPersistence } from '../hooks/useReferralPersistence'
import ConnectedHero from './ConnectedHero'
import ReferralPage from './ReferralPage'

const Hero = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { user, loading } = useUser()
  const { hasPendingReferral, getPendingReferral } = useReferralPersistence()

  const handleYesClick = () => {
    open()
  }

  const handleNoClick = () => {
    window.open('https://pump.fun', '_blank')
  }

  // Check if this is a referral page by looking at the URL path
  const isReferralPath = window.location.pathname.startsWith('/ref/')
  const referralCodeFromPath = isReferralPath ? window.location.pathname.replace('/ref/', '') : null
  
  // Show referral page if user came from a referral link
  if (isReferralPath && referralCodeFromPath) {
    return <ReferralPage referralCode={referralCodeFromPath} />
  }

  // Show loading state while checking user
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isConnected ? 'Loading your profile...' : 'Connecting your wallet...'}
          </p>
          {hasPendingReferral() && (
            <p className="text-blue-400 text-sm mt-2">
              Processing referral link...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show connected state if wallet is connected and user exists
  if (isConnected && user) {
    return <ConnectedHero user={user} />
  }

  // Show initial connection prompt for disconnected wallets or users without profiles
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6" style={{ backgroundColor: '#1A1A1A' }}>
      {/* Referral Indicator */}
      {hasPendingReferral() && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">🎉 You've been invited! Connect your wallet to join.</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto w-full">
        {/* Main Question */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-2 sm:mb-4 leading-tight text-white px-2">
            Are You Ready To Go..
          </h2>
          <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-2">
            <span className="block sm:inline">Beyond The</span>
            <span className="block sm:inline sm:ml-2">Pump?</span>
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 lg:mt-16 px-4">
          {/* Yes Button Container */}
          <div className="relative w-full sm:w-auto">
            {/* Image positioned above the button */}
            <div className={`absolute -top-4 sm:-top-6 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 z-20 transition-all duration-300 ${
              hoveredButton === 'yes' ? 'twinkle-blue' : ''
            }`}>
              <img 
                src="/src/assets/Asset 1.png" 
                alt="Pill icon" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
              {/* Blue Twinkle overlay effect */}
              {hoveredButton === 'yes' && (
                <div className="absolute inset-0 twinkle-overlay">
                  <div className="twinkle-star twinkle-star-blue twinkle-star-1"></div>
                  <div className="twinkle-star twinkle-star-blue twinkle-star-2"></div>
                  <div className="twinkle-star twinkle-star-blue twinkle-star-3"></div>
                </div>
              )}
            </div>

            {/* Yes Button */}
            <button
              onClick={handleYesClick}
              onMouseEnter={() => setHoveredButton('yes')}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-bold text-white rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 sm:hover:scale-110 active:scale-95 min-w-[140px] sm:min-w-[160px]"
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300" />
              
              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                hoveredButton === 'yes' ? 'animate-pulse' : ''
              }`} />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] sm:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
              
              <span className="relative z-10">YES</span>
            </button>
          </div>

          {/* No Button Container */}
          <div className="relative w-full sm:w-auto">
            {/* Image positioned above the button */}
            <div className={`absolute -top-4 sm:-top-6 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 z-20 transition-all duration-300 ${
              hoveredButton === 'no' ? 'twinkle-red' : ''
            }`}>
              <img 
                src="/src/assets/Asset 2.png" 
                alt="Pill icon" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
              {/* Red Twinkle overlay effect */}
              {hoveredButton === 'no' && (
                <div className="absolute inset-0 twinkle-overlay">
                  <div className="twinkle-star twinkle-star-red twinkle-star-1"></div>
                  <div className="twinkle-star twinkle-star-red twinkle-star-2"></div>
                  <div className="twinkle-star twinkle-star-red twinkle-star-3"></div>
                </div>
              )}
            </div>

            {/* No Button */}
            <button
              onClick={handleNoClick}
              onMouseEnter={() => setHoveredButton('no')}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-bold text-white rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 sm:hover:scale-110 active:scale-95 min-w-[140px] sm:min-w-[160px]"
            >
              {/* Button Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300" />
              
              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                hoveredButton === 'no' ? 'animate-pulse' : ''
              }`} />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] sm:shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
              
              <span className="relative z-10">NO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom twinkle animation styles */}
      <style jsx>{`
        .twinkle-blue {
          animation: twinkle-glow-blue 1.5s ease-in-out infinite;
        }

        .twinkle-red {
          animation: twinkle-glow-red 1.5s ease-in-out infinite;
        }

        .twinkle-overlay {
          pointer-events: none;
        }

        .twinkle-star {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          opacity: 0;
          animation: twinkle-flash 1.2s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .twinkle-star {
            width: 4px;
            height: 4px;
          }
        }

        .twinkle-star-blue {
          background: #3b82f6;
          box-shadow: 0 0 4px #3b82f6;
        }

        @media (min-width: 640px) {
          .twinkle-star-blue {
            box-shadow: 0 0 6px #3b82f6;
          }
        }

        .twinkle-star-red {
          background: #ef4444;
          box-shadow: 0 0 4px #ef4444;
        }

        @media (min-width: 640px) {
          .twinkle-star-red {
            box-shadow: 0 0 6px #ef4444;
          }
        }

        .twinkle-star-1 {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .twinkle-star-2 {
          top: 70%;
          right: 15%;
          animation-delay: 0.4s;
        }

        .twinkle-star-3 {
          top: 40%;
          left: 70%;
          animation-delay: 0.8s;
        }

        @keyframes twinkle-glow-blue {
          0%, 100% { 
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) brightness(1);
          }
          50% { 
            filter: drop-shadow(0 2px 8px rgba(59,130,246,0.4)) brightness(1.2);
          }
        }

        @keyframes twinkle-glow-red {
          0%, 100% { 
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) brightness(1);
          }
          50% { 
            filter: drop-shadow(0 2px 8px rgba(239,68,68,0.4)) brightness(1.2);
          }
        }

        @keyframes twinkle-flash {
          0%, 100% { 
            opacity: 0;
            transform: scale(0.5);
          }
          50% { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default Hero