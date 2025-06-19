import React, { useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { useReferralPersistence } from './hooks/useReferralPersistence'
import Header from './components/Header';
import Hero from './components/Hero';
import AdminRoute from './components/AdminRoute';

// Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set. Please add it to your .env file.')
}

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true
})

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  // Initialize referral persistence on app load
  useReferralPersistence()

  // Check if this is the admin route
  const isAdminRoute = window.location.pathname === '/admin'

  if (isAdminRoute) {
    return <AdminRoute />
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: '#1A1A1A' }}>
      <Header />
      <Hero />
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;