'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/app/types/pricing'
import { useTimerStore } from '@/lib/stores/timerStore'
import { cn } from '@/lib/utils'
import { Timer } from './Timer/Timer'
import { toast } from 'react-hot-toast'

interface ValidationErrors {
  client?: string
  task?: string
  description?: string
}

export function TimeTracker() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [description, setDescription] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const { runningTimer } = useTimerStore()
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const isValid = selectedClient && description.trim().length >= 3

  const handleTimerComplete = async (seconds: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('time_entries').insert([{
        user_id: user.id,
        client_id: selectedClient,
        task_id: selectedTask || null,
        description: description.trim(),
        duration: seconds,
        start_time: new Date(Date.now() - seconds * 1000).toISOString(),
        end_time: new Date().toISOString(),
        billable: true
      }])
    } catch (error) {
      console.error('Error saving time entry:', error)
      throw error
    }
  }

  const handleStartTimer = () => {
    if (!selectedTask) {
      toast.error('Please select a task before starting the timer')
      return
    }
    setIsRunning(true)
    setIsPaused(false)
  }

  // ... copy ALL state and hooks exactly as they are

  // Copy ALL the functions exactly as they are

  // Copy the ENTIRE return statement with all JSX
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 border-2 border-mint-light">
      {/* Welcome Message */}
      {!selectedClient && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            ⚠️ Important: Select a Client First
          </h3>
          <div className="text-blue-700 space-y-2">
            <p className="font-medium">
              You must select a client before you can:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>See available tasks</li>
              <li>Add time entry descriptions</li>
              <li>Start tracking time</li>
            </ul>
            <p className="mt-4 font-medium">
              👉 Please select a client from the dropdown below to begin.
            </p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-8 text-text-header flex items-center">
        <span className="w-2 h-8 bg-orange rounded-full mr-3"></span>
        Time Tracker
      </h2>

      <div className="space-y-6">
        {/* Step 1: Client Selection */}
        <div>
          <label className="block text-sm font-semibold text-text-header mb-2">
            Step 1: Select Client <span className="text-system-error">*</span>
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className={cn(
              'mt-1 block w-full rounded-lg border-2 px-4 py-3 bg-bg-gray focus:ring-2 focus:ring-mint transition-all',
              validationErrors.client 
                ? 'border-system-error' 
                : 'border-mint-light hover:border-mint'
            )}
            disabled={!!runningTimer}
          >
            <option value="">Choose a client to begin</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.company}
              </option>
            ))}
          </select>
          {validationErrors.client && (
            <p className="mt-2 text-sm text-system-error">{validationErrors.client}</p>
          )}
        </div>

        {/* Only show next steps if client is selected */}
        {selectedClient && (
          <>
            {/* Step 2: Task Selection */}
            <div>
              <label className="block text-sm font-semibold text-text-header mb-2">
                Step 2: Select Task (Optional)
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-mint-light hover:border-mint px-4 py-3 bg-bg-gray focus:ring-2 focus:ring-mint transition-all"
                disabled={!!runningTimer}
              >
                <option value="">Select a task (optional)</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Description */}
            <div>
              <label className="block text-sm font-semibold text-text-header mb-2">
                Step 3: Add Description <span className="text-system-error">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  'mt-1 block w-full rounded-lg border-2 px-4 py-3 bg-bg-gray focus:ring-2 focus:ring-mint transition-all',
                  validationErrors.description 
                    ? 'border-system-error' 
                    : 'border-mint-light hover:border-mint'
                )}
                disabled={!!runningTimer}
                placeholder="Describe what you're working on..."
              />
              {validationErrors.description && (
                <p className="mt-2 text-sm text-system-error">{validationErrors.description}</p>
              )}
            </div>
          </>
        )}

        {/* Timer Component */}
        <Timer 
          onComplete={handleTimerComplete} 
          onPause={(seconds) => {}}
          isDisabled={!isValid}
          onStart={handleStartTimer}
        />
      </div>
    </div>
  )
} 