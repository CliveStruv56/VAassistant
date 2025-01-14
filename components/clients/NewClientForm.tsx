'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Client, KeyContact, PricingModel } from '@/app/types/pricing'

interface ClientFormData {
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
  address_line2: string
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
}

interface NewClientFormProps {
  onSuccess?: () => void
}

export function NewClientForm({ onSuccess }: NewClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
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
    address_line2: '',
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
    payment_terms: 'net_30'
  })

  const [newContact, setNewContact] = useState<Partial<KeyContact>>({
    name: '',
    title: '',
    email: '',
    phone: '',
    is_primary: false,
    department: '',
    preferred_contact_method: 'email'
  })

  const [showContactForm, setShowContactForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('clients').insert([{
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        // Ensure pricing fields are included
        pricing_model: formData.pricing_model,
        hourly_rate: formData.hourly_rate,
        daily_rate: formData.daily_rate,
        retainer_amount: formData.retainer_amount,
        retainer_hours: formData.retainer_hours,
        overage_hourly_rate: formData.overage_hourly_rate
      }])

      if (error) throw error
      toast.success('Client added successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error('Failed to add client')
    }
  }

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
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Enter client name"
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
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Enter company name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-text-header font-medium">
            Business Description
          </label>
          <textarea
            value={formData.business_description}
            onChange={e => setFormData({ ...formData, business_description: e.target.value })}
            className="w-full p-3 rounded-md border-2 border-mint-light 
                     focus:border-mint focus:ring-2 focus:ring-mint/30
                     bg-gray-50 text-text-header placeholder:text-gray-400
                     min-h-[100px]"
            placeholder="Describe the business (max 200 words)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-text-header font-medium">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={e => setFormData({ ...formData, industry: e.target.value })}
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Enter industry"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-header font-medium">Company Size</label>
            <select
              value={formData.company_size}
              onChange={e => setFormData({ ...formData, company_size: e.target.value })}
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501+">501+ employees</option>
            </select>
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
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Enter email address"
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
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Enter phone number"
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
                     bg-gray-50 text-text-header placeholder:text-gray-400"
            placeholder="Enter website URL"
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
              <label className="block text-text-header font-medium">
                Name <span className="text-orange">*</span>
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-white text-text-header"
                placeholder="Contact name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-text-header font-medium">
                Email <span className="text-orange">*</span>
              </label>
              <input
                type="email"
                value={newContact.email}
                onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full p-3 rounded-md border-2 border-mint-light 
                         focus:border-mint focus:ring-2 focus:ring-mint/30
                         bg-white text-text-header"
                placeholder="Contact email"
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
                         bg-white text-text-header"
                placeholder="Job title"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="px-4 py-2 text-text-body hover:text-orange transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddContact}
                className="px-4 py-2 bg-mint hover:bg-mint-dark text-white rounded-md"
              >
                Add Contact
              </button>
            </div>
          </div>
        )}

        {!showContactForm && (
          <button
            type="button"
            onClick={() => setShowContactForm(true)}
            className="w-full p-3 border-2 border-dashed border-mint-light hover:border-mint
                     text-text-body hover:text-mint rounded-md transition-colors"
          >
            + Add Contact
          </button>
        )}
      </div>

      {/* Pricing & Payment Information - Moved down */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-orange border-l-4 border-orange pl-3">
          Pricing & Payment Information
        </h3>
        
        <div className="space-y-4">
          {/* Pricing Model */}
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

          {/* Currency Selection */}
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

          {/* Payment Terms - Always at the end */}
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
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-header font-medium">Address Line 2</label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={e => setFormData({ ...formData, address_line2: e.target.value })}
              className="w-full p-3 rounded-md border-2 border-mint-light 
                       focus:border-mint focus:ring-2 focus:ring-mint/30
                       bg-gray-50 text-text-header placeholder:text-gray-400"
              placeholder="Suite, unit, building, etc."
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
                         bg-gray-50 text-text-header placeholder:text-gray-400"
                placeholder="City"
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
                         bg-gray-50 text-text-header placeholder:text-gray-400"
                placeholder="State/Province"
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
                         bg-gray-50 text-text-header placeholder:text-gray-400"
                placeholder="Postal code"
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
                         bg-gray-50 text-text-header placeholder:text-gray-400"
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-mint-light">
        <button
          type="submit"
          className="px-6 py-3 bg-orange hover:bg-orange-dark text-white 
                   font-medium rounded-md shadow-sm transition-colors"
        >
          Add Client
        </button>
      </div>
    </form>
  )
} 