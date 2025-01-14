export interface TimeEntry {
  id: string
  user_id: string
  client_id: string
  task_id?: string // Optional, can track time without specific task
  description: string
  start_time: string
  end_time?: string // Null if timer is running
  duration: number // In minutes
  billable: boolean
  created_at: string
  updated_at: string
  tasks?: {
    title: string
  }
}

export interface TimeStats {
  total_hours: number
  billable_hours: number
  retainer_hours: number
  overage_hours: number
}

export interface TimeLog {
  id: string
  user_id: string
  client_id: string
  task_id?: string
  description: string
  start_time: string
  end_time?: string
  duration: number // in minutes
  billable: boolean
  month: string // YYYY-MM format for easy querying
  created_at: string
  updated_at: string
}

export interface RunningTimer {
  start_time: Date
  client_id: string
  task_id?: string
  description: string
} 