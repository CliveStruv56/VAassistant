'use client'

import * as React from 'react'
import { supabase } from '@/lib/supabase/client'
import { TaskList } from './components/TaskList'

import { ClientList } from '@/components/clients/ClientList'
import { useTaskStats } from './hooks/useTaskStats'

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null)
  const { stats, isLoading: statsLoading } = useTaskStats()
  const [showNewTaskForm, setShowNewTaskForm] = React.useState(false)

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}
        </h1>
        <p className="mt-1 text-gray-500">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="bg-white shadow hover:shadow-md rounded-lg p-6 transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/dashboard/tasks'}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.totalTasks}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <span>View tasks</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div 
          className="bg-white shadow hover:shadow-md rounded-lg p-6 transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/dashboard/tasks?filter=pending'}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {statsLoading ? '...' : stats?.pendingTasks}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <span>View tasks</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div 
          className="bg-white shadow hover:shadow-md rounded-lg p-6 transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/dashboard/tasks?filter=completed'}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Completed Tasks</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {statsLoading ? '...' : stats?.completedTasks}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <span>View tasks</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div 
          className="bg-white shadow hover:shadow-md rounded-lg p-6 transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/dashboard/tasks?filter=overdue'}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Overdue Tasks</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {statsLoading ? '...' : stats?.overdueTasks}
              </p>
            </div>
            {stats?.overdueTasks > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Needs Attention
              </span>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <span>View tasks</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      

      {/* Tasks Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h2>
        <TaskList />
      </div>

      {/* Clients Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Clients</h2>
        <ClientList limit={3} />
      </div>

     
    </div>
  )
} 