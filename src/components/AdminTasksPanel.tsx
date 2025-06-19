import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Target,
  MessageCircle,
  Star,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { 
  AdminTask, 
  CreateTaskData, 
  UpdateTaskData,
  getAllAdminTasks,
  createAdminTask,
  updateAdminTask,
  deleteAdminTask,
  toggleTaskStatus
} from '../lib/adminTasks'

const AdminTasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null)
  const [filter, setFilter] = useState<'all' | 'x' | 'telegram' | 'general'>('all')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllAdminTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      await createAdminTask(taskData)
      await loadTasks()
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleUpdateTask = async (taskId: string, updates: UpdateTaskData) => {
    try {
      await updateAdminTask(taskId, updates)
      await loadTasks()
      setEditingTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteAdminTask(taskId)
      await loadTasks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleToggleStatus = async (taskId: string, isActive: boolean) => {
    try {
      await toggleTaskStatus(taskId, isActive)
      await loadTasks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task status')
    }
  }

  const filteredTasks = tasks.filter(task => 
    filter === 'all' || task.platform === filter
  )

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return (
          <svg width="16" height="14" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34.6526 0H41.3995L26.6594 16.847L44 39.7719H30.4225L19.7881 25.8681L7.61989 39.7719H0.868864L16.6349 21.7522L0 0H13.9222L23.5348 12.7087L34.6526 0ZM32.2846 35.7336H36.0232L11.8908 3.82626H7.87892L32.2846 35.7336Z" fill="currentColor"/>
          </svg>
        )
      case 'telegram':
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'x':
        return 'text-gray-300 bg-gray-500/20 border-gray-500/30'
      case 'telegram':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      default:
        return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ backgroundColor: '#1A1A1A' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52D593 0%, #4ade80 100%)' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Tasks Panel</h1>
                <p className="text-gray-400">Manage social media tasks and rewards</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#52D593' }}
            >
              <Plus className="w-4 h-4 text-black" />
              <span className="font-medium text-black">Add Task</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {['all', 'x', 'telegram', 'general'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === filterOption
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                style={{ 
                  backgroundColor: filter === filterOption ? '#52D593' : '#262626',
                  color: filter === filterOption ? 'black' : undefined
                }}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 rounded hover:bg-red-500/20"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div className="rounded-2xl border border-gray-700/50 overflow-hidden" style={{ backgroundColor: '#171717' }}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#52D593', borderTopColor: 'transparent' }}></div>
              <p className="text-gray-400">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tasks found</p>
              <p className="text-gray-500 text-sm mt-1">Create your first task to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                  getPlatformIcon={getPlatformIcon}
                  getPlatformColor={getPlatformColor}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <TaskFormModal
            title="Create New Task"
            onSubmit={handleCreateTask}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskFormModal
            title="Edit Task"
            task={editingTask}
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </div>
  )
}

interface TaskRowProps {
  task: AdminTask
  onEdit: (task: AdminTask) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string, isActive: boolean) => void
  getPlatformIcon: (platform: string) => React.ReactNode
  getPlatformColor: (platform: string) => string
}

const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  getPlatformIcon, 
  getPlatformColor 
}) => {
  return (
    <div className={`p-6 transition-all duration-200 ${task.is_active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Platform Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getPlatformColor(task.platform)}`}>
            {getPlatformIcon(task.platform)}
          </div>

          {/* Task Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{task.title}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">{task.points}</span>
              </div>
              {!task.is_active && (
                <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Inactive
                </span>
              )}
            </div>
            
            <p className="text-gray-400 mb-3">{task.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Platform: {task.platform}</span>
              <span>Type: {task.verification_type}</span>
              {task.requires_connection && (
                <span className="text-blue-400">Requires Connection</span>
              )}
              {task.action_url && (
                <a
                  href={task.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Action URL</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(task.id, !task.is_active)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              task.is_active 
                ? 'hover:bg-yellow-500/20 text-yellow-400' 
                : 'hover:bg-green-500/20 text-green-400'
            }`}
            title={task.is_active ? 'Deactivate task' : 'Activate task'}
          >
            {task.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors duration-200"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors duration-200"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface TaskFormModalProps {
  title: string
  task?: AdminTask
  onSubmit: (data: CreateTaskData | UpdateTaskData) => void
  onClose: () => void
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ title, task, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    platform: task?.platform || 'general' as 'x' | 'telegram' | 'general',
    points: task?.points || 0,
    action_url: task?.action_url || '',
    verification_type: task?.verification_type || 'manual' as 'manual' | 'api' | 'social',
    requires_connection: task?.requires_connection || false,
    is_active: task?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-700/50" style={{ backgroundColor: '#171717' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter task description"
              rows={3}
              required
            />
          </div>

          {/* Platform and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white focus:border-blue-500/50 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="x">X (Twitter)</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Points Reward
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Action URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action URL (Optional)
            </label>
            <input
              type="url"
              value={formData.action_url}
              onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          {/* Verification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verification Type
            </label>
            <select
              value={formData.verification_type}
              onChange={(e) => setFormData({ ...formData, verification_type: e.target.value as any })}
              className="w-full px-4 py-3 rounded-lg border border-gray-700/50 bg-gray-800/50 text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="manual">Manual</option>
              <option value="api">API</option>
              <option value="social">Social</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.requires_connection}
                onChange={(e) => setFormData({ ...formData, requires_connection: e.target.checked })}
                className="w-4 h-4 rounded border-gray-700/50 bg-gray-800/50 text-blue-600 focus:ring-blue-500/50"
              />
              <span className="text-sm text-gray-300">Requires social media connection</span>
            </label>

            {task && (
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700/50 bg-gray-800/50 text-blue-600 focus:ring-blue-500/50"
                />
                <span className="text-sm text-gray-300">Task is active</span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#52D593' }}
            >
              <Save className="w-4 h-4 text-black" />
              <span className="font-medium text-black">{task ? 'Update' : 'Create'} Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminTasksPanel