'use client'

import { useEffect, useRef, useState } from 'react'

export type CollectionPayload = {
  name: string
  description: string
  color: string
}

type Props = {
  initial?: { id: string; name: string; description: string | null; color: string }
  onSave: (payload: CollectionPayload) => Promise<void>
  onClose: () => void
}

const COLORS = [
  '#C06B45', // terracotta (default)
  '#7B9E87', // sage green
  '#6B8EAD', // steel blue
  '#9B8EC4', // soft purple
  '#C4956A', // warm sand
  '#AD6B6B', // dusty rose
  '#6BAD9B', // teal
  '#B8A86B', // olive gold
]

export function CollectionForm({ initial, onSave, onClose }: Props) {
  const [name, setName]               = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor]             = useState(initial?.color ?? '#C06B45')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), description: description.trim(), color })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>
            {initial ? 'Edit collection' : 'New collection'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#3a3530]"
            style={{ color: '#7a6e67' }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: '#7a6e67' }}>
              Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Summer knits"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: '#38342f',
                border: `1px solid ${error ? '#e05050' : '#4a4440'}`,
                color: '#f5f0eb',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e   => (e.currentTarget.style.borderColor = error ? '#e05050' : '#4a4440')}
            />
            {error && <p className="mt-1 text-xs" style={{ color: '#e0a090' }}>{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: '#7a6e67' }}>
              Description <span style={{ color: '#5a504a', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this collection for?"
              rows={2}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
              onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e   => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider"
                   style={{ color: '#7a6e67' }}>
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                    boxShadow: color === c ? '0 0 0 1px #242220' : 'none',
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#C06B45' }}
            >
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Create collection'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#3a3530]"
              style={{ color: '#c4b8ae' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
