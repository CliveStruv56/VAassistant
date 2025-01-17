'use client'

import * as React from 'react'
import { supabase } from '../../../lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NewTaskForm } from '@/components/tasks/NewTaskForm'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  created_at: string
  user_id: string
  client_id: string
  estimated_hours: number | null
  estimated_minutes: number | null
  project_id?: string
  project?: {
    name: string
    status: string
  }
}

type TaskStatus = 'pending' | 'in_progress' | 'completed'

function getNextStatus(currentStatus: TaskStatus): TaskStatus {
  switch (currentStatus) {
    case 'pending':
      return 'in_progress'
    case 'in_progress':
      return 'completed'
    case 'completed':
      return 'pending'
    default:
      return 'pending'
  }
}

function getNextPriority(currentPriority: string): string {
  switch (currentPriority) {
    case 'low':
      return 'medium'
    case 'medium':
      return 'high'
    case 'high':
      return 'low'
    default:
      return 'low'
  }
}

function isOverdue(dueDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDueDate = new Date(dueDate)
  taskDueDate.setHours(0, 0, 0, 0)
  return taskDueDate < today && today.getTime() !== taskDueDate.getTime()
}

export function TaskList() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [clients, setClients] = React.useState<any[]>([])
  const [filter, setFilter] = React.useState({
    status: 'all',
    priority: 'all',
    client: 'all',
    search: '',
    project: 'all'
  })
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null)

  async function fetchTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects (
            name,
            status
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching tasks')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First check if task has time entries
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('id')
        .eq('task_id', taskId)
        .limit(1)

      if (timeEntries?.length) {
        // If task has time entries, update status to deleted
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'deleted' })
          .eq('id', taskId)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // If no time entries, perform hard delete
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError
      }

      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully')

    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete task')
      // Refresh the task list to ensure UI is in sync with database
      fetchTasks()
    }
  }

  async function handleStatusChange(taskId: string, currentStatus: TaskStatus) {
    const newStatus = getNextStatus(currentStatus)
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      return
    }

    fetchTasks()
  }

  async function handlePriorityChange(taskId: string, currentPriority: string) {
    const newPriority = getNextPriority(currentPriority)
    
    const { error } = await supabase
      .from('tasks')
      .update({ priority: newPriority })
      .eq('id', taskId)

    if (error) {
      setError(error.message)
      return
    }

    fetchTasks()
  }

  React.useEffect(() => {
    fetchTasks()
  }, [])

  React.useEffect(() => {
    async function loadClients() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await supabase
          .from('clients')
          .select('id, name, company')
          .eq('user_id', user?.id)
          .eq('status', 'active')
        
        setClients(data || [])
      } catch (error) {
        console.error('Error loading clients:', error)
      }
    }
    loadClients()
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-24 rounded-lg"/>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No tasks yet. Create your first task!</p>
      </div>
    )
  }

  const filteredTasks = tasks.filter(task => {
    if (filter.status !== 'all' && task.status !== filter.status) return false
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false
    if (filter.client !== 'all' && task.client_id !== filter.client) return false
    if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    if (filter.status === 'overdue') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      return task.status !== 'completed' && today > dueDate
    }
    if (filter.project !== 'all' && task.project_id !== filter.project) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.client}
            onChange={(e) => setFilter(f => ({ ...f, client: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.company}
              </option>
            ))}
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filter.project}
            onChange={(e) => setFilter(f => ({ ...f, project: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All Projects</option>
            {Array.from(new Set(tasks.map(t => t.project?.name))).map(projectName => (
              projectName && (
                <option key={projectName} value={projectName}>
                  {projectName}
                </option>
              )
            ))}
          </select>

          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.search}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium">{task.title}</h3>
              <button
                onClick={() => handlePriorityChange(task.id, task.priority)}
                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </button>
              <button
                onClick={() => handleStatusChange(task.id, task.status as TaskStatus)}
                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : task.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {task.status.replace('_', ' ')}
              </button>

              {task.due_date && isOverdue(task.due_date) && task.status !== 'completed' && (
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setSelectedTaskId(task.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="mt-2 text-gray-600">{task.description}</p>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          </div>

          {task.project && (
            <span className="text-sm text-gray-500">
              Project: {task.project.name}
            </span>
          )}
        </div>
      ))}

      <Dialog open={!!selectedTaskId} onOpenChange={() => setSelectedTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          {selectedTaskId && (
            <NewTaskForm 
              taskId={selectedTaskId}
              isEditing={true}
              onSuccess={() => {
                setSelectedTaskId(null)
                fetchTasks()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 