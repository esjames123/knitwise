'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function DesignerPopover({ name }: { name: string }) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen]       = useState(false)
  const [status, setStatus]   = useState<'idle' | 'adding' | 'added' | 'already' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  async function handleAdd() {
    if (status === 'adding' || status === 'added') return
    setStatus('adding')
    setErrorMsg('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    let res: Response
    try {
      res = await fetch('/api/designers/favorite', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ designer_name: name }),
      })
    } catch (err) {
      console.error('[DesignerPopover] fetch threw:', err)
      setStatus('error')
      setErrorMsg('Network error')
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 3000)
      return
    }

    if (res.ok) {
      setStatus('added')
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 1800)
    } else if (res.status === 409) {
      setStatus('already')
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 1800)
    } else {
      let msg = `HTTP ${res.status}`
      try {
        const json = await res.json()
        msg = json.error ?? json.detail ?? msg
      } catch { /* ignore parse error */ }
      console.error('[DesignerPopover] API error for', name, '—', res.status, msg)
      setStatus('error')
      setErrorMsg(msg)
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 4000)
    }
  }

  function handleSearch() {
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(name)}`)
  }

  const addLabel =
    status === 'adding' ? 'Adding…' :
    status === 'added'  ? '✓ Added!' :
    status === 'already'? 'Already saved' :
    status === 'error'  ? (errorMsg || 'Error — try again') :
    '♥ Add to Favorites'

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="transition-colors hover:text-white underline-offset-2 hover:underline"
        style={{ color: 'inherit' }}
      >
        {name}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 rounded-xl overflow-hidden shadow-xl"
          style={{
            backgroundColor: '#2a2724',
            border: '1px solid #4a4440',
            minWidth: '200px',
            top: '100%',
            left: 0,
          }}
        >
          <button
            onClick={handleAdd}
            disabled={status === 'adding' || status === 'added' || status === 'already'}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#3a3530] disabled:opacity-60"
            style={{ color: '#f5f0eb' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={status === 'added' || status === 'already' ? '#C06B45' : 'none'}
                 stroke="#C06B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {addLabel}
          </button>
          <div style={{ borderTop: '1px solid #3a3530' }} />
          <button
            onClick={handleSearch}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#3a3530]"
            style={{ color: '#f5f0eb' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="#9a8e87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search this designer
          </button>
        </div>
      )}
    </div>
  )
}
