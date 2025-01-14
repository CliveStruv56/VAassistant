'use client'

import { create } from 'zustand'

interface RunningTimer {
  client_id: string
  task_id?: string
  description: string
  start_time: Date
}

interface TimerState {
  runningTimer: RunningTimer | null
  startTimer: (timer: Omit<RunningTimer, 'start_time'>) => void
  stopTimer: () => RunningTimer | null
  getElapsedTime: () => number
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  
  startTimer: (timer) => {
    set({ 
      runningTimer: { 
        ...timer, 
        start_time: new Date() 
      }
    })
  },

  stopTimer: () => {
    const timer = get().runningTimer
    set({ runningTimer: null })
    return timer
  },

  getElapsedTime: () => {
    const timer = get().runningTimer
    if (!timer) return 0
    return Math.floor((new Date().getTime() - timer.start_time.getTime()) / 1000)
  }
})) 