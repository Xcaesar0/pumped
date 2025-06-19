import { supabase } from './supabase'

export interface AdminTask {
  id: string
  title: string
  description: string
  platform: 'x' | 'telegram' | 'general'
  points: number
  action_url?: string
  verification_type: 'manual' | 'api' | 'social'
  requires_connection: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

export interface CreateTaskData {
  title: string
  description: string
  platform: 'x' | 'telegram' | 'general'
  points: number
  action_url?: string
  verification_type?: 'manual' | 'api' | 'social'
  requires_connection?: boolean
  created_by?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  platform?: 'x' | 'telegram' | 'general'
  points?: number
  action_url?: string
  verification_type?: 'manual' | 'api' | 'social'
  requires_connection?: boolean
  is_active?: boolean
}

// Get all tasks (including inactive ones for admin)
export const getAllAdminTasks = async (): Promise<AdminTask[]> => {
  const { data, error } = await supabase
    .from('admin_tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get active tasks only
export const getActiveTasks = async (platform?: string): Promise<AdminTask[]> => {
  const { data, error } = await supabase.rpc('get_active_tasks_by_platform', {
    platform_filter: platform || null
  })

  if (error) throw error
  return data || []
}

// Create a new task
export const createAdminTask = async (taskData: CreateTaskData): Promise<string> => {
  const { data, error } = await supabase.rpc('create_admin_task', {
    task_title: taskData.title,
    task_description: taskData.description,
    task_platform: taskData.platform,
    task_points: taskData.points,
    task_action_url: taskData.action_url || null,
    task_verification_type: taskData.verification_type || 'manual',
    task_requires_connection: taskData.requires_connection || false,
    task_created_by: taskData.created_by || 'admin'
  })

  if (error) throw error
  return data
}

// Update an existing task
export const updateAdminTask = async (taskId: string, updates: UpdateTaskData): Promise<boolean> => {
  const { data, error } = await supabase.rpc('update_admin_task', {
    task_id: taskId,
    task_title: updates.title || null,
    task_description: updates.description || null,
    task_platform: updates.platform || null,
    task_points: updates.points || null,
    task_action_url: updates.action_url || null,
    task_verification_type: updates.verification_type || null,
    task_requires_connection: updates.requires_connection ?? null,
    task_is_active: updates.is_active ?? null
  })

  if (error) throw error
  return data
}

// Soft delete a task (set is_active to false)
export const deleteAdminTask = async (taskId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('delete_admin_task', {
    task_id: taskId
  })

  if (error) throw error
  return data
}

// Permanently delete a task
export const permanentlyDeleteAdminTask = async (taskId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('permanently_delete_admin_task', {
    task_id: taskId
  })

  if (error) throw error
  return data
}

// Toggle task active status
export const toggleTaskStatus = async (taskId: string, isActive: boolean): Promise<boolean> => {
  return updateAdminTask(taskId, { is_active: isActive })
}