'use client'

import * as React from 'react'
import { supabase } from '../../../../lib/supabase/client'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
}

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const [client, setClient] = React.useState<any>(null)
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchClientData() {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()

      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', params.id)
        .order('due_date', { ascending: true })

      setClient(clientData)
      setTasks(taskData || [])
      setIsLoading(false)
    }

    fetchClientData()
  }, [params.id])

  if (isLoading) return <div>Loading...</div>
  if (!client) return <div>Client not found</div>

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <p className="text-gray-500">{client.company}</p>
        <a href={`mailto:${client.email}`} className="text-blue-600">
          {client.email}
        </a>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Client Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned to this client</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{task.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>Status: {task.status}</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 