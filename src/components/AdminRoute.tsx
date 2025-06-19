import React from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import AdminTasksPanel from './AdminTasksPanel'

// Simple admin check - in production, you'd want proper authentication
const ADMIN_PASSWORD = 'admin123' // Change this to a secure password

const AdminRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #52D593 0%, #4ade80 100%)' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter the admin password to access the tasks panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#52D593' }}
            >
              <Shield className="w-4 h-4 text-black" />
              <span className="font-medium text-black">Access Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <p className="font-medium mb-1">Development Mode</p>
                <p>This is a simple password protection for development. In production, implement proper authentication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <AdminTasksPanel />
}

export default AdminRoute