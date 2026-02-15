'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div
        className="w-full max-w-sm mx-4 rounded-2xl border p-8"
        style={{
          backgroundColor: '#141414',
          borderColor: '#2A2A2A',
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl"
            style={{
              background: 'linear-gradient(135deg, #E85A2C, #8B2E1A)',
            }}
          >
            O
          </div>
          <h1 className="text-xl font-semibold text-white">
            Outloud Content Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9A9A9A' }}>
            Sign in to manage your content
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px mb-6" style={{ backgroundColor: '#2A2A2A' }} />

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isLoading ? '#1A1A1A' : '#1A1A1A',
            border: '1px solid #2A2A2A',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = '#3A3A3A'
              e.currentTarget.style.backgroundColor = '#222222'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2A2A2A'
            e.currentTarget.style.backgroundColor = '#1A1A1A'
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.64 9.2045C17.64 8.5664 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z"
              fill="#4285F4"
            />
            <path
              d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.96409 10.71C3.78409 10.17 3.68182 9.5932 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9255L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Redirecting...' : 'Sign in with Google'}
        </button>

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: '#6A6A6A' }}>
          Access restricted to Outloud team members
        </p>
      </div>
    </div>
  )
}
