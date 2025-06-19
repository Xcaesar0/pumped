import React, { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { User, SocialConnection } from '../lib/supabase'
import { useSocialConnections } from '../hooks/useSocialConnections'
import { xOAuthService } from '../services/xAuth'

interface SocialConnectionModalProps {
  user: User
  platform: 'telegram' | 'x'
  onClose: () => void
}

// Telegram Login Widget types
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
  }
}

const SocialConnectionModal: React.FC<SocialConnectionModalProps> = ({ user, platform, onClose }) => {
  const { addConnection, removeConnection, getConnectionByPlatform, loadConnections, loading: connectionsLoading } = useSocialConnections(user.id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [telegramWidgetLoaded, setTelegramWidgetLoaded] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  const platformConfig = {
    telegram: {
      name: 'Telegram',
      icon: MessageCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      description: 'Connect your Telegram account using the official Telegram Login Widget'
    },
    x: {
      name: 'X (Twitter)',
      icon: () => (
        <svg width="20" height="18" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M34.6526 0H41.3995L26.6594 16.847L44 39.7719H30.4225L19.7881 25.8681L7.61989 39.7719H0.868864L16.6349 21.7522L0 0H13.9222L23.5348 12.7087L34.6526 0ZM32.2846 35.7336H36.0232L11.8908 3.82626H7.87892L32.2846 35.7336Z" fill="currentColor"/>
        </svg>
      ),
      color: 'text-gray-300',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      description: 'Connect your X (Twitter) account to earn 100 points'
    }
  }

  const config = platformConfig[platform]
  const Icon = config.icon

  useEffect(() => {
    // Set a timeout to handle stuck loading states
    const timeoutId = setTimeout(() => {
      if (!initialLoadComplete && connectionsLoading) {
        console.warn('Loading connections timeout, proceeding anyway')
        setLoadingTimeout(true)
        setInitialLoadComplete(true)
      }
    }, 5000) // 5 second timeout

    // Load connections when modal opens
    const initializeConnections = async () => {
      try {
        await loadConnections()
      } catch (err) {
        console.error('Failed to load connections:', err)
        setError('Failed to load existing connections')
      } finally {
        setInitialLoadComplete(true)
        clearTimeout(timeoutId)
      }
    }

    if (user?.id && user.id !== 'undefined') {
      initializeConnections()
    } else {
      // If no valid user ID, skip loading
      setInitialLoadComplete(true)
      clearTimeout(timeoutId)
    }
    
    return () => {
      clearTimeout(timeoutId)
      // Cleanup
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth
      }
      // Remove any existing telegram widget scripts
      const existingScript = document.getElementById('telegram-login-script')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (platform === 'telegram' && !telegramWidgetLoaded && initialLoadComplete) {
      // Delay telegram widget loading until connections are loaded
      setTimeout(() => {
        loadTelegramWidget()
      }, 500)
    }
  }, [platform, initialLoadComplete])

  // Check for OAuth callback on component mount
  useEffect(() => {
    if (platform === 'x') {
      handleOAuthCallback()
    }
  }, [platform])

  // Check for final OAuth redirect results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const connectSuccess = urlParams.get('x_connect_success')
    const connectError = urlParams.get('x_connect_error')

    if (connectSuccess === 'true') {
      setSuccess(true)
      setLoading(false)
      // Reload connections to show the new X connection
      loadConnections()
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Auto-close modal after success
      setTimeout(() => {
        onClose()
      }, 2000)
    } else if (connectError) {
      setError(decodeURIComponent(connectError))
      setLoading(false)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [loadConnections, onClose])

  // Get connection after initial load is complete
  const existingConnection = initialLoadComplete ? getConnectionByPlatform(platform) : null
  const connected = !!existingConnection

  const loadTelegramWidget = () => {
    // Check if script already exists
    if (document.getElementById('telegram-login-script')) {
      setTelegramWidgetLoaded(true)
      return
    }

    // Set up the callback function
    window.onTelegramAuth = handleTelegramAuth

    // Get bot username from environment variables
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'Pumpeddotfun_bot'

    // Create the script element with the exact configuration you provided
    const script = document.createElement('script')
    script.id = 'telegram-login-script'
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')

    // Add error handling for script loading
    script.onerror = () => {
      setError('Failed to load Telegram login widget. Please try again.')
      setTelegramWidgetLoaded(false)
    }

    script.onload = () => {
      setTelegramWidgetLoaded(true)
    }

    // Append to the widget container
    if (widgetContainerRef.current) {
      widgetContainerRef.current.appendChild(script)
    }
  }

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    setLoading(true)
    setError(null)

    try {
      // Basic validation
      if (!telegramUser.id || !telegramUser.first_name) {
        throw new Error('Invalid Telegram user data received')
      }

      // Verify the authentication (basic check)
      if (!verifyTelegramAuth(telegramUser)) {
        throw new Error('Telegram authentication verification failed')
      }

      const connectionData: Omit<SocialConnection, 'id' | 'connected_at'> = {
        user_id: user.id,
        platform: 'telegram' as const,
        platform_user_id: telegramUser.id.toString(),
        platform_username: telegramUser.username || `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
        is_active: true
      }

      await addConnection(connectionData)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Telegram auth error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect Telegram account')
    } finally {
      setLoading(false)
    }
  }

  const handleXConnect = async () => {
    // Prevent duplicate connections by checking if one already exists
    if (connected || loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check if X OAuth is properly configured
      const clientId = import.meta.env.VITE_X_CLIENT_ID
      if (!clientId) {
        throw new Error('X OAuth is not configured. Please contact support.')
      }

      // Initiate real X OAuth flow
      await xOAuthService.initiateOAuth(user.id)
      
    } catch (err) {
      console.error('X OAuth initiation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start X authentication')
      setLoading(false)
    }
  }

  const handleOAuthCallback = async () => {
    try {
      // Check if this is an OAuth callback
      const callbackData = xOAuthService.handleOAuthCallback()
      if (!callbackData) return

      const { code, state } = callbackData

      // Verify state parameter
      if (!xOAuthService.verifyState(state)) {
        throw new Error('Invalid OAuth state parameter')
      }

      setLoading(true)
      setError(null)

      // Get stored OAuth state
      const oauthState = xOAuthService.getOAuthState()
      if (!oauthState) {
        throw new Error('OAuth state not found')
      }

      // Exchange code for token
      const tokenData = await xOAuthService.exchangeCodeForToken(code, oauthState.codeVerifier)
      
      // Get user profile
      const userProfile = await xOAuthService.getUserProfile(tokenData.access_token)

      // Create social connection
      const connectionData: Omit<SocialConnection, 'id' | 'connected_at'> = {
        user_id: user.id,
        platform: 'x' as const,
        platform_user_id: userProfile.id,
        platform_username: userProfile.username,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : 
          undefined,
        is_active: true
      }

      await addConnection(connectionData)
      
      // Clean up OAuth state
      xOAuthService.clearOAuthState()
      
      setSuccess(true)
      setLoading(false)
      
      // Auto-close modal after success
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err) {
      console.error('OAuth callback error:', err)
      setError(err instanceof Error ? err.message : 'OAuth authentication failed')
      setLoading(false)
      
      // Clean up OAuth state on error
      xOAuthService.clearOAuthState()
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const verifyTelegramAuth = (authData: TelegramUser): boolean => {
    try {
      // Basic verification - check if auth is not older than 1 hour
      const currentTime = Math.floor(Date.now() / 1000)
      const authTime = authData.auth_date
      
      if (currentTime - authTime > 3600) {
        console.warn('Telegram auth data is too old')
        return false
      }
      
      // Check required fields
      if (!authData.id || !authData.first_name || !authData.hash) {
        console.warn('Missing required Telegram auth fields')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error verifying Telegram auth:', error)
      return false
    }
  }

  const handleDisconnect = async () => {
    if (!existingConnection) return

    setLoading(true)
    setError(null)

    try {
      await removeConnection(existingConnection.id)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while connections are being loaded (with timeout)
  if (!initialLoadComplete && connectionsLoading && !loadingTimeout) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md rounded-2xl border border-gray-700/50 p-6"
          style={{ backgroundColor: '#171717' }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
            <span className="text-white">Loading connections...</span>
          </div>
          <div className="text-center">
            <button
              onClick={() => {
                setInitialLoadComplete(true)
                setLoadingTimeout(true)
              }}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              Skip loading and continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl border border-gray-700/50 p-6"
        style={{ backgroundColor: '#171717' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config.name}</h2>
              <p className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700/50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">
              {connected ? 'Successfully disconnected!' : 'Successfully connected!'}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            <span className="text-sm text-blue-400">
              {platform === 'x' ? 'Redirecting to X authentication...' : 'Processing Telegram connection...'}
            </span>
          </div>
        )}

        {/* Show timeout warning if applicable */}
        {loadingTimeout && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Connection loading timed out, but you can still proceed
            </span>
          </div>
        )}

        {/* Connection Info */}
        {connected && existingConnection && !success && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30" style={{ backgroundColor: '#262626' }}>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Connected Account</span>
            </div>
            <p className="text-sm text-gray-300">@{existingConnection.platform_username}</p>
            <p className="text-xs text-gray-400 mt-1">
              Connected on {new Date(existingConnection.connected_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Platform-specific Connection UI */}
        {!connected && !success && !loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {config.description}
            </p>
            
            {platform === 'telegram' ? (
              <>
                {/* Loading indicator - separate from widget container */}
                {!telegramWidgetLoaded && (
                  <div className="text-center mb-4">
                    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Loading Telegram Login Widget...</p>
                    </div>
                  </div>
                )}
                
                {/* Telegram Widget Container - managed by third-party script */}
                <div className="text-center">
                  <div 
                    ref={widgetContainerRef}
                    className="flex justify-center min-h-[50px] items-center"
                  />
                </div>

                {/* Instructions */}
                {telegramWidgetLoaded && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-400 text-center">
                      📱 Click the "Log in with Telegram" button above to connect your account
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* X Connection Button */
              <div className="text-center">
                <button
                  onClick={handleXConnect}
                  disabled={loading || connected}
                  className={`w-full flex items-center justify-center space-x-2 p-4 rounded-xl transition-all duration-300 border ${
                    loading || connected
                      ? 'bg-gray-800 border-gray-600/30 cursor-not-allowed opacity-50'
                      : 'bg-gray-600 hover:bg-gray-700 border-gray-500/30 hover:border-gray-400/50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-300" />
                  <span className="font-medium text-white">
                    {loading ? 'Connecting...' : 'Connect X Account'}
                  </span>
                  <div className="ml-2 px-2 py-1 rounded bg-green-500/20 border border-green-500/30">
                    <span className="text-xs font-semibold text-green-400">+100 pts</span>
                  </div>
                </button>
                
                <div className="mt-4 p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
                  <p className="text-xs text-gray-400 text-center">
                    🔐 Secure OAuth authentication with X (Twitter)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disconnect Button */}
        {connected && !success && !loading && (
          <div className="space-y-3">
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
              <span className="font-medium text-white">Disconnect Account</span>
            </button>
          </div>
        )}

        {/* Security Note */}
        {!connected && !success && platform === 'telegram' && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <p className="text-xs text-gray-400 text-center">
              🔒 This uses the official Telegram Login Widget. Your data is secure and we only access basic profile information.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialConnectionModal