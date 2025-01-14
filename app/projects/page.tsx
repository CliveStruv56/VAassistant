'use client'

import { useState, useEffect } from 'react'
import { ProjectList } from '@/components/projects/ProjectList'
import { NewProjectForm } from '@/components/projects/NewProjectForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export default function ProjectsPage() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clients, setClients] = useState<any[]>([])

  // Load clients that have project management enabled
  useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('clients')
        .select('id, name, company')
        .eq('user_id', user?.id)
        .eq('project_enabled', true)
        .eq('status', 'active')
        .order('name')

      setClients(data || [])
    }
    loadClients()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button 
          onClick={() => setShowNewProjectModal(true)}
          className="bg-orange hover:bg-orange-dark text-white font-medium px-6 py-2 
                   shadow-sm transition-colors flex items-center space-x-2"
          disabled={!selectedClientId}
        >
          <span className="text-lg">+</span>
          <span>Add New Project</span>
        </Button>
      </div>

      <div className="mb-6">
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full md:w-auto p-2 border rounded-md"
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} - {client.company}
            </option>
          ))}
        </select>
      </div>

      <ProjectList clientId={selectedClientId} />

      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the project details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <NewProjectForm 
            clientId={selectedClientId}
            onSuccess={() => {
              setShowNewProjectModal(false)
              // Refresh projects list
              window.location.reload()
            }}
            onCancel={() => setShowNewProjectModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 