import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase, User, processReferralFromLink, trackReferralClick } from '../lib/supabase'
import { generateUsername } from '../utils/username'
import { useReferralPersistence } from './useReferralPersistence'

export const useUser = () => {
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getPendingReferral, clearPendingReferral } = useReferralPersistence()

  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnection()
    } else {
      // Clear user state when wallet disconnects
      setUser(null)
      setLoading(false)
      setError(null)
    }
  }, [isConnected, address])

  const handleWalletConnection = async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching user:', fetchError)
        throw fetchError
      }

      if (existingUser) {
        console.log('Existing user found:', existingUser)
        setUser(existingUser)
      } else {
        console.log('Creating new user for address:', address)
        
        // Create new user with automatic referral link generation
        const username = generateUsername()
        const newUser: Omit<User, 'id' | 'referral_code' | 'referral_link'> = {
          wallet_address: address.toLowerCase(),
          username,
          connection_timestamp: new Date().toISOString(),
          current_points: 0,
          current_rank: 0
        }

        try {
          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single()

          if (createError) {
            // Check if this is a unique constraint violation (race condition)
            if (createError.code === '23505') {
              console.log('User was created by another process, fetching existing user')
              
              // Another process created the user, fetch it
              const { data: concurrentUser, error: refetchError } = await supabase
                .from('users')
                .select('*')
                .eq('wallet_address', address.toLowerCase())
                .maybeSingle()

              if (refetchError) {
                console.error('Error refetching user after race condition:', refetchError)
                throw refetchError
              }

              if (concurrentUser) {
                console.log('Found user created by concurrent process:', concurrentUser)
                setUser(concurrentUser)
                
                // Process referral for the existing user
                await processReferralIfPending(concurrentUser.id)
                return
              } else {
                console.error('User not found after race condition')
                throw new Error('User creation failed due to race condition')
              }
            } else {
              console.error('Error creating user:', createError)
              throw createError
            }
          } else {
            console.log('New user created:', createdUser)
            
            // Process any pending referral
            await processReferralIfPending(createdUser.id)
            
            setUser(createdUser)
          }
        } catch (insertError) {
          console.error('Unexpected error during user creation:', insertError)
          throw insertError
        }
      }
    } catch (err) {
      console.error('Error handling wallet connection:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect user')
    } finally {
      setLoading(false)
    }
  }

  const processReferralIfPending = async (userId: string) => {
    const pendingReferral = getPendingReferral()
    if (pendingReferral) {
      try {
        console.log('Processing pending referral:', pendingReferral)
        
        // Track the referral click conversion
        const userAgent = navigator.userAgent
        await trackReferralClick(
          pendingReferral.startsWith('http') 
            ? pendingReferral 
            : `${window.location.origin}/ref/${pendingReferral}`,
          undefined, // IP address will be handled server-side
          userAgent
        )
        
        // Process the referral
        if (pendingReferral.startsWith('http')) {
          // It's a full referral link
          await processReferralFromLink(pendingReferral, userId)
        } else {
          // It's a referral code, convert to link format
          const referralLink = `${window.location.origin}/ref/${pendingReferral}`
          await processReferralFromLink(referralLink, userId)
        }
        
        // Clear the pending referral
        clearPendingReferral()
        
        console.log('Referral processed successfully')
      } catch (refError) {
        console.warn('Failed to process referral:', refError)
        // Don't fail user creation if referral processing fails
      }
    }
  }

  // Force refresh user data
  const refreshUser = async () => {
    if (!address) return
    await handleWalletConnection()
  }

  return {
    user,
    loading,
    error,
    isConnected: isConnected && !!user,
    refreshUser
  }
}