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
  user_id: string
  name: string
  company: string
  status: string
  
  // Contact Information
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone_primary?: string
  phone_secondary?: string
  email_primary?: string
  website?: string

  // Business Details
  business_description?: string
  industry?: string
  company_size?: string
  annual_revenue_range?: string
  start_date?: string
  contract_renewal_date?: string

  // Key Contacts
  key_contacts?: KeyContact[]

  // Business Information
  tax_id?: string
  billing_currency?: string
  payment_terms?: string
  billing_email?: string
  billing_address_same_as_main?: boolean

  // Billing Address
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string

  // Relationship Management
  account_manager_id?: string
  client_tier?: string
  notes?: string
  tags?: string[]

  // Timestamps
  created_at: string
  updated_at: string
} 