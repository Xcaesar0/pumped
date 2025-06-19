import { SocialConnection } from '../lib/supabase'
import { encryptToken } from '../utils/encryption'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

export interface TelegramAuthResult {
  id: number
  username: string
  first_name: string
  last_name?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Telegram Login Widget Integration
export const initiateTelegramAuth = (): Promise<TelegramAuthResult> => {
  return new Promise((resolve, reject) => {
    if (!TELEGRAM_BOT_USERNAME) {
      reject(new Error('Telegram bot username not configured'))
      return
    }

    // Create Telegram Login Widget
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-request-access', 'write')
    
    // Set up callback
    ;(window as any).onTelegramAuth = (user: TelegramAuthResult) => {
      if (verifyTelegramAuth(user)) {
        resolve(user)
      } else {
        reject(new Error('Telegram authentication verification failed'))
      }
    }
    
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    
    // Add to DOM
    document.body.appendChild(script)
    
    // Clean up after timeout
    setTimeout(() => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
        reject(new Error('Telegram authentication timeout'))
      }
    }, 30000) // 30 second timeout
  })
}

export const verifyTelegramAuth = (authData: TelegramAuthResult): boolean => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured, skipping verification')
    return true // In development, skip verification
  }

  // Verify the authentication data
  const { hash, ...data } = authData
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${(data as any)[key]}`)
    .join('\n')

  const secretKey = require('crypto').createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest()
  const calculatedHash = require('crypto').createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  return calculatedHash === hash
}

// Create social connection from auth results
export const createSocialConnectionFromTelegram = (
  userId: string, 
  authResult: TelegramAuthResult
): Omit<SocialConnection, 'id' | 'connected_at'> => {
  return {
    user_id: userId,
    platform: 'telegram',
    platform_user_id: authResult.id.toString(),
    platform_username: authResult.username,
    is_active: true
  }
}