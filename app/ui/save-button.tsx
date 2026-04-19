'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Props = {
  patternId: number
  patternName: string
  designerName: string | null
  permalink: string
  photoUrl: string | null
}

export default function SaveButton({ patternId, patternName, designerName, permalink, photoUrl }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState<boolean | null>(null) // null = checking
  const [acting, setActing] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setSaved(false)
        return
      }

      const { data, error } = await supabase
        .from('saved_patterns')
        .select('id')
        .eq('pattern_id', patternId)
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!cancelled) {
        if (error) {
          console.error('[SaveButton] check failed:', error.message)
          setSaved(false)
        } else {
          setSaved(!!data)
        }
      }
    }

    check()
    return () => { cancelled = true }
  }, [patternId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (acting || saved === null) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    setActing(true)
    setError(false)

    if (saved) {
      const { error } = await supabase
        .from('saved_patterns')
        .delete()
        .eq('pattern_id', patternId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('[SaveButton] delete failed:', error.message)
        setError(true)
      } else {
        setSaved(false)
      }
    } else {
      const { error } = await supabase.from('saved_patterns').insert({
        user_id: session.user.id,
        pattern_id: patternId,
        pattern_name: patternName,
        designer_name: designerName,
        permalink,
        photo_url: photoUrl,
      })

      if (error) {
        console.error('[SaveButton] insert failed:', error.message)
        setError(true)
      } else {
        setSaved(true)
      }
    }

    setActing(false)
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from library' : 'Save to library'}
      title={error ? 'Could not save — check console' : undefined}
      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all"
      style={{
        backgroundColor: error
          ? 'rgba(180,40,40,0.75)'
          : saved
            ? '#C06B45'
            : 'rgba(36,34,32,0.75)',
        border: saved && !error ? '1px solid #C06B45' : '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        opacity: saved === null ? 0 : 1,
        transition: 'opacity 200ms, background-color 150ms',
      }}
    >
      <svg
        width="14" height="14" viewBox="0 0 24 24"
        fill={saved && !error ? 'white' : 'none'}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {error
          ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
          : <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        }
      </svg>
    </button>
  )
}
