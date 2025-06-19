import { useState, useEffect } from 'react'
import { User } from '../lib/supabase'

export const useXAccountNotification = (user: User | null) => {
  const [showNotification, setShowNotification] = useState(false)
  const [hasXAccount, setHasXAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkXAccountStatus()
    } else {
      setShowNotification(false)
      setHasXAccount(false)
    }
  }, [user])

  const checkXAccountStatus = async () => {
    if (!user) return

    setLoading(true)
    try {
      // MOCKUP: Check if user has any X connection (even if it's a mock one)
      // This will check the social_connections table for X platform
      const hasConnection = user.x_connected_at !== null
      setHasXAccount(hasConnection)
    } catch (error) {
      console.error('Failed to check X account status:', error)
      setHasXAccount(false)
    } finally {
      setLoading(false)
    }
  }

  const triggerXAccountCheck = async () => {
    if (!user || hasXAccount) return
    // MOCKUP: Show notification for X account connection
    setShowNotification(true)
  }

  const dismissNotification = () => {
    setShowNotification(false)
  }

  const refreshXAccountStatus = async () => {
    await checkXAccountStatus()
  }

  return {
    showNotification,
    hasXAccount,
    loading,
    triggerXAccountCheck,
    dismissNotification,
    refreshXAccountStatus
  }
}