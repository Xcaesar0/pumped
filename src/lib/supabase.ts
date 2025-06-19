import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here' ||
    supabaseUrl.includes('your_supabase_url_here') ||
    supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  throw new Error(`
    Missing or invalid Supabase environment variables. 
    
    Please set up your Supabase connection by:
    1. Creating a .env file from .env.example
    2. Replacing the placeholder values with your actual Supabase credentials:
       - VITE_SUPABASE_URL=your_actual_supabase_url
       - VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
    3. You can find these values in your Supabase project settings under 'API'
    4. Restart your development server after updating the .env file
    
    Current values:
    - VITE_SUPABASE_URL: ${supabaseUrl || 'undefined'}
    - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '[SET]' : 'undefined'}
  `)
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`
    Invalid Supabase URL format: ${supabaseUrl}
    
    Please ensure your VITE_SUPABASE_URL is a valid URL (e.g., https://your-project.supabase.co)
  `)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  wallet_address: string
  username: string
  connection_timestamp: string
  current_points: number
  current_rank: number
  referral_code?: string
  referral_link?: string
  x_connected_at?: string
}

export interface Task {
  id: string
  user_id: string
  task_type: 'invite_1' | 'invite_5' | 'invite_10' | 'invite_50' | 'invite_100'
  task_target: number
  current_progress: number
  completed: boolean
  completed_at?: string
  points_earned: number
  created_at: string
}

export interface LeaderboardEntry {
  username: string
  points: number
  referrals?: number
  rank: number
}

export interface SocialConnection {
  id: string
  user_id: string
  platform: 'telegram' | 'x'
  platform_user_id: string
  platform_username: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  connected_at: string
  is_active: boolean
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  referral_link?: string
  created_at: string
  points_awarded: number
  status: 'pending' | 'completed' | 'cancelled' | 'active' | 'expired' | 'invalid'
  activated_at?: string
  expires_at?: string
}

export interface ReferralClick {
  id: string
  referral_link: string
  referrer_id?: string
  ip_address?: string
  user_agent?: string
  clicked_at: string
  converted: boolean
  converted_user_id?: string
}

// Social media integration functions
export const getSocialConnections = async (userId: string): Promise<SocialConnection[]> => {
  const { data, error } = await supabase
    .from('social_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw error
  return data || []
}

export const createSocialConnection = async (connection: Omit<SocialConnection, 'id' | 'connected_at'>): Promise<SocialConnection> => {
  const { data, error } = await supabase
    .from('social_connections')
    .upsert([{
      ...connection,
      connected_at: new Date().toISOString()
    }], {
      onConflict: 'user_id,platform'
    })
    .select()
    .single()

  if (error) throw error

  // Update user's X connection timestamp if this is an X connection
  if (connection.platform === 'x') {
    await supabase
      .from('users')
      .update({ x_connected_at: new Date().toISOString() })
      .eq('id', connection.user_id)
  }

  return data
}

export const updateSocialConnection = async (id: string, updates: Partial<SocialConnection>): Promise<SocialConnection> => {
  const { data, error } = await supabase
    .from('social_connections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSocialConnection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('social_connections')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

// User functions
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getUserByReferralLink = async (referralLink: string): Promise<User | null> => {
  console.log('Searching for user with referral link:', referralLink)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('referral_link', referralLink)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error finding user by referral link:', error)
    throw error
  }
  
  console.log('Found user by referral link:', data?.username || 'none')
  return data
}

export const getUserByReferralCode = async (referralCode: string): Promise<User | null> => {
  console.log('Searching for user with referral code:', referralCode)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('referral_code', referralCode)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error finding user by referral code:', error)
    throw error
  }
  
  console.log('Found user by referral code:', data?.username || 'none')
  return data
}

// Referral system functions
export const createReferral = async (referrerId: string, referredId: string, referralCode: string): Promise<Referral> => {
  const { data, error } = await supabase
    .from('referrals')
    .insert([{
      referrer_id: referrerId,
      referred_id: referredId,
      referral_code: referralCode,
      points_awarded: 10,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getReferralByUserId = async (userId: string): Promise<Referral | null> => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*, referrer:users!referrer_id(username)')
    .eq('referred_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export const processReferralFromLink = async (referralLink: string, newUserId: string): Promise<void> => {
  const { error } = await supabase.rpc('process_referral_from_link', {
    referral_link_param: referralLink,
    new_user_id_param: newUserId
  })

  if (error) throw error
}

// Referral tracking functions
export const trackReferralClick = async (referralLink: string, ipAddress?: string, userAgent?: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('track_referral_click', {
    referral_link_param: referralLink,
    ip_address_param: ipAddress,
    user_agent_param: userAgent
  })

  if (error) throw error
  return data
}

// Leaderboard functions
export const getLeaderboard = async (limit: number = 100): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('username, current_points')
    .order('current_points', { ascending: false })
    .limit(limit)

  if (error) throw error
  
  return (data || []).map((user, index) => ({
    username: user.username,
    points: user.current_points,
    rank: index + 1
  }))
}

export const getReferralLeaderboard = async (limit: number = 100): Promise<LeaderboardEntry[]> => {
  try {
    // Try to use the RPC function first
    const { data, error } = await supabase.rpc('get_top_referrers', {
      limit_count: limit
    })

    if (error) {
      console.warn('RPC get_top_referrers not available, using fallback')
      
      // Fallback: manually calculate referral counts
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, current_points')
        .order('current_points', { ascending: false })
        .limit(limit)

      const referrersWithCounts = await Promise.all(
        (usersData || []).map(async (user, index) => {
          const { count } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', user.id)
            .eq('status', 'active')

          return {
            username: user.username,
            points: user.current_points,
            referrals: count || 0,
            rank: index + 1
          }
        })
      )

      return referrersWithCounts.sort((a, b) => b.referrals - a.referrals)
    }

    return data || []
  } catch (error) {
    console.error('Error loading referral leaderboard:', error)
    return []
  }
}

export const getUserRank = async (userId: string): Promise<number> => {
  const { data: user } = await supabase
    .from('users')
    .select('current_points')
    .eq('id', userId)
    .single()

  if (!user) return 0

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('current_points', user.current_points)

  return (count || 0) + 1
}

// Check if user has X account connected
export const userHasXConnected = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_x_connected', {
    user_id_param: userId
  })

  if (error) {
    // Fallback check
    const { data: connection } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', 'x')
      .eq('is_active', true)
      .maybeSingle()

    return !!connection
  }
  
  return data || false
}

export const generateReferralCode = (userId: string): string => {
  // Generate a unique referral code based on user ID
  const timestamp = Date.now().toString(36)
  const userHash = userId.slice(-8)
  return `${userHash}${timestamp}`.toUpperCase()
}