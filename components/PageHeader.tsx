'use client'

import { usePathname } from 'next/navigation'

const pageTitles: { [key: string]: string } = {
  '/home': 'Home',
  '/dashboard': 'Dashboard',
  '/dashboard/clients': 'Clients',
  '/dashboard/tasks': 'Tasks',
  '/training': 'Training',
  '/prospecting': 'Prospecting'
}

export function PageHeader() {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || ''

  return pageTitle ? (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            VA Assistant {pageTitle && `/ ${pageTitle}`}
          </h1>
        </div>
      </div>
    </div>
  ) : null
} 