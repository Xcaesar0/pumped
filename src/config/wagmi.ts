import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, polygon } from 'wagmi/chains'

// Get projectId from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set. Please add it to your .env file.')
}

// Create wagmiConfig
const metadata = {
  name: 'pumped.fun',
  description: 'Beyond The Pump',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum, polygon] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})