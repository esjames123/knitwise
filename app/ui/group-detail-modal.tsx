'use client'

import { useEffect, useState } from 'react'
import type { Group } from './group-card'

const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }
const FOCUS = '#D4A5A0'
const BLUR  = '#4a4440'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>{title}</p>
      <div className="text-sm leading-relaxed" style={{ color: '#c4b8ae' }}>{children}</div>
    </div>
  )
}

type Props = {
  group: Group
  userId: string | null
  onClose: () => void
  onDelete: () => void
  onFlag: () => void
  onUpdated: (g: Group) => void
}

export function GroupDetailModal({ group, userId, onClose, onDelete, onFlag, onUpdated }: Props) {
  const isOwner = userId === group.user_id
  const [editing, setEditing] = useState(false)

  // Edit fields
  const [name, setName]         = useState(group.name)
  const [desc, setDesc]         = useState(group.description ?? '')
  const [bring, setBring]       = useState(group.what_to_bring ?? '')
  const [outreach, setOutreach] = useState(group.community_outreach ?? '')
  const [city, setCity]         = useState(group.location_city ?? '')
  const [state, setState]       = useState(group.location_state ?? '')
  const [zip, setZip]           = useState(group.location_zip ?? '')
  const [link, setLink]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function inp(value: string, onChange: (v: string) => void, extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>) {
    return {
      value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      className: 'w-full rounded-xl px-3 py-2 text-sm outline-none',
      style: INPUT,
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = FOCUS),
      onBlur:  (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = BLUR),
      ...extra,
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      if (!session) { setError('Not logged in.'); setSaving(false); return }
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, what_to_bring: bring,
                               community_outreach: outreach, location_city: city,
                               location_state: state, location_zip: zip, link }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Could not update group.'); setSaving(false); return }
      onUpdated(json as Group)
      setEditing(false)
    } catch {
      setError('Network error.')
    }
    setSaving(false)
  }

  const locParts = [group.location_city, group.location_state].filter(Boolean).join(', ')
  const loc = locParts + (group.location_zip ? (locParts ? ` ${group.location_zip}` : group.location_zip) : '')

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative my-4 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}
      >
        {/* Image */}
        <div className="relative w-full" style={{ height: '200px' }}>
          {group.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.image_url} alt={group.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #1a2e1a 0%, #3a6a3a 50%, #1e4a2a 100%)',
            }} />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(26,23,20,0.8)', backdropFilter: 'blur(6px)', color: '#f5f0eb' }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l10 10M11 1 1 11" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Name <span style={{ color: FOCUS }}>*</span></label>
                <input {...inp(name, setName)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Description</label>
                <textarea
                  value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                  className="w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
                  style={INPUT}
                  onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>What to bring</label>
                <input {...inp(bring, setBring)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Community outreach</label>
                <input {...inp(outreach, setOutreach)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['City', city, setCity], ['State', state, setState], ['ZIP', zip, setZip]].map(([label, val, setter]) => (
                  <div key={label as string}>
                    <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>{label as string}</label>
                    <input {...inp(val as string, setter as (v: string) => void)} />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>New link (re-fetches image)</label>
                <input type="url" {...inp(link, setLink)} placeholder="https://…" />
              </div>
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}>
                  {error}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setEditing(false); setError(null) }}
                  className="flex-1 rounded-xl py-2 text-sm font-medium"
                  style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: FOCUS }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#f5f0eb' }}>{group.name}</h2>
                {loc && <p className="mt-0.5 text-sm" style={{ color: '#6dcfa0' }}>{loc}</p>}
              </div>

              {group.description && (
                <Section title="About">{group.description}</Section>
              )}
              {group.what_to_bring && (
                <Section title="What to bring">{group.what_to_bring}</Section>
              )}
              {group.community_outreach && (
                <Section title="Community outreach">{group.community_outreach}</Section>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {isOwner && (
                  <>
                    <button onClick={() => setEditing(true)}
                      className="rounded-xl px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}>
                      Edit
                    </button>
                    <button onClick={onDelete}
                      className="rounded-xl px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a', color: '#e08080' }}>
                      Delete
                    </button>
                  </>
                )}
                {!isOwner && userId && (
                  <button onClick={onFlag}
                    className="rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                    Report
                  </button>
                )}
                <button onClick={onClose}
                  className="ml-auto rounded-xl px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
