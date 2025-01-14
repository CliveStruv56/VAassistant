'use client'

import * as React from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface NewTaskFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function NewTaskForm({ onClose, onSuccess }: NewTaskFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [clients, setClients] = React.useState<any[]>([])

  React.useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('clients')
        .select('id, name, company')
        .eq('user_id', user?.id)
        .eq('status', 'active')
      
      setClients(data || [])
    }
    loadClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([{
          user_id: user?.id,
          title: formData.get('title'),
          description: formData.get('description'),
          priority: formData.get('priority'),
          due_date: formData.get('dueDate'),
          client_id: formData.get('clientId'),
          status: 'pending'
        }])

      if (insertError) throw insertError

      toast.success('Task created successfully')
      onSuccess()
    } catch (error) {
      setError('Failed to create task')
      toast.error('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">Create New Task</h2>
        
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client</label>
            <select name="clientId" required className="input w-full">
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" required className="input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows={3} className="input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select name="priority" className="input w-full">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" name="dueDate" required className="input w-full" />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  )
} 