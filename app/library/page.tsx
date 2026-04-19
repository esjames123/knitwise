'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'

type SavedPattern = {
  id: string
  pattern_id: number
  pattern_name: string
  designer_name: string | null
  permalink: string
  photo_url: string | null
  created_at: string
}

export default function LibraryPage() {
  const router = useRouter()
  const [patterns, setPatterns] = useState<SavedPattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data, error } = await supabase
        .from('saved_patterns')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) console.error('[Library] fetch failed:', error.message)
      setPatterns(data ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  async function unsave(rowId: string, patternId: number) {
    setPatterns(prev => prev.filter(p => p.id !== rowId))
    await supabase.from('saved_patterns').delete().eq('id', rowId)
    // no-op if delete fails — UI is already updated optimistically
    void patternId
  }

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>My Library</h1>
            {!loading && (
              <p className="mt-1 text-sm" style={{ color: '#7a6e67' }}>
                {patterns.length} {patterns.length === 1 ? 'pattern' : 'patterns'} saved
              </p>
            )}
          </div>
          <Link
            href="/search"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#C06B45' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
          >
            Find patterns
          </Link>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
              >
                <div className="animate-pulse" style={{ height: 180, backgroundColor: '#38342f' }} />
                <div className="p-5 space-y-2">
                  <div className="h-4 rounded" style={{ backgroundColor: '#38342f', width: '70%' }} />
                  <div className="h-3 rounded" style={{ backgroundColor: '#38342f', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && patterns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="#4a4440" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="mb-4"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>No saved patterns yet</p>
            <p className="mt-1 text-sm" style={{ color: '#5a504a' }}>
              Hit the bookmark icon on any search result to save it here.
            </p>
            <Link
              href="/search"
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#C06B45' }}
            >
              Search patterns
            </Link>
          </div>
        )}

        {!loading && patterns.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {patterns.map(pattern => (
              <div
                key={pattern.id}
                className="flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
              >
                {/* Photo or placeholder */}
                <div className="relative w-full overflow-hidden" style={{ height: 180 }}>
                  {pattern.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pattern.photo_url}
                      alt={pattern.pattern_name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 50%, #8b4a2a 100%)',
                        opacity: 0.7,
                      }}
                    />
                  )}

                  {/* Unsave button */}
                  <button
                    onClick={() => unsave(pattern.id, pattern.pattern_id)}
                    aria-label="Remove from library"
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all"
                    style={{
                      backgroundColor: '#C06B45',
                      border: '1px solid #C06B45',
                      backdropFilter: 'blur(4px)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#8b4a2a')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="white" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-5 gap-3">
                  <div>
                    <h2 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
                      {pattern.pattern_name}
                    </h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm" style={{ color: '#9a8e87' }}>
                      {pattern.designer_name && <span>by {pattern.designer_name}</span>}
                      {pattern.designer_name && <span aria-hidden="true">·</span>}
                      <RavelryCardCredit />
                    </p>
                  </div>

                  <div className="mt-auto pt-2">
                    <Link
                      href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ravelry-link block rounded-lg py-2 text-center text-sm font-semibold text-white transition-colors"
                    >
                      View on Ravelry →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && <RavelryFooter />}
      </div>
    </div>
  )
}
