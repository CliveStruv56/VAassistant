import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Your Virtual Assistant Business
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Track time, manage clients, and grow your business with our all-in-one platform.
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login"
                className="inline-flex items-center px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Get Started
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Image
              src="/landing-image.jpg"
              alt="Virtual Assistant Dashboard"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-2xl"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
} 