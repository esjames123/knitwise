'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  groupId: string
  onClose: () => void
  onFlagged: () => void
}

export function FlagGroupModal({ groupId, onClose, onFlagged }: Props) {
  const [reason, setReason]   = useState('')
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textRef.current?.focus() }, [])
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSub(true); setError(null)
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      if (!session) { setError('You must be logged in to report.'); setSub(false); return }
      const res = await fetch(`/api/groups/${groupId}/flag`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const json = await res.json()
      if (res.status === 409) { setError('You have already reported this group.'); setSub(false); return }
      if (!res.ok) { setError(json.error ?? 'Could not submit report.'); setSub(false); return }
      onFlagged()
      onClose()
    } catch {
      setError('Network error — please try again.')
    }
    setSub(false)
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
           style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}>
        <h2 className="mb-2 text-lg font-bold" style={{ color: '#f5f0eb' }}>Report Group</h2>
        <p className="mb-4 text-sm" style={{ color: '#9a8e87' }}>
          Let us know why this group should be reviewed. Groups reported 5 times are hidden automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            ref={textRef}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe the issue (optional)…"
            rows={3}
            className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
          />

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm"
                 style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: '#C06B45' }}>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
