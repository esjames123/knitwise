'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    router.push('/')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: '#242220' }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="mb-10 text-3xl tracking-tight"
        style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}
      >
        Knit<em style={{ color: '#D4A5A0', fontStyle: 'italic' }}>wise</em>
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
      >
        <h1
          className="mb-1 text-2xl font-bold"
          style={{ color: '#f5f0eb' }}
        >
          Welcome back
        </h1>
        <p className="mb-7 text-sm" style={{ color: '#9a8e87' }}>
          Log in to your Knitwise account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: '#c4b8ae' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: '#38342f',
                border: '1px solid #4a4440',
                color: '#f5f0eb',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A5A0')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: '#c4b8ae' }}
              >
                Password
              </label>
              <Link
                href="#"
                className="text-xs transition-colors"
                style={{ color: '#D4A5A0' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: '#38342f',
                border: '1px solid #4a4440',
                color: '#f5f0eb',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#D4A5A0')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg px-3 py-2.5 text-sm"
               style={{ backgroundColor: '#3a1f1a', border: '1px solid #7a3020', color: '#f08070' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity"
            style={{ backgroundColor: '#D4A5A0', opacity: pending ? 0.6 : 1 }}
          >
            {pending ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {/* Switch to signup */}
        <p className="mt-6 text-center text-sm" style={{ color: '#7a6e67' }}>
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium" style={{ color: '#D4A5A0' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
