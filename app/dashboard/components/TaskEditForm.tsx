'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  client_id: string
  estimated_hours: number | null
  estimated_minutes: number | null
}

interface TaskEditFormProps {
  task: Task
  onClose: () => void
  onSuccess: () => void
}

export function TaskEditForm({ task, onClose, onSuccess }: TaskEditFormProps) {
  const [formData, setFormData] = useState(task)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('tasks')
        .update(formData)
        .eq('id', task.id)

      if (error) throw error
      toast.success('Task updated successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">Edit Task</h2>
        {/* Add form fields similar to NewTaskForm */}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Update Task</button>
        </div>
      </form>
    </div>
  )
} 