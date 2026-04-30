'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SaveButton from '@/app/ui/save-button'
import { DesignerPopover } from '@/app/ui/designer-popover'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'
import { supabase } from '@/lib/supabase'
import type { RavelryPattern } from '@/app/lib/ravelry-search'

export type { RavelryPattern }

type Props = {
  patterns: RavelryPattern[]
}

export function PatternGrid({ patterns }: Props) {
  const searchParams = useSearchParams()
  const onlyFavorites = searchParams.get('library') === '1'

  const [apiPatterns, setApiPatterns] = useState<RavelryPattern[] | null>(null)
  const [apiLoading, setApiLoading]   = useState(false)
  const [apiError, setApiError]       = useState<string | null>(null)

  const paramsStr = searchParams.toString()

  useEffect(() => {
    if (!onlyFavorites) {
      setApiPatterns(null)
      setApiLoading(false)
      setApiError(null)
      return
    }

    let cancelled = false
    setApiLoading(true)
    setApiError(null)

    async function load() {
      let token: string | null = null
      try {
        const { data } = await supabase.auth.getSession()
        token = data.session?.access_token ?? null
      } catch { /* auth unavailable */ }

      if (cancelled) return

      if (!token) {
        setApiPatterns([])
        setApiLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/search?${paramsStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Search API returned ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setApiPatterns(data.patterns ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(err instanceof Error ? err.message : 'Search failed.')
          setApiPatterns([])
        }
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [onlyFavorites, paramsStr]) // re-fetch when favorites toggled or any other filter changes

  if (patterns && patterns.length > 0) {
    console.log('First pattern:', JSON.stringify(patterns[0], null, 2))
  }

  const displayed = onlyFavorites ? (apiPatterns ?? []) : patterns

  if (apiLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-2xl"
               style={{ height: 300, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
        ))}
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="rounded-xl px-6 py-4 text-center text-sm"
           style={{ backgroundColor: '#3a2218', border: '1px solid #C06B45', color: '#e0a090' }}>
        {apiError}
      </div>
    )
  }

  if (displayed.length === 0) {
    return (
      <p className="text-center" style={{ color: '#9a8e87' }}>
        {onlyFavorites
          ? 'None of your saved patterns match this search. Try adjusting your search term or turning off the library filter.'
          : 'No patterns found. Try adjusting your filters or search term.'}
      </p>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayed.map(pattern => (
          <div
            key={pattern.id}
            className="flex flex-col rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
            style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
          >
            <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
              {pattern.first_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pattern.first_photo.medium_url}
                  alt={pattern.name}
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
              <SaveButton
                patternId={pattern.id}
                patternName={pattern.name}
                designerName={pattern.designer?.name ?? null}
                permalink={pattern.permalink}
                photoUrl={pattern.first_photo?.medium_url ?? null}
                yardageRequired={pattern.min_yardage_required}
                yarnWeight={pattern.yarn_weight_description}
              />
            </div>

            <div className="flex flex-1 flex-col p-5 gap-3">
              <div>
                <h2 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
                  {pattern.name}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm" style={{ color: '#9a8e87' }}>
                  {pattern.designer && (
                    <span>by <DesignerPopover name={pattern.designer.name} /></span>
                  )}
                  {pattern.designer && <span aria-hidden="true">·</span>}
                  <RavelryCardCredit />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {pattern.yarn_weight_description && (
                  <span
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}
                  >
                    {pattern.yarn_weight_description}
                  </span>
                )}
                {pattern.min_yardage_required != null && (
                  <span
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}
                  >
                    ~{pattern.min_yardage_required.toLocaleString()} yds
                  </span>
                )}
                {pattern.free && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-medium"
                    style={{ backgroundColor: '#1a3a2a', border: '1px solid #2a5a3a', color: '#6dcfa0' }}
                  >
                    Free
                  </span>
                )}
              </div>

              <div className="mt-auto pt-2">
                <Link
                  href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ravelry-link block rounded-lg py-2 text-center text-sm font-semibold transition-colors text-white"
                >
                  View on Ravelry →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <RavelryFooter />
    </>
  )
}
