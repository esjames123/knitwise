'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    setSuccess(true)
    setPending(false)
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
        Knit<em style={{ color: '#C06B45', fontStyle: 'italic' }}>wise</em>
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
          Create your account
        </h1>
        <p className="mb-7 text-sm" style={{ color: '#9a8e87' }}>
          Start finding your next beautiful make.
        </p>

        {success ? (
          <div
            className="rounded-xl px-4 py-4 text-sm"
            style={{ backgroundColor: '#2d3a2a', border: '1px solid #4a7a40', color: '#a3d99a' }}
          >
            <p className="font-semibold">Check your email</p>
            <p className="mt-1" style={{ color: '#7ab870' }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
          </div>
        ) : (
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
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C06B45')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#4a4440')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: '#c4b8ae' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#38342f',
                  border: '1px solid #4a4440',
                  color: '#f5f0eb',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C06B45')}
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
              style={{ backgroundColor: '#C06B45', opacity: pending ? 0.6 : 1 }}
            >
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        {/* Switch to login */}
        <p className="mt-6 text-center text-sm" style={{ color: '#7a6e67' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: '#C06B45' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
