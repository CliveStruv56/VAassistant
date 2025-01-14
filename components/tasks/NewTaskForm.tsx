'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Client } from '@/app/types/pricing'

interface NewTaskFormProps {
  onSuccess?: () => void
  initialClientId?: string
  taskId?: string
  isEditing?: boolean
  initialProjectId?: string
}

interface ClientDropdown {
  id: string
  name: string
  company: string
}

export function NewTaskForm({ onSuccess, initialClientId, taskId, isEditing, initialProjectId }: NewTaskFormProps) {
  const [clients, setClients] = useState<ClientDropdown[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState(initialClientId || '')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    client_id: initialClientId || '',
    total_time: 0,
    notes: [],
    priority: 'medium',
    due_date: '',
    estimated_hours: 0,
    estimated_minutes: 0,
    project_id: initialProjectId || '',
  })
  const [clientDetails, setClientDetails] = useState<Client | null>(null)

  // Fetch existing task data if editing
  useEffect(() => {
    async function fetchTask() {
      if (!taskId) return
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single()

        if (error) throw error
        if (data) {
          setFormData(data)
        }
      } catch (error) {
        console.error('Error fetching task:', error)
        toast.error('Failed to load task data')
      }
    }

    if (isEditing && taskId) {
      fetchTask()
    }
  }, [taskId, isEditing])

  // Fetch clients for dropdown
  useEffect(() => {
    async function fetchClients() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, company')
          .eq('user_id', user?.id)
          .order('name')

        if (error) throw error
        setClients(data || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast.error('Failed to load clients')
      }
    }

    fetchClients()
  }, [])

  // Add this effect to load projects when client is selected
  useEffect(() => {
    async function loadProjects() {
      if (!selectedClient) {
        setProjects([])
        return
      }

      try {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', selectedClient)
          .eq('status', 'active')
          .order('name')

        setProjects(data || [])
      } catch (error) {
        console.error('Error loading projects:', error)
        toast.error('Failed to load projects')
      }
    }

    loadProjects()
  }, [selectedClient])

  const handleClientSelect = async (clientId: string) => {
    setFormData(prev => ({ ...prev, client_id: clientId }))
    setSelectedClient(clientId)
    
    if (clientId) {
      try {
        // Fetch client details to check if projects are enabled
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single()
        
        if (error) throw error
        setClientDetails(client)
        
        // If client has projects enabled, fetch their projects
        if (client.project_enabled) {
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', clientId)
            .eq('status', 'active')
            .order('name')
          
          if (projectsError) throw projectsError
          setProjects(projects || [])
        }
      } catch (error) {
        console.error('Error fetching client details:', error)
        toast.error('Failed to load client details')
      }
    } else {
      setClientDetails(null)
      setProjects([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isEditing && taskId) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date,
            client_id: formData.client_id,
            estimated_hours: formData.estimated_hours,
            estimated_minutes: formData.estimated_minutes
          })
          .eq('id', taskId)

        if (error) throw error
        toast.success('Task updated successfully')
      } else {
        // Create new task
        const { error } = await supabase.from('tasks').insert([{
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date || null,
          client_id: formData.client_id,
          project_id: formData.project_id,
          estimated_hours: Number(formData.estimated_hours) || 0,
          estimated_minutes: Number(formData.estimated_minutes) || 0,
          total_time: 0,
          user_id: user.id,
          created_at: new Date().toISOString().replace('T', ' ').replace('Z', ''),
          notes: '[]'
        }])

        if (error) throw error
        toast.success('Task added successfully')
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 required">
          Client *
        </label>
        <select
          value={formData.client_id}
          onChange={(e) => handleClientSelect(e.target.value)}
          className="mt-1 w-full p-2 border rounded-md"
          required
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.company})
            </option>
          ))}
        </select>
      </div>

      {clientDetails?.project_enabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project {clientDetails.project_enabled && '*'}
          </label>
          <select
            value={formData.project_id}
            onChange={e => setFormData({ ...formData, project_id: e.target.value })}
            className="mt-1 w-full p-2 border rounded-md"
            required={clientDetails.project_enabled}
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {clientDetails.project_enabled && projects.length === 0 && (
            <p className="mt-1 text-sm text-orange">
              No active projects found. Please create a project first.
            </p>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header min-h-[100px]"
            placeholder="Enter task description"
          />
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={Number(formData.estimated_hours) || 0}
            onChange={e => {
              const value = e.target.value.replace(/^0+/, '')
              setFormData({ 
                ...formData, 
                estimated_hours: parseInt(value) || 0 
              })
            }}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Minutes
          </label>
          <input
            type="number"
            min="0"
            max="59"
            step="1"
            value={formData.estimated_minutes || 0}
            onChange={e => setFormData({ 
              ...formData, 
              estimated_minutes: parseInt(e.target.value) || 0 
            })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-mint hover:bg-mint-dark text-white font-medium 
                   py-3 px-4 rounded-md transition-colors"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
} 