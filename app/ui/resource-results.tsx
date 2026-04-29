'use client'

import { useState } from 'react'
import { ResourceSaveButton } from './resource-save-button'

export type PublicResource = {
  id: string
  title: string
  url: string
  resource_type: string
  description: string | null
  source: string | null
  creator_name: string | null
  image_url: string | null
}

const RESOURCE_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  weaving:  { label: 'Weaving',  color: '#A0C4FF', bg: '#1a2a3a', border: '#2a4a6a' },
  spinning: { label: 'Spinning', color: '#BDB2FF', bg: '#1e1a3a', border: '#3a2a6a' },
  dyeing:   { label: 'Dyeing',   color: '#CAFFBF', bg: '#1a3a1a', border: '#2a5a2a' },
  knitting: { label: 'Knitting', color: '#C06B45', bg: '#3d2a1e', border: '#6a3a20' },
  crochet:  { label: 'Crochet',  color: '#FFD6A5', bg: '#3a2e1a', border: '#6a4a1a' },
  other:    { label: 'Other',    color: '#9a8e87', bg: '#38342f', border: '#4a4440' },
}

export function ResourceResults({ resources }: { resources: PublicResource[] }) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<string | null>(null)

  if (resources.length === 0) return null

  const allSources = Array.from(new Set(resources.map(r => r.source).filter(Boolean) as string[])).sort()
  const allTypes   = Array.from(new Set(resources.map(r => r.resource_type))).sort()

  const filtered = resources.filter(r => {
    if (activeType   && r.resource_type !== activeType)   return false
    if (activeSource && r.source        !== activeSource) return false
    return true
  })

  function toggleType(t: string)   { setActiveType(prev   => prev === t ? null : t) }
  function toggleSource(s: string) { setActiveSource(prev => prev === s ? null : s) }

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-xl font-bold" style={{ color: '#f5f0eb' }}>
        Community Resources
        <span className="ml-2 text-sm font-normal" style={{ color: '#7a6e67' }}>
          {resources.length} result{resources.length !== 1 ? 's' : ''}
        </span>
      </h2>

      {/* Filter chips */}
      {(allTypes.length > 1 || allSources.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {allTypes.map(t => {
            const cfg = RESOURCE_TYPES[t] ?? RESOURCE_TYPES.other
            const active = activeType === t
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? cfg.bg   : '#2e2b28',
                  border:          active ? `1px solid ${cfg.border}` : '1px solid #3a3530',
                  color:           active ? cfg.color : '#9a8e87',
                }}
              >
                {cfg.label}
              </button>
            )
          })}

          {allSources.length > 0 && (
            <span style={{ color: '#4a4440' }} className="self-center text-xs">|</span>
          )}

          {allSources.map(s => {
            const active = activeSource === s
            return (
              <button
                key={s}
                onClick={() => toggleSource(s)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? '#3d2a1e' : '#2e2b28',
                  border:          active ? '1px solid #C06B45' : '1px solid #3a3530',
                  color:           active ? '#e8c4b0' : '#9a8e87',
                }}
              >
                {s}
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: '#7a6e67' }}>No resources match these filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(r => {
            const cfg = RESOURCE_TYPES[r.resource_type] ?? RESOURCE_TYPES.other
            return (
              <div
                key={r.id}
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
              >
                {/* Image area */}
                <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 50%, #8b4a2a 100%)',
                      opacity: 0.7,
                    }} />
                  )}

                  {/* Type badge — bottom-left overlay */}
                  <span
                    className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, backdropFilter: 'blur(4px)' }}
                  >
                    {cfg.label}
                  </span>

                  {/* Source — bottom-right overlay */}
                  {r.source && (
                    <span
                      className="absolute bottom-2 right-2 text-xs"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {r.source}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold leading-snug hover:underline"
                      style={{ color: '#f5f0eb' }}
                    >
                      {r.title}
                    </a>
                    {r.creator_name && (
                      <p className="mt-0.5 text-xs" style={{ color: '#7a6e67' }}>
                        shared by {r.creator_name}
                      </p>
                    )}
                    {r.description && (
                      <p className="mt-2 text-sm line-clamp-3" style={{ color: '#9a8e87' }}>
                        {r.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <ResourceSaveButton
                      url={r.url}
                      title={r.title}
                      resourceType={r.resource_type}
                      description={r.description}
                      source={r.source}
                    />
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}
                    >
                      Open →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
