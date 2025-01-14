'use client'

import { useState } from 'react'
import { ClientList } from '@/components/clients/ClientList'
import { NewClientForm } from '@/components/clients/NewClientForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EditClientForm } from '@/components/clients/EditClientForm'
import { toast } from 'react-hot-toast'

export default function ClientsPage() {
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const handleEdit = (clientId: string) => {
    if (!clientId) {
      toast.error('No client ID provided')
      return
    }
    setSelectedClientId(clientId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button 
          onClick={() => setShowNewClientModal(true)}
          className="bg-orange hover:bg-orange-dark text-white font-medium px-6 py-2 
                     shadow-sm transition-colors flex items-center space-x-2"
        >
          <span className="text-lg">+</span>
          <span>Add New Client</span>
        </Button>
      </div>

      <ClientList />

      <Dialog open={showNewClientModal} onOpenChange={setShowNewClientModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the client details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <NewClientForm onSuccess={() => setShowNewClientModal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the client details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          
          {selectedClientId && (
            <EditClientForm
              clientId={selectedClientId}
              onSuccess={() => {
                setSelectedClientId(null)
                // Refresh your clients list here
              }}
              onCancel={() => setSelectedClientId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 