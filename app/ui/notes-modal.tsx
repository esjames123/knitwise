'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  patternName: string
  initialNotes: string
  onSave: (notes: string) => Promise<void>
  onClose: () => void
}

const PLACEHOLDER = `e.g.
Yarn: Malabrigo Rios, 4 skeins in Piedras
Needles: US 7 (4.5mm) circulars
Gauge: 20 sts × 28 rows = 4"

Sized up one size — knit a medium for a relaxed fit.
Added 2" to body length before underarm.
Made for myself, winter 2025.`

export function NotesModal({ patternName, initialNotes, onSave, onClose }: Props) {
  const [notes, setNotes]   = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textareaRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(notes)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save notes')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-lg flex-col rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4"
             style={{ borderBottom: '1px solid #3a3530' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#f5f0eb' }}>Pattern notes</h2>
            <p className="mt-0.5 text-sm truncate" style={{ color: '#7a6e67', maxWidth: '340px' }}>
              {patternName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#3a3530]"
            style={{ color: '#7a6e67' }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            className="w-full rounded-xl px-4 py-3 text-sm leading-relaxed outline-none resize-none"
            style={{
              backgroundColor: '#38342f',
              border: '1px solid #4a4440',
              color: '#f5f0eb',
            }}
            onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
            onBlur={e   => (e.currentTarget.style.borderColor = '#4a4440')}
          />

          {error && <p className="text-xs" style={{ color: '#e0a090' }}>{error}</p>}

          <div className="flex gap-2 pb-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#C06B45' }}
            >
              {saving ? 'Saving…' : 'Save notes'}
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
