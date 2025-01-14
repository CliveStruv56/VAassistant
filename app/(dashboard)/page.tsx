'use client'

import * as React from 'react'
import { supabase } from '../../lib/supabase/client'

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {user && (
        <div>
          <p>Welcome, {user.email}</p>
        </div>
      )}
    </div>
  )
} 