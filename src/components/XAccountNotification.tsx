import React from 'react'
import { X, AlertTriangle, ExternalLink } from 'lucide-react'
import { User } from '../lib/supabase'

interface XAccountNotificationProps {
  user: User
  onDismiss: () => void
  onConnectX: () => void
}

const XAccountNotification: React.FC<XAccountNotificationProps> = ({ 
  user, 
  onDismiss, 
  onConnectX 
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-yellow-400 mb-1">
              X Account Required (MOCKUP)
            </h3>
            <p className="text-xs text-gray-300 mb-3">
              Connect your X account to activate referral rewards and unlock additional tasks. This is a mockup version with no real X integration.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={onConnectX}
                className="flex items-center space-x-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="text-xs font-medium text-white">Connect X (Mock)</span>
              </button>
              
              <button
                onClick={onDismiss}
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
              >
                <span className="text-xs font-medium text-white">Later</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-yellow-500/20 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default XAccountNotification