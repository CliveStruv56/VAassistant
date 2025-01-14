'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

interface TimerData {
  client_id: string
  task_id?: string
  description: string
}

interface RunningTimer extends TimerData {
  start_time: Date
}

interface TimerStore {
  runningTimer: RunningTimer | null
  isLoading: boolean
  error: Error | null
  startTimer: (data: TimerData) => Promise<void>
  stopTimer: () => Promise<void>
  getElapsedTime: () => number
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  runningTimer: null,
  isLoading: false,
  error: null,

  startTimer: async (data: TimerData) => {
    set({ 
      runningTimer: { 
        ...data,
        start_time: new Date()
      }
    })
  },

  stopTimer: async () => {
    set({ runningTimer: null })
    return
  },

  getElapsedTime: () => {
    const timer = get().runningTimer
    if (!timer) return 0
    return Math.floor((new Date().getTime() - timer.start_time.getTime()) / 1000)
  }
})) 