'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Props = {
  patternId: number
  patternName: string
  designerName: string | null
  permalink: string
  photoUrl: string | null
}

type Toast = 'saved' | 'removed' | 'error'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? 'white' : 'none'}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

const TOAST_LABELS: Record<Toast, string> = {
  saved:   'Saved!',
  removed: 'Removed',
  error:   'Error — try again',
}

export default function SaveButton({
  patternId, patternName, designerName, permalink, photoUrl,
}: Props) {
  const router = useRouter()
  const [saved, setSaved]           = useState<boolean | null>(null) // null = loading
  const [savedRowId, setSavedRowId] = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState<Toast | null>(null)
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check saved state on mount
  useEffect(() => {
    let cancelled = false
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { if (!cancelled) setSaved(false); return }

      const { data, error } = await supabase
        .from('saved_patterns')
        .select('id')
        .eq('pattern_id', patternId)
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (cancelled) return
      if (error) { setSaved(false); return }
      setSaved(!!data)
      if (data) setSavedRowId(data.id)
    }
    check()
    return () => { cancelled = true }
  }, [patternId])

  function showToast(type: Toast) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(type)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (saving || saved === null) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    setSaving(true)

    if (saved && savedRowId) {
      const res = await fetch(`/api/patterns/saved/${savedRowId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        setSaved(false)
        setSavedRowId(null)
        showToast('removed')
      } else {
        showToast('error')
      }
    } else {
      const res = await fetch('/api/patterns/save', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern_id:    patternId,
          pattern_name:  patternName,
          designer_name: designerName,
          permalink,
          photo_url:     photoUrl,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setSaved(true)
        if (json.id) setSavedRowId(json.id)
        showToast('saved')
      } else {
        showToast('error')
      }
    }

    setSaving(false)
  }

  return (
    <>
      {/* Heart button */}
      <button
        onClick={handleClick}
        disabled={saving || saved === null}
        aria-label={saved ? 'Remove from library' : 'Save to library'}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
        style={{
          backgroundColor: saved
            ? '#C06B45'
            : 'rgba(26, 23, 20, 0.70)',
          border: saved
            ? '1px solid #C06B45'
            : '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(6px)',
          opacity: saved === null ? 0 : 1,
          cursor: saving ? 'wait' : 'pointer',
          transform: saving ? 'scale(0.92)' : 'scale(1)',
        }}
      >
        {saving ? (
          // Spinner ring while in-flight
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-spin"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : (
          <HeartIcon filled={!!saved} />
        )}
      </button>

      {/* Toast — sibling so it isn't clipped by overflow-hidden on the button */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300"
        style={{
          backgroundColor: toast === 'error' ? 'rgba(160,40,40,0.88)' : 'rgba(26,23,20,0.88)',
          border: toast === 'error'
            ? '1px solid rgba(220,80,80,0.5)'
            : '1px solid rgba(192,107,69,0.5)',
          color: '#f5f0eb',
          backdropFilter: 'blur(6px)',
          opacity: toast ? 1 : 0,
          transform: toast ? 'translateY(0)' : 'translateY(4px)',
        }}
      >
        {toast ? TOAST_LABELS[toast] : ''}
      </div>
    </>
  )
}
