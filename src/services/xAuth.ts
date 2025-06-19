// X OAuth Authentication Service
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
  private readonly OAUTH_BASE_URL = 'https://twitter.com/i/oauth2/authorize'

  constructor(config: XOAuthConfig) {
    this.config = config
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    // Generate random code verifier
    const codeVerifier = this.generateRandomString(128)
    
    // Create code challenge (SHA256 hash of verifier, base64url encoded)
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const codeChallenge = this.base64URLEncode(new Uint8Array(hash))
    
    return { codeVerifier, codeChallenge }
  }

  /**
   * Generate random string for PKCE
   */
  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let result = ''
    const values = new Uint8Array(length)
    crypto.getRandomValues(values)
    
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length]
    }
    
    return result
  }

  /**
   * Base64URL encode
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * Generate state parameter for OAuth
   */
  private generateState(userId: string): string {
    return btoa(JSON.stringify({
      userId,
      timestamp: Date.now(),
      random: Math.random().toString(36)
    }))
  }

  /**
   * Store OAuth state in sessionStorage
   */
  private storeOAuthState(state: XOAuthState): void {
    sessionStorage.setItem('x_oauth_state', JSON.stringify(state))
  }

  /**
   * Retrieve OAuth state from sessionStorage
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
   * Clear OAuth state from sessionStorage
   */
  public clearOAuthState(): void {
    sessionStorage.removeItem('x_oauth_state')
  }

  /**
   * Initiate X OAuth flow
   */
  public async initiateOAuth(userId: string): Promise<void> {
    try {
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = await this.generatePKCE()
      
      // Generate state parameter
      const state = this.generateState(userId)
      
      // Store OAuth state for later verification
      this.storeOAuthState({
        userId,
        codeVerifier,
        state
      })

      // Build OAuth URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scopes.join(' '),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })

      const oauthUrl = `${this.OAUTH_BASE_URL}?${params.toString()}`
      
      // Redirect to X OAuth
      window.location.href = oauthUrl
      
    } catch (error) {
      console.error('Failed to initiate X OAuth:', error)
      throw new Error('Failed to start X authentication')
    }
  }

  /**
   * Handle OAuth callback (called when user returns from X)
   */
  public handleOAuthCallback(): { code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      throw new Error(`X OAuth error: ${error}`)
    }

    if (!code || !state) {
      return null
    }

    return { code, state }
  }

  /**
   * Verify OAuth state parameter
   */
  public verifyState(receivedState: string): boolean {
    const storedState = this.getOAuthState()
    return storedState?.state === receivedState
  }
}

// Create singleton instance
const xOAuthConfig: XOAuthConfig = {
  clientId: import.meta.env.VITE_X_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_X_REDIRECT_URI || `${window.location.origin}/auth/x/callback`,
  scopes: ['tweet.read', 'users.read', 'offline.access']
}

export const xOAuthService = new XOAuthService(xOAuthConfig)