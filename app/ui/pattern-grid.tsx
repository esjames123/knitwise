'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SaveButton from '@/app/ui/save-button'
import { DesignerPopover } from '@/app/ui/designer-popover'
import { RavelryCardCredit, RavelryFooter } from '@/app/ui/ravelry-attribution'
import { supabase } from '@/lib/supabase'

export type RavelryPattern = {
  id: number
  name: string
  permalink: string
  designer: { name: string } | null
  difficulty_average: number | null
  yarn_weight_description: string | null
  min_yardage_required: number | null
  max_yardage_required: number | null
  free: boolean
  first_photo: {
    square_url: string
    medium_url: string
  } | null
}

type Props = {
  patterns: RavelryPattern[]
}

export function PatternGrid({ patterns }: Props) {
  const searchParams = useSearchParams()
  const onlyFavorites = searchParams.get('favorites') === '1'

  const [favoriteNames, setFavoriteNames] = useState<Set<string> | null>(null)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    if (!onlyFavorites) {
      setFavoriteNames(null)
      return
    }
    let cancelled = false
    setFavLoading(true)
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || cancelled) { setFavLoading(false); return }
      const { data } = await supabase
        .from('favorite_designers')
        .select('designer_name')
        .eq('user_id', session.user.id)
      if (!cancelled) {
        setFavoriteNames(new Set((data ?? []).map((r: { designer_name: string }) => r.designer_name)))
        setFavLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [onlyFavorites])

  const displayed = onlyFavorites && favoriteNames != null
    ? patterns.filter(p => p.designer && favoriteNames.has(p.designer.name))
    : patterns

  if (favLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-2xl"
               style={{ height: 300, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
        ))}
      </div>
    )
  }

  if (displayed.length === 0) {
    return (
      <p className="text-center" style={{ color: '#9a8e87' }}>
        {onlyFavorites
          ? 'No patterns found from your favorite designers. Try turning off the favorites filter.'
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
