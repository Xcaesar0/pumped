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
      // Mock - always return false for now
      setHasXAccount(false)
    } catch (error) {
      console.error('Failed to check X account status:', error)
      setHasXAccount(false)
    } finally {
      setLoading(false)
    }
  }

  const triggerXAccountCheck = async () => {
    if (!user || hasXAccount) return
    // Mock function - no actual functionality
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