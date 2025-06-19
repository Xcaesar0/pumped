import React, { useState } from 'react'
import { 
  X, 
  User as UserIcon, 
  MessageCircle, 
  Save,
  AlertCircle,
  CheckCircle,
  Edit3
} from 'lucide-react'
import { User } from '../lib/supabase'
import { useSocialConnections } from '../hooks/useSocialConnections'
import SocialConnectionModal from './SocialConnectionModal'

interface ProfileSettingsModalProps {
  user: User
  onClose: () => void
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onClose }) => {
  const { 
    getConnectionByPlatform, 
    loading: connectionsLoading 
  } = useSocialConnections(user.id)
  
  const [socialModal, setSocialModal] = useState<'telegram' | 'x' | null>(null)
  const [newUsername, setNewUsername] = useState(user.username)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Get social connections
  const telegramConnection = getConnectionByPlatform('telegram')
  const xConnection = getConnectionByPlatform('x')

  const handleUsernameUpdate = async () => {
    if (newUsername.trim() === user.username) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // In a real implementation, this would require wallet signature verification
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Username updated successfully!')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username')
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
          className="w-full max-w-md rounded-2xl border border-gray-700/50"
          style={{ backgroundColor: '#171717' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                  <p className="text-sm text-gray-400">Manage your account settings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700/50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Messages */}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">{success}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Username Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Username</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-colors duration-200"
                    placeholder="Enter username"
                  />
                  <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <button
                  onClick={handleUsernameUpdate}
                  disabled={loading || newUsername.trim() === user.username}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span className="text-sm font-medium text-white">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="text-sm font-medium text-white">Update Username</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-400">
                  ⚠️ Username can only be changed once and requires wallet signature
                </p>
              </div>
            </div>

            {/* Social Connections */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Social Connections</h3>
              
              {/* Telegram */}
              <div className="p-4 rounded-xl border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      {connectionsLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Telegram</p>
                      <p className="text-xs text-gray-400">
                        {connectionsLoading ? (
                          'Checking...'
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
                      onClick={() => setSocialModal('telegram')}
                      disabled={connectionsLoading}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      <span className="text-xs font-medium text-white">
                        {telegramConnection ? 'Manage' : 'Connect'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* X (Twitter) */}
              <div className="p-4 rounded-xl border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
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
                          'Checking...'
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
                      onClick={() => setSocialModal('x')}
                      disabled={connectionsLoading}
                      className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
                    >
                      <span className="text-xs font-medium text-white">
                        {xConnection ? 'Manage' : 'Connect'}
                      </span>
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

export default ProfileSettingsModal