'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/time-tracker', label: 'Time Tracker' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/dashboard/tasks', label: 'Tasks' },
  { href: '/training', label: 'Training' },
  { href: '/prospecting', label: 'Prospecting' }
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Don't show nav on login page
  if (pathname === '/login') return null

  return (
    <nav className="bg-mint shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/home" className="text-xl font-bold text-text-header hover:text-white transition-colors">
              VA Assistant
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {isLoggedIn ? (
                  navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-all',
                        pathname === item.href
                          ? 'bg-orange text-white shadow-md'
                          : 'text-text-header hover:bg-mint-dark hover:text-white'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-text-header hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-orange text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-dark transition-colors shadow-md"
              >
                Login
              </Link>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">
                  {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                </span>
                {isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-mint-100" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoggedIn ? (
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-all',
                    pathname === item.href
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'text-brand-dark hover:bg-mint-200'
                  )}
                >
                  {item.label}
                </Link>
              ))
            ) : null}
          </div>
        </div>
      )}
    </nav>
  )
} 