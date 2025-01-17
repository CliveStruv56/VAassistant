'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'
import { Timer } from './components/Timer/Timer'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NewTaskForm } from '@/components/tasks/NewTaskForm'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  name: string
  company: string
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  client_id: string
  total_time: number
  notes: string[]
}

export default function TimeTrackerPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // Load clients
  useEffect(() => {
    async function loadClients() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
        
        setClients(data || [])
      } catch (error) {
        console.error('Error loading clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [])

  // Move loadTasks to component level
  async function loadTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        return
      }

      // First, let's see what tasks exist for this client regardless of status
      const { data: allTasks, error: allTasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', selectedClient)
        .eq('user_id', user.id)

      console.log('All tasks for client:', allTasks)

      // Then try our filtered query
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', selectedClient)
        .eq('user_id', user.id)
        // Try without status filter first
        //.eq('status', 'pending')

      if (error) {
        console.error('Supabase error:', error)
        return
      }

      console.log('Raw tasks data:', data)

      const tasksWithNotes = data?.map(task => ({
        ...task,
        notes: task.notes || []
      })) || []

      console.log('Processed tasks:', tasksWithNotes)
      setTasks(tasksWithNotes)
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error('Failed to load tasks')
    }
  }

  // Use loadTasks in useEffect
  useEffect(() => {
    if (!selectedClient) {
      setTasks([])
      setSelectedTask('')
      return
    }
    loadTasks()
  }, [selectedClient])

  // Update task selection to show total time
  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId)
    const taskDetails = tasks.find(t => t.id === taskId)
    setSelectedTaskDetails(taskDetails || null)
  }

  async function updateTaskTime(taskId: string, seconds: number) {
    try {
      // First update the task's total_time in database
      const { data: taskData } = await supabase
        .from('tasks')
        .select('total_time')
        .eq('id', taskId)
        .single()

      const currentTotal = taskData?.total_time || 0
      const newTotal = currentTotal + seconds

      await supabase
        .from('tasks')
        .update({ total_time: newTotal })
        .eq('id', taskId)

      // Update local state
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId
            ? { ...task, total_time: newTotal }
            : task
        )
      )

      // Update selected task details if this is the selected task
      if (selectedTaskDetails && selectedTaskDetails.id === taskId) {
        setSelectedTaskDetails({
          ...selectedTaskDetails,
          total_time: newTotal
        })
      }
    } catch (error) {
      console.error('Error updating task time:', error)
    }
  }

  const handleTimerPause = async (seconds: number) => {
    if (!selectedTask) return
    // Don't update total_time on pause, just store current time
  }

  const handleTimerComplete = async (seconds: number) => {
    try {
      if (!selectedTask) return

      // Update task's total_time only on complete/stop
      await updateTaskTime(selectedTask, seconds)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const end_time = new Date()
      const start_time = new Date(end_time.getTime() - (seconds * 1000))

      await supabase.from('time_entries').insert([{
        user_id: user.id,
        client_id: selectedClient,
        task_id: selectedTask,
        description: selectedTaskDetails?.description || '',
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
        duration: seconds,
        billable: true
      }])

      await loadTasks() // Refresh tasks to get updated times
    } catch (error) {
      console.error('Error saving time entry:', error)
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    if (!selectedTask) {
      toast.error('Please select a task before starting the timer')
      return
    }
    setIsRunning(true)
    setIsPaused(false)
  }

  const handleAddNote = async () => {
    if (!currentNote.trim() || !selectedTask) return

    try {
      const timestamp = new Date().toISOString()
      const noteWithTimestamp = `${timestamp}: ${currentNote}`

      // Get current notes
      const { data: taskData } = await supabase
        .from('tasks')
        .select('notes')
        .eq('id', selectedTask)
        .single()

      const currentNotes = taskData?.notes || []
      const updatedNotes = [...currentNotes, noteWithTimestamp]

      // Update in database
      await supabase
        .from('tasks')
        .update({ notes: updatedNotes })
        .eq('id', selectedTask)

      // Update local state
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === selectedTask
            ? { ...task, notes: updatedNotes }
            : task
        )
      )

      if (selectedTaskDetails) {
        setSelectedTaskDetails({
          ...selectedTaskDetails,
          notes: updatedNotes
        })
      }

      setCurrentNote('') // Clear input
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    }
  }

  // Update client selection handler
  const handleClientSelect = (clientId: string) => {
    console.log('Client selected:', clientId)
    setSelectedClient(clientId)
    setSelectedTask('') // Clear selected task when client changes
    setSelectedTaskDetails(null)
  }

  // Add this function to handle task creation success
  const handleTaskCreated = () => {
    setShowNewTaskModal(false)
    // Refresh tasks list
    fetchTasks() // Make sure this function exists to fetch tasks for the selected client
  }

  // Add this function after the handleClientSelect function
  const fetchTasks = async () => {
    if (!selectedClient) return
    
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', selectedClient)
        .order('created_at', { ascending: false })

      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-[#333333]">Time Tracker</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* Client Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client
          </label>

{/* Show validation message inline */}
{!selectedTask && (
          <p className="mt-2 text-sm text-red-600">
            Please select a client and then a task to begin tracking time
          </p>
        )}

          <select 
            value={selectedClient}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.company}
              </option>
            ))}
          </select>
        </div>

        {/* Task Selection */}
        {selectedClient && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Task
              </label>
              <Button
                onClick={() => setShowNewTaskModal(true)}
                variant="secondary"
                className="text-mint hover:text-mint-dark border-mint hover:border-mint-dark"
              >
                + New Task
              </Button>
            </div>
            <select
              value={selectedTask}
              onChange={(e) => handleTaskSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="">Select a task</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Add the New Task Modal */}
        <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Fill in the task details below. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <NewTaskForm 
              onSuccess={handleTaskCreated}
              initialClientId={selectedClient} // Pass the selected client ID
            />
          </DialogContent>
        </Dialog>

        {/* Show task description */}
        {selectedTaskDetails && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Task Details</h3>
              <p className="mt-2 text-gray-600">{selectedTaskDetails.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                Total time spent: {formatTime(selectedTaskDetails.total_time)}
              </p>
            </div>

            {/* Notes Section */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
              
              {/* Notes Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!currentNote.trim()}
                  className="bg-mint hover:bg-mint-dark text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTaskDetails?.notes && Array.isArray(selectedTaskDetails.notes) ? (
                  selectedTaskDetails.notes.map((note, index) => {
                    const [timestamp, ...noteParts] = note.split(': ')
                    const noteText = noteParts.join(': ')
                    const date = new Date(timestamp)
                    
                    return (
                      <div key={index} className="p-2 bg-gray-50 rounded-md text-sm border border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{date.toLocaleDateString()}</span>
                          <span>{date.toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-1">{noteText}</p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No notes available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timer Component */}
        <Timer 
          onComplete={handleTimerComplete}
          onPause={handleTimerPause}
          isDisabled={!selectedTask}
          onStart={handleStartTimer}
        />

        
      </div>
    </div>
  )
} 