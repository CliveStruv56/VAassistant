export type PricingModel = 'hourly' | 'daily' | 'retainer' | 'retainer_plus_hourly'

export interface Client {
  id: string
  name: string
  company: string
  email?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface ClientPricing {
  pricing_model: PricingModel
  hourly_rate: number | null
  daily_rate: number | null
  retainer_amount: number | null
  retainer_hours: number | null
  overage_hourly_rate: number | null
} 