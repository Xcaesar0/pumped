import React from 'react'
import { X, AlertTriangle, ExternalLink } from 'lucide-react'
import { User } from '../lib/supabase'

interface SocialConnectionRequiredModalProps {
  user: User
  platform: 'x' | 'telegram'
  onClose: () => void
  onConnect: () => void
}

const SocialConnectionRequiredModal: React.FC<SocialConnectionRequiredModalProps> = ({ 
  user, 
  platform,
  onClose, 
  onConnect 
}) => {
  const platformConfig = {
    x: {
      name: 'X (Twitter)',
      icon: () => (
        <svg width="20" height="18" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M34.6526 0H41.3995L26.6594 16.847L44 39.7719H30.4225L19.7881 25.8681L7.61989 39.7719H0.868864L16.6349 21.7522L0 0H13.9222L23.5348 12.7087L34.6526 0ZM32.2846 35.7336H36.0232L11.8908 3.82626H7.87892L32.2846 35.7336Z" fill="currentColor"/>
        </svg>
      ),
      color: 'text-gray-300',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    },
    telegram: {
      name: 'Telegram',
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="currentColor"/>
        </svg>
      ),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    }
  }

  const config = platformConfig[platform]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl border border-gray-700/50"
        style={{ backgroundColor: '#171717' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Connection Required</h2>
                <p className="text-sm text-gray-400">Connect your {config.name} account</p>
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
          {/* Warning Message */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2">
                  {config.name} Account Required
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  To complete this task, you need to connect your {config.name} account first. 
                  This allows us to verify task completion automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <Icon />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{config.name}</p>
                <p className="text-xs text-gray-400">Not connected</p>
              </div>
            </div>
            
            <button
              onClick={onConnect}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200 ${
                platform === 'x' 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Icon />
              <span className="text-sm font-medium text-white">Connect {config.name}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
            <h4 className="text-sm font-medium text-green-400 mb-2">Benefits of Connecting</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Automatic task verification</li>
              <li>• Earn points for social media activities</li>
              <li>• Access to exclusive {platform === 'x' ? 'X' : 'Telegram'} tasks</li>
              <li>• Real-time progress tracking</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConnect}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Connect Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialConnectionRequiredModal