import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks'

// Get projectId from environment variables
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set. Please add it to your .env file.')
}

// Set up the Wagmi Adapter (Config)
const wagmiAdapter = new WagmiAdapter({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  ssr: false,
  projectId,
  networks: [mainnet, arbitrum, polygon]
})

// Set up metadata
const metadata = {
  name: 'pumped.fun',
  description: 'Beyond The Pump - Web3 Social Platform',
  url: 'https://pumped.fun', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // default to true
    socials: ['x', 'github', 'discord'], // Enable social logins
    emailShowWallets: true // default to true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#52D593',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#52D593',
    '--w3m-border-radius-master': '12px'
  }
})

export { wagmiAdapter, modal }
export const config = wagmiAdapter.wagmiConfig