import React, { useState, useEffect } from 'react'
import { 
  Trophy, 
  Target, 
  Users, 
  Star, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Crown,
  Medal,
  Award,
  ExternalLink,
  MessageCircle,
  Zap,
  Gift,
  TrendingUp,
  Hash,
  UserPlus,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import { User } from '../lib/supabase'
import { useBountyData } from '../hooks/useBountyData'
import { useXAccountNotification } from '../hooks/useXAccountNotification'
import { useSocialConnections } from '../hooks/useSocialConnections'
import ProfileSettingsModal from './ProfileSettingsModal'
import SocialConnectionRequiredModal from './SocialConnectionRequiredModal'
import CashNFTRewards from './CashNFTRewards'
import NameTagRewards from './NameTagRewards'

interface BountyHunterDashboardProps {
  user: User
}

const BountyHunterDashboard: React.FC<BountyHunterDashboardProps> = ({ user }) => {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'referrers' | 'points'>('referrers')
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState<'x' | 'telegram' | null>(null)
  
  const {
    userStats,
    leaderboard,
    bountyTasks,
    loading,
    refreshData,
    beginTask,
    verifyTask
  } = useBountyData(user.id)

  const {
    showNotification,
    hasXAccount,
    triggerXAccountCheck,
    dismissNotification,
    refreshXAccountStatus
  } = useXAccountNotification(user)

  const { getConnectionByPlatform } = useSocialConnections(user.id)

  // Use the permanent referral link from the user object
  const referralLink = user.referral_link || `${window.location.origin}/ref/${user.referral_code || user.id}`

  useEffect(() => {
    refreshXAccountStatus()
  }, [])

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch (err) {
      console.error('Failed to copy referral link:', err)
    }
  }

  const handleTaskAction = async (taskId: string, platform?: 'x' | 'telegram') => {
    const task = bountyTasks.active.find(t => t.id === taskId)
    
    if (task?.requires_connection && platform) {
      // Check if user has the required social connection
      const connection = getConnectionByPlatform(platform)
      
      if (!connection) {
        // Show connection required modal
        setShowConnectionModal(platform)
        return
      }
    }

    // If task is not started, begin it
    if (task?.status === 'not_started') {
      await beginTask(taskId)
    } else if (task?.status === 'in_progress') {
      await verifyTask(taskId)
    }
  }

  const handleConnectSocial = (platform: 'x' | 'telegram') => {
    setShowConnectionModal(null)
    setShowProfileModal(true)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <Hash className="w-4 h-4 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 2:
        return 'text-gray-300 bg-gray-300/10 border-gray-300/30'
      case 3:
        return 'text-amber-600 bg-amber-600/10 border-amber-600/30'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  // Custom X (Twitter) SVG Component
  const XIcon = () => (
    <svg width="16" height="14" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.6526 0H41.3995L26.6594 16.847L44 39.7719H30.4225L19.7881 25.8681L7.61989 39.7719H0.868864L16.6349 21.7522L0 0H13.9222L23.5348 12.7087L34.6526 0ZM32.2846 35.7336H36.0232L11.8908 3.82626H7.87892L32.2846 35.7336Z" fill="currentColor"/>
    </svg>
  )

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 py-8" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52D593 0%, #4ade80 100%)' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Bounty Hunter</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Complete social media tasks, invite friends, and climb the leaderboard to earn exclusive rewards
            </p>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Left Column: Global Leaderboard */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="rounded-2xl border border-gray-700/50 overflow-hidden h-full" style={{ backgroundColor: '#171717' }}>
                {/* Header */}
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Global Leaderboard</h2>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: '#262626' }}>
                    <button
                      onClick={() => setActiveLeaderboardTab('referrers')}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeLeaderboardTab === 'referrers'
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      style={{ backgroundColor: activeLeaderboardTab === 'referrers' ? '#52D593' : 'transparent' }}
                    >
                      <Users className="w-4 h-4" />
                      <span>Referrers</span>
                    </button>
                    <button
                      onClick={() => setActiveLeaderboardTab('points')}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeLeaderboardTab === 'points'
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      style={{ backgroundColor: activeLeaderboardTab === 'points' ? '#52D593' : 'transparent' }}
                    >
                      <Star className="w-4 h-4" />
                      <span>Points</span>
                    </button>
                  </div>
                </div>

                {/* Leaderboard Content */}
                <div className="p-6 flex-1">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#52D593', borderTopColor: 'transparent' }}></div>
                      <p className="text-gray-400 text-sm">Loading leaderboard...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard[activeLeaderboardTab]?.slice(0, 10).map((entry, index) => (
                        <div
                          key={`${entry.username}-${entry.rank}`}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            entry.username === user.username
                              ? 'border-green-500/50 bg-green-500/5'
                              : 'border-gray-700/50 bg-gray-800/20 hover:border-gray-600/50'
                          }`}
                          style={{ 
                            borderColor: entry.username === user.username ? '#52D593' : undefined,
                            backgroundColor: entry.username === user.username ? 'rgba(82, 213, 147, 0.05)' : undefined
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Rank */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getRankColor(entry.rank)}`}>
                              {entry.rank <= 3 ? (
                                getRankIcon(entry.rank)
                              ) : (
                                <span className="text-xs font-bold">#{entry.rank}</span>
                              )}
                            </div>

                            {/* Username */}
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate text-sm ${
                                entry.username === user.username ? 'text-green-400' : 'text-white'
                              }`} style={{ color: entry.username === user.username ? '#52D593' : undefined }}>
                                {entry.username}
                                {entry.username === user.username && (
                                  <span className="ml-1 text-xs" style={{ color: '#52D593' }}>(You)</span>
                                )}
                              </p>
                            </div>

                            {/* Value */}
                            <div className="text-right">
                              <p className="font-bold text-white text-sm">
                                {activeLeaderboardTab === 'referrers' ? (entry as any).referrals : (entry as any).points?.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {activeLeaderboardTab === 'referrers' ? 'refs' : 'pts'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column: Refer & Earn */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="rounded-2xl border border-gray-700/50 p-6 sm:p-8 h-full" style={{ backgroundColor: '#171717' }}>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Refer & Earn</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Invite friends, complete tasks, and earn exclusive rewards. The top bounty hunters will earn more than just points.
                  </p>
                </div>

                {/* User Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-blue-500/30" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-400">Total Referrals</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{userStats?.totalReferrals || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-500/30" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400">Active Referrals</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{userStats?.bonusReferrals || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-green-500/30" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Total Points</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{userStats?.totalPoints?.toLocaleString() || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-yellow-500/30" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-400">Bonus Points</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{userStats?.bonusPoints?.toLocaleString() || 0}</p>
                  </div>

                  <div className="col-span-2 lg:col-span-2 p-4 rounded-xl border border-green-500/30" style={{ backgroundColor: '#262626', borderColor: '#52D593' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Crown className="w-5 h-5" style={{ color: '#52D593' }} />
                          <span className="text-sm text-gray-400">Global Rank</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#52D593' }}>#{userStats?.globalRank || 0}</p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52D593 0%, #4ade80 100%)' }}>
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Link Section */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-blue-500/30" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Your Referral Link</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                          Permanent
                        </span>
                      </div>
                      <button
                        onClick={handleCopyReferral}
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                      >
                        {copiedReferral ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span className="text-xs font-medium text-white">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-xs font-medium text-white">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 break-all bg-gray-800/50 p-2 rounded">
                      {referralLink}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      🔒 This link is permanently assigned to your account and cannot be changed
                    </p>
                  </div>

                  {/* Referrer Status */}
                  <div className="p-4 rounded-xl border border-gray-700/50" style={{ backgroundColor: '#262626' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">Referral Status</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {userStats?.referredBy ? (
                        <>Referred by: <span className="text-blue-400 font-medium">{userStats.referredBy}</span></>
                      ) : (
                        'Direct User'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Social Media Tasks */}
            <div className="lg:col-span-1 order-3">
              <div className="rounded-2xl border border-gray-700/50 overflow-hidden h-full" style={{ backgroundColor: '#171717' }}>
                {/* Header */}
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5" style={{ color: '#52D593' }} />
                    <h2 className="text-xl font-bold text-white">Social Media Tasks</h2>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Complete tasks to earn bonus points</p>
                </div>

                {/* Tasks Content */}
                <div className="p-6 flex-1">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#52D593', borderTopColor: 'transparent' }}></div>
                      <p className="text-gray-400 text-sm">Loading tasks...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Tasks */}
                      {bountyTasks?.active?.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-xl border border-gray-700/50 bg-gray-800/20 hover:border-gray-600/50 transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(82, 213, 147, 0.2)' }}>
                              {task.platform === 'x' ? (
                                <XIcon />
                              ) : task.platform === 'telegram' ? (
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Target className="w-4 h-4" style={{ color: '#52D593' }} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white text-sm mb-1">{task.title}</h3>
                              <p className="text-xs text-gray-400 mb-3">{task.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span className="text-xs font-semibold text-yellow-400">+{task.points}</span>
                                </div>
                                
                                <button
                                  onClick={() => handleTaskAction(task.id, task.platform)}
                                  disabled={task.status === 'verifying'}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                    task.status === 'not_started'
                                      ? 'text-white hover:opacity-90'
                                      : task.status === 'in_progress'
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                  }`}
                                  style={{ 
                                    backgroundColor: task.status === 'not_started' ? '#52D593' : undefined 
                                  }}
                                >
                                  {task.status === 'not_started' && 'Begin'}
                                  {task.status === 'in_progress' && 'Verify'}
                                  {task.status === 'verifying' && (
                                    <div className="flex items-center space-x-1">
                                      <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                                      <span>Checking...</span>
                                    </div>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Completed Tasks */}
                      {bountyTasks?.completed && bountyTasks.completed.length > 0 && (
                        <>
                          <div className="pt-4 border-t border-gray-700/50">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Completed Tasks</h3>
                          </div>
                          
                          {bountyTasks.completed.map((task) => (
                            <div
                              key={task.id}
                              className="p-4 rounded-xl border border-green-500/30 bg-green-500/5"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-green-400 text-sm mb-1">{task.title}</h3>
                                  <p className="text-xs text-gray-400 mb-2">{task.description}</p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-3 h-3 text-yellow-400" />
                                      <span className="text-xs font-semibold text-yellow-400">+{task.points}</span>
                                    </div>
                                    
                                    <span className="text-xs text-green-400 font-medium">✓ Completed</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Empty State */}
                      {(!bountyTasks?.active || bountyTasks.active.length === 0) && 
                       (!bountyTasks?.completed || bountyTasks.completed.length === 0) && (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-sm">No social media tasks available</p>
                          <p className="text-gray-500 text-xs mt-1">Check back later for new opportunities!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Cash & NFT Rewards */}
            <div className="order-1">
              <CashNFTRewards />
            </div>

            {/* Name Tag Rewards */}
            <div className="order-2">
              <NameTagRewards />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <ProfileSettingsModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Social Connection Required Modal */}
      {showConnectionModal && (
        <SocialConnectionRequiredModal
          user={user}
          platform={showConnectionModal}
          onClose={() => setShowConnectionModal(null)}
          onConnect={() => handleConnectSocial(showConnectionModal!)}
        />
      )}
    </>
  )
}

export default BountyHunterDashboard