'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  url: string
  title: string
  resourceType: string
  description: string | null
  source: string | null
}

type State = 'idle' | 'saving' | 'saved' | 'duplicate' | 'unauthenticated' | 'error'

export function ResourceSaveButton({ url, title, resourceType, description, source }: Props) {
  const [state, setState] = useState<State>('idle')
  const tokenRef = useRef<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      tokenRef.current = session?.access_token ?? null
      if (!session) setState('unauthenticated')
    })
  }, [])

  async function handleSave() {
    if (state === 'saved' || state === 'duplicate' || state === 'saving') return

    if (!tokenRef.current) {
      setState('unauthenticated')
      return
    }

    setState('saving')
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url, resource_type: resourceType, description, source }),
      })

      if (res.status === 409) { setState('duplicate'); return }
      if (!res.ok) { setState('error'); return }
      setState('saved')
    } catch {
      setState('error')
    }
  }

  const label =
    state === 'saving'         ? 'Saving…'
    : state === 'saved'        ? 'Saved ✓'
    : state === 'duplicate'    ? 'Already saved'
    : state === 'unauthenticated' ? 'Sign in to save'
    : state === 'error'        ? 'Error — retry'
    : 'Save'

  const isDisabled = state === 'saving' || state === 'saved' || state === 'duplicate' || state === 'unauthenticated'

  const bgColor =
    state === 'saved' || state === 'duplicate' ? '#1a3a2a'
    : state === 'error'                        ? '#3a2218'
    : '#D4A5A0'

  const borderColor =
    state === 'saved' || state === 'duplicate' ? '#2a5a3a'
    : state === 'error'                        ? '#D4A5A0'
    : 'transparent'

  const textColor =
    state === 'saved' || state === 'duplicate' ? '#6dcfa0'
    : state === 'error'                        ? '#e0a090'
    : '#fff'

  return (
    <button
      onClick={handleSave}
      disabled={isDisabled}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
      title={state === 'unauthenticated' ? 'Log in to save resources to your library' : undefined}
    >
      {label}
    </button>
  )
}
