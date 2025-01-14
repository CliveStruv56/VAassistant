'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Client } from '@/app/types/pricing'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { EditClientForm } from './EditClientForm'

interface ClientListProps {
  limit?: number
}

export function ClientList({ limit }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading clients...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <div
          key={client.id}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <p className="text-gray-600">{client.company}</p>
            </div>
            <button
              onClick={() => setSelectedClientId(client.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
        </div>
      ))}

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
                fetchClients() // Refresh the list after update
              }}
              onCancel={() => setSelectedClientId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 