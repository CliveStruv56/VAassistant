export type PricingModel = 'hourly' | 'daily' | 'retainer' | 'retainer_plus_hourly'

export interface ClientPricing {
  pricing_model: PricingModel
  hourly_rate: number | null
  daily_rate: number | null
  retainer_amount: number | null
  retainer_hours: number | null
  overage_hourly_rate: number | null
}

export interface KeyContact {
  name: string
  title: string
  email: string
  phone: string
  is_primary: boolean
  department: string
  preferred_contact_method: 'email' | 'phone'
}

export interface Client {
  id: string
  name: string
  company: string
  phone_primary?: string
  phone_secondary?: string
  email_primary?: string
  website?: string
  email?: string
  phone?: string
  status?: string
  business_description?: string
  industry?: string
  company_size?: string
  annual_revenue_range?: string
  start_date?: string
  contract_renewal_date?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  key_contacts?: KeyContact[]
  tax_id?: string
  billing_currency?: string
  payment_terms?: string
  billing_email?: string
  billing_address_same_as_main?: boolean
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  created_at?: string
  updated_at?: string
  client_tier?: string
  notes?: string
  tags?: string[]
  pricing_model: PricingModel
  currency: string
  hourly_rate: number | null
  daily_rate: number | null
  retainer_amount: number | null
  retainer_hours: number | null
  overage_hourly_rate: number | null
}

// Add validation rules
export const PRICING_RULES = {
  MIN_HOURLY_RATE: 15,
  MIN_DAILY_RATE: 100,
  MIN_RETAINER_AMOUNT: 500,
  MIN_RETAINER_HOURS: 5,
  MIN_OVERAGE_RATE: 15
}

export function validateClientPricing(pricing: ClientPricing): string | null {
  const {
    pricing_model,
    hourly_rate,
    daily_rate,
    retainer_amount,
    retainer_hours,
    overage_hourly_rate
  } = pricing

  switch (pricing_model) {
    case 'hourly':
      if (!hourly_rate || hourly_rate < PRICING_RULES.MIN_HOURLY_RATE) {
        return `Hourly rate must be at least $${PRICING_RULES.MIN_HOURLY_RATE}`
      }
      break

    case 'daily':
      if (!daily_rate || daily_rate < PRICING_RULES.MIN_DAILY_RATE) {
        return `Daily rate must be at least $${PRICING_RULES.MIN_DAILY_RATE}`
      }
      break

    case 'retainer':
    case 'retainer_plus_hourly':
      if (!retainer_amount || retainer_amount < PRICING_RULES.MIN_RETAINER_AMOUNT) {
        return `Retainer amount must be at least $${PRICING_RULES.MIN_RETAINER_AMOUNT}`
      }
      if (!retainer_hours || retainer_hours < PRICING_RULES.MIN_RETAINER_HOURS) {
        return `Retainer hours must be at least ${PRICING_RULES.MIN_RETAINER_HOURS}`
      }
      if (pricing_model === 'retainer_plus_hourly' && 
          (!overage_hourly_rate || overage_hourly_rate < PRICING_RULES.MIN_OVERAGE_RATE)) {
        return `Overage hourly rate must be at least $${PRICING_RULES.MIN_OVERAGE_RATE}`
      }
      break
  }

  return null
} 