import * as React from 'react'
import './globals.css'
import { MainNav } from '@/components/MainNav'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'VA Assistant',
  description: 'Virtual Assistant Time Tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4">
            <MainNav />
          </div>
        </header>
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 