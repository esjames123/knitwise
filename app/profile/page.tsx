'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
    >
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#7a6e67' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5"
         style={{ borderBottom: '1px solid #3a3530' }}>
      <span className="text-sm" style={{ color: '#9a8e87' }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: '#f5f0eb' }}>{value}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl py-5 px-4 text-center"
         style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }}>
      <span className="text-3xl font-bold" style={{ color: '#C06B45' }}>{value}</span>
      <span className="mt-1 text-xs" style={{ color: '#9a8e87' }}>{label}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser]               = useState<User | null>(null)
  const [savedCount, setSavedCount]   = useState<number | null>(null)
  const [loading, setLoading]         = useState(true)

  // Email update form
  const [newEmail, setNewEmail]       = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailError, setEmailError]   = useState('')

  // Delete account confirmation
  const [deleteStep, setDeleteStep]   = useState<'idle' | 'confirm'>('idle')

  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      if (!cancelled) setUser(session.user)

      const { count } = await supabase
        .from('saved_patterns')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      if (!cancelled) {
        setSavedCount(count ?? 0)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newEmail.trim()
    if (!trimmed || trimmed === user?.email) return

    setEmailStatus('sending')
    setEmailError('')

    const { error } = await supabase.auth.updateUser({ email: trimmed })

    if (error) {
      setEmailError(error.message)
      setEmailStatus('error')
    } else {
      setEmailStatus('sent')
      setNewEmail('')
    }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
        <Nav />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-4">
          {[180, 140, 200, 120].map((h, i) => (
            <div key={i} className="animate-pulse rounded-2xl"
                 style={{ height: h, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between pb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>My Account</h1>
          <button
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#C06B45')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#4a4440')}
          >
            Log out
          </button>
        </div>

        {/* ── Account info ── */}
        <Section title="Account">
          <div className="divide-y" style={{ borderColor: '#3a3530' }}>
            <Row label="Email" value={user.email ?? '—'} />
            <Row label="Joined"       value={formatDate(user.created_at)} />
            <Row label="Last sign-in" value={formatDate(user.last_sign_in_at)} />
            <Row
              label="Email verified"
              value={
                user.email_confirmed_at
                  ? <span style={{ color: '#6dcfa0' }}>Verified</span>
                  : <span style={{ color: '#e0a090' }}>Not verified</span>
              }
            />
          </div>
        </Section>

        {/* ── Stats ── */}
        <Section title="Stats">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Patterns saved"
              value={savedCount ?? '—'}
            />
            <StatCard
              label="Searches"
              value={<span style={{ color: '#7a6e67', fontSize: '1.25rem' }}>—</span>}
            />
          </div>
          <p className="mt-3 text-xs text-center" style={{ color: '#5a504a' }}>
            Search history tracking coming soon.
          </p>
        </Section>

        {/* ── Update email ── */}
        <Section title="Update email">
          {emailStatus === 'sent' ? (
            <div className="rounded-xl px-4 py-3 text-sm text-center"
                 style={{ backgroundColor: '#1a3a2a', border: '1px solid #2a5a3a', color: '#6dcfa0' }}>
              Confirmation email sent. Check your inbox to complete the change.
            </div>
          ) : (
            <form onSubmit={handleUpdateEmail} className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-sm" style={{ color: '#9a8e87' }}>
                  New email address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailStatus('idle'); setEmailError('') }}
                  placeholder={user.email ?? 'you@example.com'}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#38342f',
                    border: `1px solid ${emailStatus === 'error' ? '#e05050' : '#4a4440'}`,
                    color: '#f5f0eb',
                  }}
                  onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
                  onBlur={e   => (e.currentTarget.style.borderColor = emailStatus === 'error' ? '#e05050' : '#4a4440')}
                />
                {emailStatus === 'error' && (
                  <p className="mt-1.5 text-xs" style={{ color: '#e0a090' }}>{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={emailStatus === 'sending' || !newEmail.trim() || newEmail.trim() === user.email}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: '#C06B45' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#A8572F' }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
              >
                {emailStatus === 'sending' ? 'Sending confirmation…' : 'Send confirmation email'}
              </button>

              <p className="text-xs" style={{ color: '#5a504a' }}>
                A confirmation link will be sent to your new address. Your email won't change until you click it.
              </p>
            </form>
          )}
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Danger zone">
          {deleteStep === 'idle' ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#f5f0eb' }}>Delete account</p>
                <p className="mt-0.5 text-xs" style={{ color: '#7a6e67' }}>
                  Permanently remove your account and all saved patterns.
                </p>
              </div>
              <button
                onClick={() => setDeleteStep('confirm')}
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a', color: '#e08080' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#e05050')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#6a2a2a')}
              >
                Delete account
              </button>
            </div>
          ) : (
            <div className="rounded-xl p-4 space-y-4"
                 style={{ backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a' }}>
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="#e08080" strokeWidth="2" strokeLinecap="round"
                     className="mt-0.5 shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#e08080' }}>
                    Account deletion is not available yet
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: '#b07070' }}>
                    This feature will be added in a future update. To request manual deletion in the meantime, contact support.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteStep('idle')}
                className="text-xs transition-colors"
                style={{ color: '#7a6e67' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c4b8ae')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7a6e67')}
              >
                ← Cancel
              </button>
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}
