"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '../../../lib/auth'
import bs58 from 'bs58'

export default function WalletPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'connecting' | 'signing' | 'verifying' | 'done'>('idle')
  const [error, setError] = useState('')

  async function handleConnect() {
    setError('')
    setStatus('connecting')

    try {
      // @ts-ignore — window.solana injected by Phantom
      const provider = window.solana
      if (!provider?.isPhantom) {
        setError('Phantom wallet not found. Please install the Phantom browser extension.')
        setStatus('idle')
        return
      }

      await provider.connect()
      const walletAddress = provider.publicKey.toString()

      // get challenge from backend
      setStatus('signing')
      const challengeRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/merchant/onboarding/wallet/challenge', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const { message } = await challengeRes.json()

      // ask Phantom to sign it
      const encodedMessage = new TextEncoder().encode(message)
      const { signature } = await provider.signMessage(encodedMessage, 'utf8')

      // encode signature as bs58
      const bs58Signature = bs58.encode(signature as Uint8Array)

      // verify on backend
      setStatus('verifying')
      const verifyRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/merchant/onboarding/wallet/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ walletAddress, signature: bs58Signature })
      })

      const data = await verifyRes.json()
      if (!verifyRes.ok) { setError(data.error ?? 'Verification failed'); setStatus('idle'); return }

      setStatus('done')
      setTimeout(() => router.push('/onboarding/complete'), 1000)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong')
      setStatus('idle')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= 2 ? 'bg-gray-950' : 'bg-gray-200'}`} />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-950">Connect your wallet</h1>
        <p className="text-sm text-gray-400 mt-1">This is where you&apos;ll receive USDC payments from customers.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
          <img src="https://phantom.app/favicon.ico" alt="Phantom" className="w-8 h-8" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-950">Phantom Wallet</p>
          <p className="text-xs text-gray-400 mt-1">
            You&apos;ll be asked to sign a message — this is free and doesn&apos;t cost any SOL.
          </p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 w-full text-center">{error}</p>}

        <button
          onClick={handleConnect}
          disabled={status !== 'idle'}
          className="w-full bg-gray-950 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {{
            idle:       'Connect Phantom',
            connecting: 'Connecting…',
            signing:    'Waiting for signature…',
            verifying:  'Verifying…',
            done:       'Verified ✓',
          }[status]}
        </button>
      </div>
    </div>
  )
}
