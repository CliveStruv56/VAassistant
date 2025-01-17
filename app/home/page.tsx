'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // If user is logged in, redirect to dashboard
          router.push('/dashboard')
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EEEEEE]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-[#333333]">
          Welcome to VA Assistant
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-[#7CCDB0]">
          <h2 className="text-2xl font-semibold mb-4 text-[#333333]">
            Get Started
          </h2>
          <p className="text-[#666666] mb-6">
            Streamline your virtual assistant workflow with our comprehensive management tools.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-mint hover:bg-mint-dark text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
} 