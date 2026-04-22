'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const card = { backgroundColor: '#2e2b28', border: '1px solid #3a3530', borderRadius: '1rem', padding: '1.5rem' }
const label = { color: '#9a8e87', fontSize: '0.875rem' }
const value = { color: '#f5f0eb', fontSize: '0.875rem', fontWeight: 500 }
const divider = { borderBottom: '1px solid #3a3530' }
const sectionTitle = { color: '#7a6e67', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '1.25rem' }

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser]             = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  // Email update
  const [newEmail, setNewEmail]       = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [emailError, setEmailError]   = useState('')

  // Delete warning
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      if (cancelled) return
      setUser(session.user)
      const { count } = await supabase
        .from('saved_patterns')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
      if (!cancelled) { setSavedCount(count ?? 0); setLoading(false) }
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
    if (error) { setEmailError(error.message); setEmailStatus('error') }
    else { setEmailStatus('sent'); setNewEmail('') }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#242220', minHeight: '100vh' }}>
        <Nav />
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
          {[160, 120, 200].map((h, i) => (
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

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-5">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#f5f0eb' }}>My Account</h1>
          <button onClick={handleLogout}
            style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae', borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Log out
          </button>
        </div>

        {/* Account */}
        <div style={card}>
          <p style={sectionTitle}>Account</p>
          {[
            { label: 'Email', val: user.email ?? '—' },
            { label: 'Joined', val: formatDate(user.created_at) },
            { label: 'Last sign-in', val: formatDate(user.last_sign_in_at) },
            { label: 'Email verified', val: user.email_confirmed_at
                ? <span style={{ color: '#6dcfa0' }}>Verified</span>
                : <span style={{ color: '#e0a090' }}>Not verified</span> },
          ].map(({ label: l, val }, i, arr) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', padding: '0.625rem 0', ...(i < arr.length - 1 ? divider : {}) }}>
              <span style={label}>{l}</span>
              <span style={value}>{val}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={card}>
          <p style={sectionTitle}>Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Patterns saved', val: savedCount ?? '—' },
              { label: 'Searches', val: '—' },
            ].map(({ label: l, val }) => (
              <div key={l} style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', borderRadius: '0.75rem', padding: '1.25rem 1rem', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.875rem', fontWeight: 700, color: '#C06B45' }}>{val}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#9a8e87', marginTop: '0.25rem' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Update email */}
        <div style={card}>
          <p style={sectionTitle}>Update email</p>
          {emailStatus === 'sent' ? (
            <div style={{ backgroundColor: '#1a3a2a', border: '1px solid #2a5a3a', color: '#6dcfa0', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              Confirmation sent — check your inbox to complete the change.
            </div>
          ) : (
            <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ ...label, display: 'block', marginBottom: '0.375rem' }}>New email address</label>
                <input
                  type="email" required
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailStatus('idle'); setEmailError('') }}
                  placeholder={user.email ?? 'you@example.com'}
                  style={{ width: '100%', backgroundColor: '#38342f', border: `1px solid ${emailStatus === 'error' ? '#e05050' : '#4a4440'}`, color: '#f5f0eb', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
                {emailStatus === 'error' && <p style={{ color: '#e0a090', fontSize: '0.75rem', marginTop: '0.375rem' }}>{emailError}</p>}
              </div>
              <button type="submit"
                disabled={emailStatus === 'sending' || !newEmail.trim() || newEmail.trim() === user.email}
                style={{ backgroundColor: '#C06B45', color: 'white', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: emailStatus === 'sending' ? 0.6 : 1 }}>
                {emailStatus === 'sending' ? 'Sending…' : 'Send confirmation email'}
              </button>
              <p style={{ color: '#5a504a', fontSize: '0.75rem' }}>Your email won't change until you click the confirmation link.</p>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div style={card}>
          <p style={sectionTitle}>Danger zone</p>
          {!showDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ color: '#f5f0eb', fontSize: '0.875rem', fontWeight: 500 }}>Delete account</p>
                <p style={{ color: '#7a6e67', fontSize: '0.75rem', marginTop: '0.25rem' }}>Permanently remove your account and all saved patterns.</p>
              </div>
              <button onClick={() => setShowDelete(true)}
                style={{ flexShrink: 0, backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a', color: '#e08080', borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Delete account
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a', borderRadius: '0.75rem', padding: '1rem' }}>
              <p style={{ color: '#e08080', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Account deletion is not available yet</p>
              <p style={{ color: '#b07070', fontSize: '0.75rem', marginBottom: '1rem', lineHeight: 1.5 }}>This feature will be added in a future update. Contact support to request manual deletion.</p>
              <button onClick={() => setShowDelete(false)}
                style={{ background: 'none', border: 'none', color: '#7a6e67', fontSize: '0.75rem', cursor: 'pointer' }}>
                ← Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
