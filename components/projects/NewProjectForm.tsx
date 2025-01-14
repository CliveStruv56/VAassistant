'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { CreateProjectInput, ProjectStatus } from '@/app/types/project'

interface NewProjectFormProps {
  clientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewProjectForm({ clientId, onSuccess, onCancel }: NewProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: '',
    description: '',
    status: 'active',
    client_id: clientId,
    start_date: '',
    end_date: '',
    budget: undefined,
    is_billable: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('projects').insert([{
        ...formData,
        user_id: user.id
      }])

      if (error) throw error
      toast.success('Project created successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
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
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Budget
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.budget || ''}
              onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              className="mt-1 w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_billable"
            checked={formData.is_billable}
            onChange={e => setFormData({ ...formData, is_billable: e.target.checked })}
            className="h-4 w-4 text-mint border-mint-light focus:ring-mint"
          />
          <label htmlFor="is_billable" className="text-sm font-medium text-gray-700">
            This is a billable project
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-mint-light">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-orange transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-orange hover:bg-orange-dark text-white 
                   font-medium rounded-md shadow-sm transition-colors"
        >
          Create Project
        </button>
      </div>
    </form>
  )
} 