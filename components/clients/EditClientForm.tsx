'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Client, KeyContact, PricingModel } from '@/app/types/pricing'

interface EditClientFormProps {
  clientId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  name: string
  company: string
  email: string
  phone: string
  website: string
  status: string
  business_description: string
  industry: string
  company_size: string
  address_line1: string
  city: string
  state: string
  postal_code: string
  country: string
  key_contacts: KeyContact[]
  pricing_model: PricingModel
  currency: string
  hourly_rate: number | null
  daily_rate: number | null
  retainer_amount: number | null
  retainer_hours: number | null
  overage_hourly_rate: number | null
  payment_terms: string
  project_enabled: boolean
}

export function EditClientForm({ clientId, onSuccess, onCancel }: EditClientFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    status: 'active',
    business_description: '',
    industry: '',
    company_size: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    key_contacts: [],
    pricing_model: 'hourly',
    currency: 'USD',
    hourly_rate: null,
    daily_rate: null,
    retainer_amount: null,
    retainer_hours: null,
    overage_hourly_rate: null,
    payment_terms: 'net_30',
    project_enabled: false
  })

  const [showContactForm, setShowContactForm] = useState(false)
  const [newContact, setNewContact] = useState<Partial<KeyContact>>({
    name: '',
    title: '',
    email: '',
    phone: '',
    is_primary: false,
    department: '',
    preferred_contact_method: 'email'
  })

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required for contacts')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      key_contacts: [...(prev.key_contacts || []), newContact as KeyContact]
    }))
    
    setNewContact({
      name: '',
      title: '',
      email: '',
      phone: '',
      is_primary: false,
      department: '',
      preferred_contact_method: 'email'
    })
    setShowContactForm(false)
  }

  // Fetch existing client data
  useEffect(() => {
    async function fetchClient() {
      if (!clientId) {
        toast.error('No client ID provided')
        return
      }

      setIsLoading(true)
      try {
        // Just fetch the client data without key_contacts
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single()

        if (clientError) throw clientError

        if (!clientData) {
          throw new Error('Client not found')
        }

        // Set the form data without trying to fetch key_contacts
        setFormData(prev => ({
          ...prev,
          ...clientData,
          key_contacts: [] // Initialize as empty array
        }))
      } catch (error) {
        console.error('Error fetching client:', error)
        toast.error('Failed to load client data')
        onCancel?.()
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [clientId, onCancel])

  if (isLoading) {
    return <div className="p-4 text-center">Loading client data...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Remove key_contacts from the data being sent
      const { key_contacts, ...clientData } = formData
      
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)

      if (error) throw error

      toast.success('Client updated successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
    }
  }

  // Copy the entire form JSX from NewClientForm, but keep the submit/cancel buttons we have
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-text-header font-medium">
              Client Name <span className="text-orange">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-header font-medium">
              Company <span className="text-orange">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
              required
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-text-header font-medium">
              Email <span className="text-orange">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-header font-medium">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-text-header font-medium">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={e => setFormData({ ...formData, website: e.target.value })}
            className="w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header"
          />
        </div>
      </div>

      {/* Key Contacts - Moved up */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Key Contacts
        </h3>
        {formData.key_contacts?.map((contact, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-md border-2 border-mint-light">
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-gray-600">{contact.title}</p>
            <p className="text-sm text-gray-600">{contact.email}</p>
          </div>
        ))}

        {showContactForm && (
          <div className="p-4 bg-gray-50 rounded-md border-2 border-mint-light space-y-4">
            <div className="space-y-2">
              <label className="block text-text-header font-medium">Name</label>
              <input
                type="text"
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-header font-medium">Title</label>
              <input
                type="text"
                value={newContact.title}
                onChange={e => setNewContact({ ...newContact, title: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-header font-medium">Email</label>
              <input
                type="email"
                value={newContact.email}
                onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddContact}
                className="bg-mint hover:bg-mint-dark text-white px-4 py-2 rounded-md"
              >
                Add Contact
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowContactForm(true)}
          className="w-full p-4 border-2 border-dashed border-mint-light rounded-md
                   text-gray-500 hover:border-mint hover:text-mint transition-colors"
        >
          + Add Contact
        </button>
      </div>

      {/* Pricing & Payment Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Pricing & Payment Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pricing Model *
            </label>
            <select
              value={formData.pricing_model}
              onChange={e => setFormData({ ...formData, pricing_model: e.target.value as PricingModel })}
              className="mt-1 w-full p-2 border rounded-md"
              required
            >
              <option value="hourly">Hourly Rate</option>
              <option value="daily">Daily Rate</option>
              <option value="retainer">Monthly Retainer</option>
              <option value="retainer_plus_hourly">Retainer + Hourly Overage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Currency *
            </label>
            <select
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1 w-full p-2 border rounded-md"
              required
            >
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          {/* Rate Fields */}
          {(formData.pricing_model === 'hourly' || formData.pricing_model === 'retainer_plus_hourly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hourly Rate
              </label>
              <input
                type="number"
                value={formData.hourly_rate || ''}
                onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {/* Daily Rate */}
          {formData.pricing_model === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Rate
              </label>
              <input
                type="number"
                value={formData.daily_rate || ''}
                onChange={e => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {/* Retainer Fields */}
          {(formData.pricing_model === 'retainer' || formData.pricing_model === 'retainer_plus_hourly') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Retainer Amount
                </label>
                <input
                  type="number"
                  value={formData.retainer_amount || ''}
                  onChange={e => setFormData({ ...formData, retainer_amount: parseFloat(e.target.value) })}
                  className="mt-1 w-full p-2 border rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Included Hours
                </label>
                <input
                  type="number"
                  value={formData.retainer_hours || ''}
                  onChange={e => setFormData({ ...formData, retainer_hours: parseFloat(e.target.value) })}
                  className="mt-1 w-full p-2 border rounded-md"
                  min="0"
                  step="0.5"
                />
              </div>
            </>
          )}

          {/* Overage Rate */}
          {formData.pricing_model === 'retainer_plus_hourly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Overage Hourly Rate
              </label>
              <input
                type="number"
                value={formData.overage_hourly_rate || ''}
                onChange={e => setFormData({ ...formData, overage_hourly_rate: parseFloat(e.target.value) })}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          )}

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Terms
            </label>
            <select
              value={formData.payment_terms}
              onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
              className="mt-1 w-full p-2 border rounded-md"
            >
              <option value="net_15">Net 15</option>
              <option value="net_30">Net 30</option>
              <option value="net_45">Net 45</option>
              <option value="net_60">Net 60</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Address Information
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-text-header font-medium">Address Line 1</label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-text-header font-medium">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-header font-medium">State/Province</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-text-header font-medium">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-header font-medium">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-gray-50 text-text-header"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Project Management */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Project Management
        </h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="project_enabled"
            checked={formData.project_enabled}
            onChange={e => setFormData({ ...formData, project_enabled: e.target.checked })}
            className="h-4 w-4 text-mint border-mint-light focus:ring-mint"
          />
          <label htmlFor="project_enabled" className="text-text-header font-medium">
            Enable Project Management
          </label>
        </div>
        
        {formData.project_enabled && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Warning: Disabling project management will not delete existing projects,
                  but they will be hidden until project management is re-enabled.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-mint-light">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-text-body hover:text-orange transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-orange hover:bg-orange-dark text-white 
                   font-medium rounded-md shadow-sm transition-colors"
        >
          Update Client
        </button>
      </div>
    </form>
  )
} 