'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'
import { DesignerPopover } from '@/app/ui/designer-popover'
import { CollectionForm } from '@/app/ui/collection-form'
import type { CollectionPayload } from '@/app/ui/collection-form'
import { NotesModal } from '@/app/ui/notes-modal'
import { StashBuster } from '@/app/ui/stash-buster'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'

type SavedPattern = {
  id: string
  pattern_id: number
  pattern_name: string
  designer_name: string | null
  permalink: string
  photo_url: string | null
  collection_id: string | null
  notes: string | null
  updated_at: string | null
  created_at: string
}

type Collection = {
  id: string
  name: string
  description: string | null
  color: string
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
         strokeLinecap="round" className="animate-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>
      <div className="animate-pulse" style={{ height: 180, backgroundColor: '#38342f' }} />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
        <div className="h-4 w-1/2 animate-pulse rounded" style={{ backgroundColor: '#38342f' }} />
        <div className="h-9 w-full animate-pulse rounded-lg" style={{ backgroundColor: '#38342f' }} />
      </div>
    </div>
  )
}

// ── Collection picker popover on each pattern card ──────────────────────────

function CollectionPicker({
  pattern,
  collections,
  onAssign,
}: {
  pattern: SavedPattern
  collections: Collection[]
  onAssign: (patternId: string, collectionId: string | null) => Promise<void>
}) {
  const [open, setOpen]       = useState(false)
  const [opensUp, setOpensUp] = useState(false)
  const [saving, setSaving]   = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef  = useRef<HTMLButtonElement>(null)

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Estimate: header row + (N items × 36px) + 8px padding, capped at 280
      const estimatedHeight = Math.min((collections.length + 2) * 36 + 40, 280)
      setOpensUp(window.innerHeight - rect.bottom < estimatedHeight + 8)
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onScroll() { setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    // close if user scrolls (position would drift)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [open])

  async function pick(collectionId: string | null) {
    setSaving(true)
    await onAssign(pattern.id, collectionId)
    setSaving(false)
    setOpen(false)
  }

  const current = collections.find(c => c.id === pattern.collection_id)

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={saving}
        title={current ? `Collection: ${current.name}` : 'Add to collection'}
        className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#3a3530] disabled:opacity-40"
        style={{ color: current ? current.color : '#5a504a' }}
      >
        {saving ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill={current ? 'currentColor' : 'none'}
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="absolute rounded-xl shadow-xl"
          style={{
            backgroundColor: '#2a2724',
            border: '1px solid #4a4440',
            minWidth: '180px',
            maxHeight: '280px',
            overflowY: 'auto',
            right: 0,
            zIndex: 200,
            // flip upward when near bottom of viewport
            ...(opensUp
              ? { bottom: 'calc(100% + 6px)' }
              : { top:    'calc(100% + 6px)' }),
          }}
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
             style={{ color: '#7a6e67', borderBottom: '1px solid #3a3530' }}>
            Move to collection
          </p>

          <button
            onClick={() => pick(null)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[#3a3530]"
            style={{ color: !pattern.collection_id ? '#f5f0eb' : '#9a8e87' }}
          >
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#4a4440' }} />
            No collection
            {!pattern.collection_id && <span className="ml-auto text-xs" style={{ color: '#C06B45' }}>✓</span>}
          </button>

          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[#3a3530]"
              style={{ color: pattern.collection_id === c.id ? '#f5f0eb' : '#9a8e87' }}
            >
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }} />
              {c.name}
              {pattern.collection_id === c.id && (
                <span className="ml-auto text-xs" style={{ color: '#C06B45' }}>✓</span>
              )}
            </button>
          ))}

          {collections.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: '#5a504a' }}>
              No collections yet
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter()

  // Patterns
  const [patterns, setPatterns]     = useState<SavedPattern[]>([])
  const [loading, setLoading]       = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const tokenRef                    = useRef<string | null>(null)

  // Notes modal
  const [notesPattern, setNotesPattern] = useState<SavedPattern | null>(null)

  // Collections
  const [collections, setCollections]           = useState<Collection[]>([])
  const [selectedCollId, setSelectedCollId]     = useState<string | 'uncategorized' | null>(null)
  const [showCollForm, setShowCollForm]         = useState(false)
  const [editingColl, setEditingColl]           = useState<Collection | null>(null)
  const [deletingCollId, setDeletingCollId]     = useState<string | null>(null)

  // Toast
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const toastTimer              = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, ok: boolean) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, ok })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  // Favorite designers
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

      const [patternsRes, designersRes, collectionsRes] = await Promise.all([
        fetch('/api/patterns/saved', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        supabase
          .from('favorite_designers')
          .select('id, ravelry_designer_id, designer_name, designer_bio, designer_photo_url, follower_count, ravelry_permalink, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        fetch('/api/collections', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ])

      if (cancelled) return

      if (!patternsRes.ok) {
        setError('Could not load your library. Please try again.')
        setLoading(false)
        return
      }

      setPatterns(await patternsRes.json())
      setDesigners(designersRes.data ?? [])
      if (collectionsRes.ok) setCollections(await collectionsRes.json())
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [router])

  // ── Collection CRUD ─────────────────────────────────────────────────────────

  async function handleCreateCollection(payload: CollectionPayload) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error ?? 'Could not create collection')
    }
    const created: Collection = await res.json()
    setCollections(prev => [...prev, created])
    setSelectedCollId(created.id)
  }

  async function handleEditCollection(payload: CollectionPayload) {
    if (!editingColl) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    const res = await fetch(`/api/collections/${editingColl.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error ?? 'Could not update collection')
    }
    const updated: Collection = await res.json()
    setCollections(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleDeleteCollection(id: string) {
    if (deletingCollId) return
    setDeletingCollId(id)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    await fetch(`/api/collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    setCollections(prev => prev.filter(c => c.id !== id))
    // Clear collection_id from any patterns that were in this collection
    setPatterns(prev => prev.map(p => p.collection_id === id ? { ...p, collection_id: null } : p))
    if (selectedCollId === id) setSelectedCollId(null)
    setDeletingCollId(null)
  }

  // ── Pattern → collection assignment ────────────────────────────────────────

  async function handleAssignCollection(patternId: string, collectionId: string | null) {
    const collName = collectionId
      ? (collections.find(c => c.id === collectionId)?.name ?? collectionId)
      : 'none'
    console.log('[Library] assign pattern', patternId, '→ collection', collName)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    const url = collectionId
      ? `/api/collections/${collectionId}/patterns`
      : `/api/patterns/saved/${patternId}`
    const body = collectionId
      ? { pattern_id: patternId }
      : { collection_id: null }

    console.log('[Library] PATCH', url, body)

    let res: Response
    try {
      res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (err) {
      console.error('[Library] assign network error:', err)
      showToast('Network error — could not move pattern', false)
      return
    }

    if (res.ok) {
      console.log('[Library] assign success')
      setPatterns(prev =>
        prev.map(p => p.id === patternId ? { ...p, collection_id: collectionId } : p)
      )
      showToast(
        collectionId ? `Moved to "${collName}"` : 'Removed from collection',
        true
      )
    } else {
      let errMsg = `HTTP ${res.status}`
      try { const j = await res.json(); errMsg = j.error ?? errMsg } catch { /* ignore */ }
      console.error('[Library] assign failed:', res.status, errMsg)
      showToast(`Could not move pattern: ${errMsg}`, false)
    }
  }

  // ── Notes ───────────────────────────────────────────────────────────────────

  async function handleSaveNotes(patternId: string, notes: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }

    const res = await fetch(`/api/patterns/saved/${patternId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error ?? `HTTP ${res.status}`)
    }

    setPatterns(prev =>
      prev.map(p => p.id === patternId ? { ...p, notes: notes.trim() || null } : p)
    )
  }

  // ── Pattern delete ──────────────────────────────────────────────────────────

  async function handleDelete(rowId: string) {
    if (deletingId) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }
    setDeletingId(rowId)

    const res = await fetch(`/api/patterns/saved/${rowId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) setPatterns(prev => prev.filter(p => p.id !== rowId))
    else console.error('[Library] delete failed:', res.status)
    setDeletingId(null)
  }

  // ── Favorite designers ──────────────────────────────────────────────────────

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

  // ── Derived state ───────────────────────────────────────────────────────────

  const filteredPatterns =
    selectedCollId === null           ? patterns :
    selectedCollId === 'uncategorized'? patterns.filter(p => !p.collection_id) :
                                        patterns.filter(p => p.collection_id === selectedCollId)

  const uncategorizedCount = patterns.filter(p => !p.collection_id).length

  function collectionCount(id: string) {
    return patterns.filter(p => p.collection_id === id).length
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="rounded-xl px-6 py-4 text-center text-sm"
               style={{ backgroundColor: '#3a2218', border: '1px solid #C06B45', color: '#e0a090' }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <div className="mb-6">
            <StashBuster patterns={patterns} collections={collections} />
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

            {/* ── Sidebar ── */}
            <div className="w-full lg:w-52 lg:flex-shrink-0 lg:sticky lg:top-20">
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>

                {/* Collections heading + create button */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
                    Collections
                  </span>
                  <button
                    onClick={() => { setEditingColl(null); setShowCollForm(true) }}
                    title="New collection"
                    className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-[#3a3530]"
                    style={{ color: '#9a8e87' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>

                {/* All Patterns */}
                <SidebarItem
                  label="All Patterns"
                  count={patterns.length}
                  active={selectedCollId === null}
                  color="#9a8e87"
                  onClick={() => setSelectedCollId(null)}
                />

                {/* Uncategorized */}
                <SidebarItem
                  label="Uncategorized"
                  count={uncategorizedCount}
                  active={selectedCollId === 'uncategorized'}
                  color="#5a504a"
                  onClick={() => setSelectedCollId('uncategorized')}
                />

                {/* User collections */}
                {collections.length > 0 && (
                  <div className="mt-1 border-t pt-1" style={{ borderColor: '#3a3530' }}>
                    {collections.map(c => (
                      <div key={c.id} className="group flex items-center">
                        <SidebarItem
                          label={c.name}
                          count={collectionCount(c.id)}
                          active={selectedCollId === c.id}
                          color={c.color}
                          onClick={() => setSelectedCollId(c.id)}
                        />
                        {/* Edit / Delete buttons on hover */}
                        <div className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover:flex">
                          <button
                            onClick={() => { setEditingColl(c); setShowCollForm(true) }}
                            title="Edit"
                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-[#3a3530]"
                            style={{ color: '#7a6e67' }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(c.id)}
                            disabled={deletingCollId === c.id}
                            title="Delete"
                            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-[#3a3530] disabled:opacity-40"
                            style={{ color: '#7a6e67' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e08080')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7a6e67')}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {collections.length === 0 && (
                  <p className="mt-2 text-xs" style={{ color: '#5a504a' }}>
                    Create a collection to organize your patterns.
                  </p>
                )}
              </div>
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Favorite Designers */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}>
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

                {designers.length === 0 ? (
                  <p className="text-sm" style={{ color: '#5a504a' }}>No favorite designers yet. Add one above.</p>
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
                        <div className="flex-shrink-0 rounded-full overflow-hidden"
                             style={{ width: 48, height: 48, backgroundColor: '#2e2b28' }}>
                          {d.designer_photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.designer_photo_url} alt={d.designer_name}
                                 className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                                 style={{ color: '#C06B45' }}>
                              {d.designer_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
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
                            <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: '#9a8e87' }}>
                              {d.designer_bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patterns section heading */}
              {patterns.length > 0 && (
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>
                    {selectedCollId === null
                      ? 'All Patterns'
                      : selectedCollId === 'uncategorized'
                        ? 'Uncategorized'
                        : (collections.find(c => c.id === selectedCollId)?.name ?? 'Patterns')}
                  </h2>
                  <span className="text-sm" style={{ color: '#7a6e67' }}>
                    {filteredPatterns.length} {filteredPatterns.length === 1 ? 'pattern' : 'patterns'}
                  </span>
                </div>
              )}

              {/* Empty library */}
              {patterns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a4440"
                       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>No saved patterns yet</p>
                  <p className="mt-1 text-sm" style={{ color: '#5a504a' }}>
                    Hit the heart on any search result to save it here.
                  </p>
                  <Link href="/search"
                        className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-[#C06B45] hover:bg-[#A8572F] transition-colors">
                    Search patterns
                  </Link>
                </div>
              )}

              {/* Empty collection filter state */}
              {patterns.length > 0 && filteredPatterns.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm" style={{ color: '#5a504a' }}>
                    No patterns in this collection yet.
                    {selectedCollId !== 'uncategorized' && ' Move patterns here using the folder icon on each card.'}
                  </p>
                </div>
              )}

              {/* Patterns grid */}
              {filteredPatterns.length > 0 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredPatterns.map(pattern => {
                      const isDeleting = deletingId === pattern.id
                      return (
                        <div
                          key={pattern.id}
                          className="flex flex-col rounded-2xl transition-transform hover:-translate-y-1"
                          style={{
                            backgroundColor: '#2e2b28',
                            border: '1px solid #3a3530',
                            opacity: isDeleting ? 0.5 : 1,
                            transition: 'opacity 200ms, transform 150ms',
                          }}
                        >
                          {/* Image — rounded-t-2xl clips image to card corners without hiding the dropdown */}
                          <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ height: '180px' }}>
                            {pattern.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={pattern.photo_url}
                                alt={pattern.pattern_name}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0" style={{
                                background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 50%, #8b4a2a 100%)',
                                opacity: 0.7,
                              }} />
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
                                {pattern.designer_name && (
                                  <span>by <DesignerPopover name={pattern.designer_name} /></span>
                                )}
                                {pattern.designer_name && <span aria-hidden="true">·</span>}
                                <RavelryCardCredit />
                              </p>
                            </div>

                            <div className="mt-auto flex items-center gap-2 pt-2">
                              <Link
                                href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ravelry-link flex-1 block rounded-lg py-2 text-center text-sm font-semibold transition-colors text-white"
                              >
                                View on Ravelry →
                              </Link>
                              {/* Notes button */}
                              <button
                                onClick={() => setNotesPattern(pattern)}
                                title={pattern.notes ? 'Edit notes' : 'Add notes'}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#3a3530]"
                                style={{ color: pattern.notes ? '#C4956A' : '#5a504a' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24"
                                     fill={pattern.notes ? 'currentColor' : 'none'}
                                     stroke="currentColor" strokeWidth="2"
                                     strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <CollectionPicker
                                pattern={pattern}
                                collections={collections}
                                onAssign={handleAssignCollection}
                              />
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
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] rounded-xl px-5 py-3 text-sm font-medium shadow-xl"
          style={{
            backgroundColor: toast.ok ? '#1a3a2a' : '#3a1a1a',
            border: `1px solid ${toast.ok ? '#2a5a3a' : '#6a2a2a'}`,
            color: toast.ok ? '#6dcfa0' : '#e08080',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Notes modal */}
      {notesPattern && (
        <NotesModal
          patternName={notesPattern.pattern_name}
          initialNotes={notesPattern.notes ?? ''}
          onSave={notes => handleSaveNotes(notesPattern.id, notes)}
          onClose={() => setNotesPattern(null)}
        />
      )}

      {/* Collection form modal */}
      {showCollForm && (
        <CollectionForm
          initial={editingColl ?? undefined}
          onSave={editingColl ? handleEditCollection : handleCreateCollection}
          onClose={() => { setShowCollForm(false); setEditingColl(null) }}
        />
      )}
    </div>
  )
}

// ── Sidebar item helper ───────────────────────────────────────────────────────

function SidebarItem({
  label, count, active, color, onClick,
}: {
  label: string
  count: number
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
      style={{
        backgroundColor: active ? '#3a3530' : 'transparent',
        color: active ? '#f5f0eb' : '#9a8e87',
      }}
    >
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 truncate">{label}</span>
      <span className="text-xs tabular-nums" style={{ color: active ? '#c4b8ae' : '#5a504a' }}>
        {count}
      </span>
    </button>
  )
}
