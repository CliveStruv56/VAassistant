'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase/client'
import { Client } from '../../../../types/pricing'
import { ErrorBoundary } from 'react-error-boundary'

interface TimeEntry {
  id: string
  description: string
  start_time: string
  end_time: string
  duration: number
  task_id: string | null
  task?: {
    title: string
  }
}

interface TimeStats {
  totalHours: number
  taskBreakdown: {
    [key: string]: number // task title -> hours
  }
  monthlyBreakdown: {
    [key: string]: number // YYYY-MM -> hours
  }
}

interface DateRangeSummary {
  totalHours: number
  averageHoursPerDay: number
  daysWorked: number
  mostActiveDay: {
    date: string
    hours: number
  }
  billableAmount: number
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="bg-red-50 text-red-700 p-6 rounded-lg">
      <h2 className="text-lg font-medium mb-2">Something went wrong:</h2>
      <pre className="text-sm">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}

export default function ClientTimeEntriesPage() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state here
        window.location.reload()
      }}
    >
      <TimeEntriesContent />
    </ErrorBoundary>
  )
}

function TimeEntriesContent() {
  const params = useParams()
  const [client, setClient] = React.useState<Client | null>(null)
  const [timeEntries, setTimeEntries] = React.useState<TimeEntry[]>([])
  const [stats, setStats] = React.useState<TimeStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Add new state for filters
  const [dateRange, setDateRange] = React.useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10), // Last month
    end: new Date().toISOString().slice(0, 10) // Today
  })
  const [sortBy, setSortBy] = React.useState<'date' | 'task' | 'duration'>('date')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [dateRangeSummary, setDateRangeSummary] = React.useState<DateRangeSummary | null>(null)

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Load client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()

      if (clientError) throw clientError

      // Load time entries with task details and date filtering
      const query = supabase
        .from('time_entries')
        .select(`
          *,
          task:tasks (
            title
          )
        `)
        .eq('client_id', params.id)
        .gte('start_time', `${dateRange.start}T00:00:00`)
        .lte('start_time', `${dateRange.end}T23:59:59`)

      // Apply sorting
      switch (sortBy) {
        case 'date':
          query.order('start_time', { ascending: sortOrder === 'asc' })
          break
        case 'task':
          query.order('task(title)', { ascending: sortOrder === 'asc' })
          break
        case 'duration':
          query.order('duration', { ascending: sortOrder === 'asc' })
          break
      }

      const { data: entries, error: entriesError } = await query

      if (entriesError) throw entriesError

      setClient(clientData)
      setTimeEntries(entries)
      setStats(calculateStats(entries))
      setDateRangeSummary(calculateDateRangeSummary(entries, clientData))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading time entries')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [params.id, dateRange.start, dateRange.end, sortBy, sortOrder])

  function calculateStats(entries: TimeEntry[]): TimeStats {
    const stats: TimeStats = {
      totalHours: 0,
      taskBreakdown: {},
      monthlyBreakdown: {}
    }

    entries.forEach(entry => {
      const hours = entry.duration / 3600 // Convert seconds to hours
      stats.totalHours += hours

      // Task breakdown
      const taskTitle = entry.task?.title || 'No Task'
      stats.taskBreakdown[taskTitle] = (stats.taskBreakdown[taskTitle] || 0) + hours

      // Monthly breakdown
      const month = entry.start_time.slice(0, 7) // YYYY-MM
      stats.monthlyBreakdown[month] = (stats.monthlyBreakdown[month] || 0) + hours
    })

    return stats
  }

  function calculateDateRangeSummary(entries: TimeEntry[], client: Client): DateRangeSummary {
    const dailyHours: { [key: string]: number } = {}
    let totalHours = 0

    entries.forEach(entry => {
      const date = entry.start_time.slice(0, 10)
      const hours = entry.duration / 3600
      dailyHours[date] = (dailyHours[date] || 0) + hours
      totalHours += hours
    })

    const daysWorked = Object.keys(dailyHours).length
    const mostActiveDay = Object.entries(dailyHours)
      .reduce((max, [date, hours]) => 
        hours > max.hours ? { date, hours } : max, 
        { date: '', hours: 0 }
      )

    // Calculate billable amount based on client's pricing model
    let billableAmount = 0
    if (client.pricing_model === 'hourly') {
      billableAmount = totalHours * (client.hourly_rate || 0)
    } else if (client.pricing_model === 'retainer_plus_hourly') {
      const retainerHours = client.retainer_hours || 0
      const overageHours = Math.max(0, totalHours - retainerHours)
      billableAmount = (client.retainer_amount || 0) + 
        (overageHours * (client.overage_hourly_rate || 0))
    }

    return {
      totalHours,
      averageHoursPerDay: totalHours / daysWorked || 0,
      daysWorked,
      mostActiveDay,
      billableAmount
    }
  }

  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!client) return <div className="p-4">Client not found</div>

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <div className="mt-1 flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'task' | 'duration')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="date">Date</option>
                <option value="task">Task</option>
                <option value="duration">Duration</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{client.name}</h1>
        <p className="text-gray-600">{client.company}</p>
        
        {dateRangeSummary && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Period Summary</h3>
              <p className="mt-2 text-2xl font-semibold text-blue-900">
                {dateRangeSummary.totalHours.toFixed(1)} hours
              </p>
              <p className="text-sm text-blue-700">
                Over {dateRangeSummary.daysWorked} days
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Daily Average</h3>
              <p className="mt-2 text-2xl font-semibold text-green-900">
                {dateRangeSummary.averageHoursPerDay.toFixed(1)} hours/day
              </p>
              <p className="text-sm text-green-700">
                Most active: {new Date(dateRangeSummary.mostActiveDay.date).toLocaleDateString()}
                ({dateRangeSummary.mostActiveDay.hours.toFixed(1)} hours)
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Billable Amount</h3>
              <p className="mt-2 text-2xl font-semibold text-purple-900">
                ${dateRangeSummary.billableAmount.toFixed(2)}
              </p>
              <p className="text-sm text-purple-700">
                Based on {client.pricing_model} pricing
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Time by Task</h2>
        <div className="space-y-2">
          {Object.entries(stats?.taskBreakdown || {}).map(([task, hours]) => (
            <div key={task} className="flex justify-between">
              <span>{task}</span>
              <span>{hours.toFixed(2)} hours</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium mb-4">Recent Time Entries</h2>
        <div className="space-y-4">
          {timeEntries.map(entry => (
            <div key={entry.id} className="border-b pb-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{entry.description}</p>
                  <p className="text-sm text-gray-600">
                    {entry.task?.title || 'No Task'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(entry.duration / 3600).toFixed(2)} hours</p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 