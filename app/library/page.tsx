'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'

type SavedPattern = {
  id: string
  pattern_id: number
  pattern_name: string
  designer_name: string | null
  permalink: string
  photo_url: string | null
  created_at: string
}

type FavoriteDesigner = {
  id: string
  ravelry_designer_id: number
  designer_name: string
  designer_bio: string | null
  designer_photo_url: string | null
  follower_count: number | null
  ravelry_permalink: string | null
  created_at: string
}

function TrashIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function CardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
    >
      <div className="animate-pulse" style={{ height: 180, backgroundColor: '#38342f' }} />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
        <div className="h-4 w-1/2 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
        <div className="h-9 w-full animate-pulse rounded-lg" style={{ backgroundColor: '#38342f' }} />
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const [patterns, setPatterns]           = useState<SavedPattern[]>([])
  const [loading, setLoading]             = useState(true)
  const [deletingId, setDeletingId]       = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const tokenRef                          = useRef<string | null>(null)

  const [designers, setDesigners]                   = useState<FavoriteDesigner[]>([])
  const [newDesigner, setNewDesigner]               = useState('')
  const [addingDesigner, setAddingDesigner]         = useState(false)
  const [removingDesignerId, setRemovingDesignerId] = useState<string | null>(null)
  const [designerError, setDesignerError]           = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      tokenRef.current = session.access_token

      const [patternsRes, designersRes] = await Promise.all([
        fetch('/api/patterns/saved', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        supabase
          .from('favorite_designers')
          .select('id, ravelry_designer_id, designer_name, designer_bio, designer_photo_url, follower_count, ravelry_permalink, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
      ])

      if (cancelled) return

      if (!patternsRes.ok) {
        setError('Could not load your library. Please try again.')
        setLoading(false)
        return
      }

      setPatterns(await patternsRes.json())
      setDesigners(designersRes.data ?? [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [router])

  async function handleAddDesigner(e: React.FormEvent) {
    e.preventDefault()
    const name = newDesigner.trim()
    if (!name) return

    setAddingDesigner(true)
    setDesignerError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    const res = await fetch('/api/designers/favorite', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ designer_name: name }),
    })

    const json = await res.json()

    if (!res.ok) {
      setDesignerError(
        res.status === 409 ? 'Already in your favorites.' :
        res.status === 404 ? `Could not find "${name}" on Ravelry.` :
        'Could not add designer.'
      )
    } else {
      setDesigners(prev => [json, ...prev])
      setNewDesigner('')
    }

    setAddingDesigner(false)
  }

  async function handleRemoveDesigner(id: string) {
    if (removingDesignerId) return
    setRemovingDesignerId(id)

    await supabase.from('favorite_designers').delete().eq('id', id)
    setDesigners(prev => prev.filter(d => d.id !== id))
    setRemovingDesignerId(null)
  }

  async function handleDelete(rowId: string) {
    if (deletingId) return

    // Re-check session in case it refreshed
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    setDeletingId(rowId)

    const res = await fetch(`/api/patterns/saved/${rowId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (res.ok) {
      setPatterns(prev => prev.filter(p => p.id !== rowId))
    } else {
      console.error('[Library] delete failed:', res.status)
    }

    setDeletingId(null)
  }

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>My Library</h1>
            {!loading && !error && (
              <p className="mt-1 text-sm" style={{ color: '#7a6e67' }}>
                {patterns.length} {patterns.length === 1 ? 'pattern' : 'patterns'} saved
              </p>
            )}
          </div>
          <Link
            href="/search"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors bg-[#C06B45] hover:bg-[#A8572F]"
          >
            Find patterns
          </Link>
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="rounded-xl px-6 py-4 text-center text-sm"
            style={{ backgroundColor: '#3a2218', border: '1px solid #C06B45', color: '#e0a090' }}
          >
            {error}
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && patterns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="#4a4440" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="mb-4"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>No saved patterns yet</p>
            <p className="mt-1 text-sm" style={{ color: '#5a504a' }}>
              Hit the heart on any search result to save it here.
            </p>
            <Link
              href="/search"
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-[#C06B45] hover:bg-[#A8572F] transition-colors"
            >
              Search patterns
            </Link>
          </div>
        )}

        {/* ── Favorite Designers ── */}
        {!loading && !error && (
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>Favorite Designers</h2>
                {designers.length > 0 && (
                  <p className="mt-0.5 text-sm" style={{ color: '#7a6e67' }}>
                    {designers.length} {designers.length === 1 ? 'designer' : 'designers'}
                  </p>
                )}
              </div>
            </div>

            {/* Add form */}
            <form onSubmit={handleAddDesigner} className="mb-5 flex gap-2">
              <input
                type="text"
                value={newDesigner}
                onChange={e => { setNewDesigner(e.target.value); setDesignerError(null) }}
                placeholder="Designer name…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: '#38342f',
                  border: `1px solid ${designerError ? '#e05050' : '#4a4440'}`,
                  color: '#f5f0eb',
                }}
                onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
                onBlur={e   => (e.currentTarget.style.borderColor = designerError ? '#e05050' : '#4a4440')}
              />
              <button
                type="submit"
                disabled={addingDesigner || !newDesigner.trim()}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ backgroundColor: '#C06B45' }}
              >
                {addingDesigner ? 'Adding…' : 'Add'}
              </button>
            </form>
            {designerError && (
              <p className="mb-4 text-xs" style={{ color: '#e0a090' }}>{designerError}</p>
            )}

            {/* Designer cards */}
            {designers.length === 0 ? (
              <p className="text-sm" style={{ color: '#5a504a' }}>
                No favorite designers yet. Add one above.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {designers.map(d => (
                  <div
                    key={d.id}
                    className="flex gap-3 rounded-xl p-3"
                    style={{
                      backgroundColor: '#38342f',
                      border: '1px solid #4a4440',
                      opacity: removingDesignerId === d.id ? 0.4 : 1,
                      transition: 'opacity 150ms',
                    }}
                  >
                    {/* Photo */}
                    <div
                      className="flex-shrink-0 rounded-full overflow-hidden"
                      style={{ width: 48, height: 48, backgroundColor: '#2e2b28' }}
                    >
                      {d.designer_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.designer_photo_url}
                          alt={d.designer_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-sm font-bold"
                          style={{ color: '#C06B45' }}
                        >
                          {d.designer_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/search?q=${encodeURIComponent(d.designer_name)}`}
                          className="text-sm font-semibold leading-snug truncate transition-colors hover:text-white"
                          style={{ color: '#f5f0eb' }}
                        >
                          {d.designer_name}
                        </Link>
                        <button
                          onClick={() => handleRemoveDesigner(d.id)}
                          disabled={!!removingDesignerId}
                          aria-label={`Remove ${d.designer_name}`}
                          className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full transition-colors"
                          style={{ color: '#5a504a' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#e08080')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#5a504a')}
                        >
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none"
                               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M2 2l8 8M10 2l-8 8" />
                          </svg>
                        </button>
                      </div>
                      {d.follower_count != null && (
                        <p className="text-xs mt-0.5" style={{ color: '#7a6e67' }}>
                          {d.follower_count.toLocaleString()} followers
                        </p>
                      )}
                      {d.designer_bio && (
                        <p
                          className="text-xs mt-1 leading-relaxed line-clamp-2"
                          style={{ color: '#9a8e87' }}
                        >
                          {d.designer_bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && patterns.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patterns.map(pattern => {
                const isDeleting = deletingId === pattern.id
                return (
                  <div
                    key={pattern.id}
                    className="flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                    style={{
                      backgroundColor: '#2e2b28',
                      border: '1px solid #3a3530',
                      opacity: isDeleting ? 0.5 : 1,
                      transition: 'opacity 200ms, transform 150ms',
                    }}
                  >
                    {/* Image / placeholder */}
                    <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
                      {pattern.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pattern.photo_url}
                          alt={pattern.pattern_name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 50%, #8b4a2a 100%)',
                            opacity: 0.7,
                          }}
                        />
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(pattern.id)}
                        disabled={!!deletingId}
                        aria-label="Remove from library"
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
                        style={{
                          backgroundColor: isDeleting ? '#8b4a2a' : 'rgba(26,23,20,0.70)',
                          border: '1px solid rgba(255,255,255,0.18)',
                          backdropFilter: 'blur(6px)',
                          cursor: deletingId ? 'wait' : 'pointer',
                        }}
                      >
                        {isDeleting ? <SpinnerIcon /> : <TrashIcon />}
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-5 gap-3">
                      <div>
                        <h2 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
                          {pattern.pattern_name}
                        </h2>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm" style={{ color: '#9a8e87' }}>
                          {pattern.designer_name && <span>by {pattern.designer_name}</span>}
                          {pattern.designer_name && <span aria-hidden="true">·</span>}
                          <RavelryCardCredit />
                        </p>
                      </div>

                      <div className="mt-auto pt-2">
                        <Link
                          href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ravelry-link block rounded-lg py-2 text-center text-sm font-semibold transition-colors text-white"
                        >
                          View on Ravelry →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <RavelryFooter />
          </>
        )}
      </div>
    </div>
  )
}
