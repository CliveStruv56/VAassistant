'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface TaskStats {
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  overdueTasks: number
}

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const stats = {
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        overdueTasks: tasks.filter(t => {
          if (t.status === 'completed') return false
          
          const dueDate = new Date(t.due_date)
          dueDate.setHours(0, 0, 0, 0)
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          // Task is overdue if today is after the due date
          return today > dueDate
        }).length
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching task stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, isLoading, refresh: fetchStats }
} 