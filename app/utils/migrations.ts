import { supabase } from '../../lib/supabase/client'
import { Client, PricingModel } from '../types/pricing'

export async function migrateClientData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get all clients without pricing data
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .is('pricing_model', null)

  if (!clients?.length) return

  // Migrate each client
  for (const client of clients) {
    const defaultPricing = {
      pricing_model: 'hourly' as PricingModel,
      hourly_rate: 100,
      daily_rate: null,
      retainer_amount: null,
      retainer_hours: null,
      overage_hourly_rate: null
    }

    await supabase
      .from('clients')
      .update(defaultPricing)
      .eq('id', client.id)
  }
} 