import { Task } from './time'

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled'

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  client_id: string
  user_id: string
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
  budget?: number
  is_billable: boolean
  tasks?: Task[]
  clients?: {
    name: string
    company: string
  }
}

export interface CreateProjectInput {
  name: string
  description?: string
  status: ProjectStatus
  client_id: string
  start_date?: string
  end_date?: string
  budget?: number
  is_billable: boolean
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string
} 