'use client'

import { useEffect, useRef, useState } from 'react'

const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }
const FOCUS = '#D4A5A0'
const BLUR  = '#4a4440'

export type CommunityResourcePayload = {
  title: string
  link: string
  category: string
  description: string
  creator_name: string
}

const CATEGORIES = [
  { value: 'beginner_knitting', label: 'Beginner Knitting' },
  { value: 'crochet',           label: 'Crochet' },
  { value: 'weaving',           label: 'Weaving' },
  { value: 'spinning',          label: 'Spinning' },
  { value: 'felting',           label: 'Felting' },
  { value: 'dyeing',            label: 'Dyeing' },
  { value: 'other',             label: 'Other' },
]

type Props = {
  onSave: (payload: CommunityResourcePayload) => Promise<void>
  onClose: () => void
}

export function CreateCommunityResourceModal({ onSave, onClose }: Props) {
  const [title, setTitle]           = useState('')
  const [link, setLink]             = useState('')
  const [category, setCategory]     = useState('beginner_knitting')
  const [creatorName, setCreatorName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!link.trim())  { setError('Link is required.'); return }
    setSaving(true); setError(null)
    try {
      await onSave({ title: title.trim(), link: link.trim(), category, description, creator_name: creatorName })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post resource.')
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
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#f5f0eb' }}>Share a Resource</h2>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1 1l10 10M11 1 1 11" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
                Title <span style={{ color: FOCUS }}>*</span>
              </label>
              <input ref={titleRef} {...inp(title, setTitle)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
                Link <span style={{ color: FOCUS }}>*</span>
              </label>
              <input type="url" {...inp(link, setLink)} placeholder="https://…" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
                Category <span style={{ color: FOCUS }}>*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
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
              <input {...inp(creatorName, setCreatorName)} placeholder="Optional" />
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
              <div className="rounded-xl px-4 py-3 text-sm"
                   style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl py-2 text-sm font-medium"
                style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: FOCUS }}>
                {saving ? 'Posting…' : 'Share Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
