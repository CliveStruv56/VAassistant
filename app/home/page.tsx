'use client'

import * as React from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase/client'

interface TaskResponse {
  id: string
  title: string
  due_date: string
  client: {
    name: string
  }
}

interface OverdueTask {
  id: string
  title: string
  due_date: string
  status: string
  client: { name: string }
}

export default function HomePage() {
  const [overdueTasks, setOverdueTasks] = React.useState<OverdueTask[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadOverdueTasks() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            due_date,
            status,
            client:clients (
              name
            )
          `)
          .eq('user_id', user.id)
          .order('due_date', { ascending: true })

        const overdueTasks = tasks?.filter(task => {
          if (task.status === 'completed') return false
          const dueDate = new Date(task.due_date)
          dueDate.setHours(0, 0, 0, 0)
          return today > dueDate
        }).map(task => ({
          ...task,
          client: task.client[0]
        })) || []

        setOverdueTasks(overdueTasks)
      } catch (error) {
        console.error('Error loading overdue tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOverdueTasks()
  }, [])

  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-[#333333]">
          Welcome Back!
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#7CCDB0]">
            <h2 className="text-xl font-semibold mb-6 text-[#333333]">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  href: '/dashboard', 
                  label: 'Dashboard', 
                  desc: 'View your overview',
                  bgColor: 'bg-[#99DDBE]',
                  textColor: 'text-[#333333]',
                  hoverBg: 'hover:bg-[#7CCDB0]'
                },
                { 
                  href: '/dashboard/clients', 
                  label: 'Clients', 
                  desc: 'Manage your clients',
                  bgColor: 'bg-[#99DDBE]',
                  textColor: 'text-[#333333]',
                  hoverBg: 'hover:bg-[#7CCDB0]'
                },
                { 
                  href: '/training', 
                  label: 'Training', 
                  desc: 'Access resources',
                  bgColor: 'bg-[#99DDBE]',
                  textColor: 'text-[#333333]',
                  hoverBg: 'hover:bg-[#7CCDB0]'
                },
                { 
                  href: '/prospecting', 
                  label: 'Prospecting', 
                  desc: 'Find new clients',
                  bgColor: 'bg-[#99DDBE]',
                  textColor: 'text-[#333333]',
                  hoverBg: 'hover:bg-[#7CCDB0]'
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-4 rounded-xl transition-all duration-200 ${item.bgColor} ${item.hoverBg} shadow-sm hover:shadow-md`}
                >
                  <h3 className={`text-lg font-medium ${item.textColor}`}>
                    {item.label}
                  </h3>
                  <p className="text-sm text-[#666666] mt-1">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#7CCDB0]">
            <h2 className="text-xl font-semibold mb-6 text-[#333333]">Overdue Tasks</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#EEEEEE] rounded-lg" />
                ))}
              </div>
            ) : overdueTasks.length > 0 ? (
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="block p-4 rounded-lg bg-[#FF795C] hover:bg-[#FF5733] transition-colors"
                  >
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-sm text-white mt-1">
                      {task.client.name} - Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#666666]">No overdue tasks!</p>
                <p className="text-sm text-[#999999] mt-1">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 rounded-xl p-8 bg-[#EEEEEE]">
          <h2 className="text-xl font-semibold mb-6 text-[#E64A2E]">Coming Soon</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-lg text-[#E64A2E]">
                Training Resources
              </h3>
              <p className="text-[#666666] mt-2">
                Access comprehensive VA training materials and courses.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-medium text-lg text-[#E64A2E]">
                Client Prospecting Tools
              </h3>
              <p className="text-[#666666] mt-2">
                Tools and templates to help you find and win new clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 