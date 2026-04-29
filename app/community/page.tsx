'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'
import { GroupCard } from '@/app/ui/group-card'
import type { Group } from '@/app/ui/group-card'
import { CreateGroupModal } from '@/app/ui/create-group-modal'
import type { GroupPayload } from '@/app/ui/create-group-modal'
import { GroupDetailModal } from '@/app/ui/group-detail-modal'
import { FlagGroupModal } from '@/app/ui/flag-group-modal'

export default function CommunityPage() {
  const router = useRouter()
  const [groups, setGroups]         = useState<Group[]>([])
  const [loading, setLoading]       = useState(true)
  const [userId, setUserId]         = useState<string | null>(null)
  const tokenRef                    = useRef<string | null>(null)

  // Search
  const [city, setCity]   = useState('')
  const [state, setState] = useState('')
  const [zip, setZip]     = useState('')

  // Modals
  const [showCreate, setShowCreate]       = useState(false)
  const [detailGroup, setDetailGroup]     = useState<Group | null>(null)
  const [flagGroup, setFlagGroup]         = useState<Group | null>(null)

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(msg: string, ok: boolean) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, ok })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null)
      tokenRef.current = session?.access_token ?? null
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null)
      tokenRef.current = session?.access_token ?? null
    })
    fetchGroups()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchGroups(params?: { city?: string; state?: string; zip?: string }) {
    setLoading(true)
    const qs = new URLSearchParams()
    if (params?.zip)   qs.set('zip',   params.zip)
    if (params?.city)  qs.set('city',  params.city)
    if (params?.state) qs.set('state', params.state)
    const res = await fetch(`/api/groups?${qs.toString()}`)
    if (res.ok) setGroups(await res.json())
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchGroups({ city: city.trim(), state: state.trim(), zip: zip.trim() })
  }

  function handleClear() {
    setCity(''); setState(''); setZip('')
    fetchGroups()
  }

  async function handleCreate(payload: GroupPayload) {
    if (!tokenRef.current) { router.push('/login'); return }
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRef.current}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Could not post group')
    setGroups(prev => [json as Group, ...prev])
    showToast('Group posted!', true)
  }

  async function handleDelete(group: Group) {
    if (!tokenRef.current) return
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/groups/${group.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    })
    if (res.ok) {
      setGroups(prev => prev.filter(g => g.id !== group.id))
      setDetailGroup(null)
      showToast('Group deleted.', true)
    } else {
      showToast('Could not delete group.', false)
    }
  }

  const INPUT = {
    backgroundColor: '#38342f',
    border: '1px solid #4a4440',
    color: '#f5f0eb',
  }

  const hasSearch = city.trim() || state.trim() || zip.trim()

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Community</h1>
            <p className="mt-1 text-sm" style={{ color: '#9a8e87' }}>
              Find local fiber arts groups — knitting circles, spinning guilds, weaving collectives, and more.
            </p>
          </div>
          <button
            onClick={() => userId ? setShowCreate(true) : router.push('/login')}
            className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#C06B45' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
          >
            + Post Your Group
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8 flex flex-wrap gap-3">
          {[
            { placeholder: 'City', value: city, set: setCity, flex: 'flex-1 min-w-[120px]' },
            { placeholder: 'State', value: state, set: setState, flex: 'w-20' },
            { placeholder: 'ZIP', value: zip, set: setZip, flex: 'w-28' },
          ].map(({ placeholder, value, set, flex }) => (
            <input
              key={placeholder}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={e => set(e.target.value)}
              className={`${flex} rounded-xl px-4 py-2.5 text-sm outline-none`}
              style={INPUT}
              onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          ))}
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: '#C06B45' }}
          >
            Search
          </button>
          {hasSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl"
                   style={{ height: 260, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>
              {hasSearch ? 'No groups found in that area.' : 'No groups posted yet.'}
            </p>
            <p className="mt-2 text-sm" style={{ color: '#5a504a' }}>
              Be the first to post your fiber arts group!
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm" style={{ color: '#7a6e67' }}>
              {groups.length} group{groups.length !== 1 ? 's' : ''}{hasSearch ? ' found' : ''}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map(g => (
                <GroupCard
                  key={g.id}
                  group={g}
                  userId={userId}
                  onView={() => setDetailGroup(g)}
                  onDelete={() => handleDelete(g)}
                  onFlag={() => setFlagGroup(g)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateGroupModal
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {detailGroup && (
        <GroupDetailModal
          group={detailGroup}
          userId={userId}
          onClose={() => setDetailGroup(null)}
          onDelete={() => handleDelete(detailGroup)}
          onFlag={() => { setDetailGroup(null); setFlagGroup(detailGroup) }}
          onUpdated={updated => {
            setGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
            setDetailGroup(updated)
          }}
        />
      )}

      {flagGroup && (
        <FlagGroupModal
          groupId={flagGroup.id}
          onClose={() => setFlagGroup(null)}
          onFlagged={() => {
            showToast('Report submitted — thank you.', true)
            setFlagGroup(null)
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] rounded-xl px-5 py-3 text-sm font-medium shadow-xl whitespace-nowrap"
          style={{
            backgroundColor: toast.ok ? '#1a3a2a' : '#3a1a1a',
            border: `1px solid ${toast.ok ? '#2a5a3a' : '#6a2a2a'}`,
            color: toast.ok ? '#6dcfa0' : '#e08080',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
