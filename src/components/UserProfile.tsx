import React, { useState } from 'react'
import { 
  User as UserIcon, 
  Copy, 
  Check, 
  MessageCircle, 
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  Star
} from 'lucide-react'
import { User } from '../lib/supabase'
import { useSocialConnections } from '../hooks/useSocialConnections'
import SocialConnectionModal from './SocialConnectionModal'

interface UserProfileProps {
  user: User
  onClose: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
  const { 
    getConnectionByPlatform, 
    removeConnection, 
    loading: connectionsLoading 
  } = useSocialConnections(user.id)
  
  const [socialModal, setSocialModal] = useState<'telegram' | 'x' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get social connections
  const telegramConnection = getConnectionByPlatform('telegram')
  const xConnection = getConnectionByPlatform('x')

  const handleSocialConnect = (platform: 'telegram' | 'x') => {
    setSocialModal(platform)
  }

  const handleSocialDisconnect = async (platform: 'telegram' | 'x') => {
    setLoading(true)
    setError(null)
    
    try {
      const connection = getConnectionByPlatform(platform)
      if (connection) {
        await removeConnection(connection.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account')
    } finally {
      setLoading(false)
    }
  }

  // Custom X (Twitter) SVG Component
  const XIcon = () => (
    <svg width="20" height="18" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.6526 0H41.3995L26.6594 16.847L44 39.7719H30.4225L19.7881 25.8681L7.61989 39.7719H0.868864L16.6349 21.7522L0 0H13.9222L23.5348 12.7087L34.6526 0ZM32.2846 35.7336H36.0232L11.8908 3.82626H7.87892L32.2846 35.7336Z" fill="currentColor"/>
    </svg>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700/50"
          style={{ backgroundColor: '#171717' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 border-b border-gray-700/50" style={{ backgroundColor: '#171717' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                      <Star className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-semibold text-green-400">{user.current_points.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">User Profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700/50"
              >
                <ExternalLink className="w-5 h-5 text-gray-400 rotate-45" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Social Media Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Social Media Accounts</h3>
              
              {/* Telegram */}
              <div className="p-4 rounded-xl border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      {connectionsLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Telegram</p>
                      <p className="text-xs text-gray-400">
                        {connectionsLoading ? (
                          'Checking connection...'
                        ) : telegramConnection ? (
                          `@${telegramConnection.platform_username}`
                        ) : (
                          'Not connected'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {telegramConnection && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    <button
                      onClick={() => telegramConnection ? 
                        handleSocialDisconnect('telegram') : 
                        handleSocialConnect('telegram')
                      }
                      disabled={loading || connectionsLoading}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                        telegramConnection 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                      ) : telegramConnection ? (
                        <>
                          <Unlink className="w-3 h-3" />
                          <span className="text-xs font-medium text-white">Unlink</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3 h-3" />
                          <span className="text-xs font-medium text-white">Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* X (Twitter) */}
              <div className="p-4 rounded-xl border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                      <XIcon />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white">X (Twitter)</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                          +100 pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {connectionsLoading ? (
                          'Checking connection...'
                        ) : xConnection ? (
                          `@${xConnection.platform_username}`
                        ) : (
                          'Not connected'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {xConnection && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    <button
                      onClick={() => xConnection ? 
                        handleSocialDisconnect('x') : 
                        handleSocialConnect('x')
                      }
                      disabled={loading || connectionsLoading}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                        xConnection 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {loading ? (
                        <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                      ) : xConnection ? (
                        <>
                          <Unlink className="w-3 h-3" />
                          <span className="text-xs font-medium text-white">Unlink</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3 h-3" />
                          <span className="text-xs font-medium text-white">Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Connection Modal */}
      {socialModal && (
        <SocialConnectionModal
          user={user}
          platform={socialModal}
          onClose={() => setSocialModal(null)}
        />
      )}
    </>
  )
}

export default UserProfile