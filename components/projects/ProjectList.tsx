'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Project, ProjectStatus } from '@/app/types/project'
import { Task } from '@/app/types/time'
import { toast } from 'react-hot-toast'

interface ProjectListProps {
  clientId?: string
  limit?: number
}

interface ProjectWithRelations extends Project {
  tasks: Task[]
  clients: {
    name: string
    company: string
  }
}

export function ProjectList({ clientId, limit }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        let query = supabase
          .from('projects')
          .select(`
            *,
            clients (
              name,
              company
            ),
            tasks (
              id,
              title,
              status,
              priority,
              due_date
            )
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
        
        if (clientId) {
          query = query.eq('client_id', clientId)
        }
        
        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query
        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [clientId, limit])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-24 rounded-lg"/>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">
          {clientId 
            ? 'No projects found for this client. Create your first project!'
            : 'No projects found. Select a client and create your first project!'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}>
                {project.status.replace('_', ' ')}
              </span>
              
              {project.is_billable && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint-100 text-mint-800">
                  Billable
                </span>
              )}
            </div>

            {project.tasks && project.tasks.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tasks ({project.tasks.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {project.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-2 bg-gray-50 rounded-md text-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{task.status}</span>
                        {task.due_date && (
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.budget && (
              <div className="text-sm text-gray-600">
                Budget: ${project.budget.toLocaleString()}
              </div>
            )}

            {(project.start_date || project.end_date) && (
              <div className="text-sm text-gray-600">
                {project.start_date && <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>}
                {project.start_date && project.end_date && <span> - </span>}
                {project.end_date && <span>End: {new Date(project.end_date).toLocaleDateString()}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 