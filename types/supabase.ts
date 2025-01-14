export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          company: string
          user_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          user_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          user_id?: string
          status?: string
          created_at?: string
        }
      },
      time_entries: {
        Row: {
          id: string
          user_id: string
          client_id: string
          task_id?: string
          description: string
          start_time: string
          end_time?: string
          duration?: number
          billable: boolean
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          task_id?: string
          description: string
          start_time: string
          end_time?: string
          duration?: number
          billable?: boolean
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          task_id?: string
          description?: string
          start_time?: string
          end_time?: string
          duration?: number
          billable?: boolean
          month?: string
          created_at?: string
        }
      },
      tasks: {
        Row: {
          id: string
          user_id: string
          client_id: string
          title: string
          description: string
          status: string
          priority: string
          due_date: string
          estimated_hours: number | null
          estimated_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          title: string
          description: string
          status?: string
          priority?: string
          due_date: string
          estimated_hours?: number | null
          estimated_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          due_date?: string
          estimated_hours?: number | null
          estimated_minutes?: number | null
          created_at?: string
        }
      }
      // Add other tables as needed
    }
  }
} 