"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '../../../lib/auth'
import { CheckCircle } from 'lucide-react'

export default function CompletePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoLive() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:3001/merchant/onboarding/complete', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

      router.push('/dashboard')
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full bg-gray-950" />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-950">You&apos;re all set</h1>
        <p className="text-sm text-gray-400 mt-1">Your restaurant is ready to accept USDC payments.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-6">
        <CheckCircle size={48} className="text-green-500" />

        <div className="text-center flex flex-col gap-1">
          {[
            'Restaurant profile saved',
            'Wallet verified',
            'Ready to accept payments',
          ].map(item => (
            <p key={item} className="text-sm text-gray-600 flex items-center gap-2 justify-center">
              <span className="text-green-500">✓</span> {item}
            </p>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 w-full text-center">{error}</p>}

        <button
          onClick={handleGoLive}
          disabled={loading}
          className="w-full bg-gray-950 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Setting up…' : 'Go to dashboard'}
        </button>
      </div>
    </div>
  )
}
