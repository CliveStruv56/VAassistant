'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import { PageHeader } from '@/components/PageHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 