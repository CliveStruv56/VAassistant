'use client'

import * as React from 'react'
import { supabase } from '../../../lib/supabase/client'
import { TimeEntry, TimeStats } from '../../../app/types/time'
import { Client } from '../../../app/types/pricing'

export function TimeEntries() {
  const [entries, setEntries] = React.useState<TimeEntry[]>([])
  const [clients, setClients] = React.useState<Client[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [stats, setStats] = React.useState<TimeStats>({
    total_hours: 0,
    billable_hours: 0,
    retainer_hours: 0,
    overage_hours: 0
  })
  const [selectedClient, setSelectedClient] = React.useState<string>('')
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [monthlyStats, setMonthlyStats] = React.useState<Record<string, number>>({})

  // Load clients
  React.useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
      
      setClients(data || [])
    }
    loadClients()
  }, [])

  // Load time entries and calculate stats
  React.useEffect(() => {
    async function loadEntries() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      // Build query
      let query = supabase
        .from('time_entries')
        .select('*, tasks(title)')
        .eq('user_id', user?.id)
        .gte('start_time', `${selectedMonth}-01`)
        .lt('start_time', getNextMonth(selectedMonth))
        .order('start_time', { ascending: false })

      if (selectedClient) {
        query = query.eq('client_id', selectedClient)
      }

      const { data: entries } = await query

      if (entries) {
        setEntries(entries)
        calculateStats(entries)
      }
      
      setIsLoading(false)
    }

    loadEntries()
  }, [selectedMonth, selectedClient])

  function getNextMonth(yearMonth: string): string {
    const [year, month] = yearMonth.split('-').map(Number)
    const date = new Date(year, month, 1) // This will automatically roll over to next year if month = 12
    return date.toISOString().slice(0, 7)
  }

  function calculateStats(entries: TimeEntry[]) {
    const stats = entries.reduce((acc, entry) => {
      if (!entry.duration) return acc
      
      const hours = entry.duration / 60
      acc.total_hours += hours
      
      if (entry.billable) {
        acc.billable_hours += hours
        // Additional retainer/overage calculations would go here
      }
      
      return acc
    }, {
      total_hours: 0,
      billable_hours: 0,
      retainer_hours: 0,
      overage_hours: 0
    })

    setStats(stats)
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  function getClientName(clientId: string): string {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Time Entries</h2>
        
        <div className="flex space-x-4">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Total Hours</div>
          <div className="text-2xl font-semibold">{stats.total_hours.toFixed(1)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Billable Hours</div>
          <div className="text-2xl font-semibold">{stats.billable_hours.toFixed(1)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Retainer Hours</div>
          <div className="text-2xl font-semibold">{stats.retainer_hours.toFixed(1)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Overage Hours</div>
          <div className="text-2xl font-semibold">{stats.overage_hours.toFixed(1)}</div>
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No time entries found for this period
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{entry.description}</h3>
                  <p className="text-sm text-gray-500">
                    {getClientName(entry.client_id)}
                    {entry.task_id && ` • ${entry.tasks?.title}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDuration(entry.duration || 0)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 