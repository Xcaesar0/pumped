import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks'

// Get projectId from environment variables
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

// Use a default project ID for development if not set
const fallbackProjectId = 'your_project_id_here'

if (!projectId || projectId === fallbackProjectId) {
  console.warn('VITE_REOWN_PROJECT_ID is not properly configured. Using fallback for development.')
}

// Set up the Wagmi Adapter (Config)
const wagmiAdapter = new WagmiAdapter({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  ssr: false,
  projectId: projectId || fallbackProjectId,
  networks: [mainnet, arbitrum, polygon]
})

// Set up metadata
const metadata = {
  name: 'pumped.fun',
  description: 'Beyond The Pump - Web3 Social Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://pumped.fun',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || fallbackProjectId,
  networks: [mainnet, arbitrum, polygon],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: ['x', 'github', 'discord'],
    emailShowWallets: true
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