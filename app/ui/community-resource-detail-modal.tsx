'use client'

import { useEffect, useState } from 'react'
import type { CommunityResource } from './community-resource-card'

const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }
const FOCUS = '#C06B45'
const BLUR  = '#4a4440'

const CATEGORIES = [
  { value: 'beginner_knitting', label: 'Beginner Knitting' },
  { value: 'crochet',           label: 'Crochet' },
  { value: 'weaving',           label: 'Weaving' },
  { value: 'spinning',          label: 'Spinning' },
  { value: 'felting',           label: 'Felting' },
  { value: 'dyeing',            label: 'Dyeing' },
  { value: 'other',             label: 'Other' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

type Props = {
  resource: CommunityResource
  userId: string | null
  onClose: () => void
  onDelete: () => void
  onFlag: () => void
  onUpdated: (r: CommunityResource) => void
}

export function CommunityResourceDetailModal({ resource, userId, onClose, onDelete, onFlag, onUpdated }: Props) {
  const isOwner = userId === resource.user_id
  const [editing, setEditing] = useState(false)

  const [title, setTitle]           = useState(resource.title)
  const [link, setLink]             = useState(resource.link)
  const [category, setCategory]     = useState(resource.category)
  const [creatorName, setCreatorName] = useState(resource.creator_name ?? '')
  const [description, setDescription] = useState(resource.description ?? '')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

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
    if (!title.trim()) { setError('Title is required.'); return }
    if (!link.trim())  { setError('Link is required.'); return }
    setSaving(true); setError(null)
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      if (!session) { setError('Not logged in.'); setSaving(false); return }
      const res = await fetch(`/api/community-resources/${resource.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, link, category, description, creator_name: creatorName }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Could not update resource.'); setSaving(false); return }
      onUpdated(json as CommunityResource)
      setEditing(false)
    } catch {
      setError('Network error.')
    }
    setSaving(false)
  }

  const textareaStyle = {
    ...INPUT,
    width: '100%', resize: 'none' as const, borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none',
  }

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
          {resource.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resource.image_url} alt={resource.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #1e2a1e 0%, #3a5a3a 50%, #1a2e1a 100%)',
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
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Title <span style={{ color: FOCUS }}>*</span></label>
                <input {...inp(title, setTitle)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Link <span style={{ color: FOCUS }}>*</span></label>
                <input type="url" {...inp(link, setLink)} placeholder="https://…" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as CommunityResource['category'])}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={INPUT}
                  onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Your name or handle</label>
                <input {...inp(creatorName, setCreatorName)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Description</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  style={textareaStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                />
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
                <div className="flex items-start gap-2 flex-wrap">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold hover:underline"
                    style={{ color: '#f5f0eb' }}
                  >
                    {resource.title}
                  </a>
                  <span className="mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: '#1e2a1e', border: '1px solid #3a5a3a', color: '#8abf8a' }}>
                    {CATEGORY_LABELS[resource.category] ?? resource.category}
                  </span>
                </div>
                {resource.creator_name && (
                  <p className="mt-1 text-sm" style={{ color: '#9a8e87' }}>{resource.creator_name}</p>
                )}
              </div>

              {resource.description && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>Description</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#c4b8ae' }}>{resource.description}</p>
                </div>
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
