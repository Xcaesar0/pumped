// X OAuth Authentication Service - MOCKUP VERSION
export interface XOAuthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface XOAuthState {
  userId: string
  codeVerifier: string
  state: string
}

export class XOAuthService {
  private config: XOAuthConfig

  constructor(config: XOAuthConfig) {
    this.config = config
  }

  /**
   * Initiate X OAuth flow - MOCKUP VERSION
   */
  public async initiateOAuth(userId: string): Promise<void> {
    console.log('MOCKUP: X OAuth initiation for user:', userId)
    
    // Simulate OAuth flow with a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate success by redirecting to success URL
    const mockSuccessUrl = `${window.location.origin}?x_connect_success=true`
    window.location.href = mockSuccessUrl
  }

  /**
   * Handle OAuth callback - MOCKUP VERSION
   */
  public handleOAuthCallback(): { code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (!code || !state) {
      return null
    }

    return { code, state }
  }

  /**
   * Store OAuth state - MOCKUP VERSION
   */
  private storeOAuthState(state: XOAuthState): void {
    sessionStorage.setItem('x_oauth_state', JSON.stringify(state))
  }

  /**
   * Get OAuth state - MOCKUP VERSION
   */
  public getOAuthState(): XOAuthState | null {
    const stored = sessionStorage.getItem('x_oauth_state')
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  /**
   * Clear OAuth state - MOCKUP VERSION
   */
  public clearOAuthState(): void {
    sessionStorage.removeItem('x_oauth_state')
  }

  /**
   * Verify OAuth state - MOCKUP VERSION
   */
  public verifyState(receivedState: string): boolean {
    console.log('MOCKUP: Verifying state:', receivedState)
    return true // Always return true for mockup
  }
}

// Create singleton instance with mockup config
const xOAuthConfig: XOAuthConfig = {
  clientId: 'mockup_client_id',
  redirectUri: `${window.location.origin}/auth/x/callback`,
  scopes: ['tweet.read', 'users.read', 'offline.access']
}

export const xOAuthService = new XOAuthService(xOAuthConfig)