'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export type StashPattern = {
  id: string
  pattern_name: string
  designer_name: string | null
  permalink: string
  photo_url: string | null
  collection_id: string | null
  notes: string | null
}

export type StashCollection = {
  id: string
  name: string
  color: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Return up to 3 lines from notes that mention the yarn. */
function relevantLines(notes: string, yarn: string): string {
  const re = new RegExp(escapeRegex(yarn), 'i')
  return notes
    .split('\n')
    .filter(l => re.test(l))
    .slice(0, 3)
    .join('\n')
    .trim()
}

function HighlightedText({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(term)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: '#C06B45',
              color: '#fff',
              borderRadius: '3px',
              padding: '0 2px',
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

// ── Result card ────────────────────────────────────────────────────────────────

function ResultCard({ pattern, yarn }: { pattern: StashPattern; yarn: string }) {
  const preview = relevantLines(pattern.notes!, yarn)

  return (
    <div
      className="flex gap-3 rounded-xl p-3 transition-colors"
      style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 overflow-hidden rounded-lg"
        style={{ width: 60, height: 60, backgroundColor: '#2e2b28' }}
      >
        {pattern.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pattern.photo_url}
            alt={pattern.pattern_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: 'linear-gradient(135deg, #3a2a1e 0%, #C06B45 100%)', opacity: 0.7 }}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: '#f5f0eb' }}>
              {pattern.pattern_name}
            </p>
            {pattern.designer_name && (
              <p className="text-xs" style={{ color: '#7a6e67' }}>by {pattern.designer_name}</p>
            )}
          </div>
          <Link
            href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-xs font-medium transition-colors hover:underline"
            style={{ color: '#C06B45' }}
          >
            View →
          </Link>
        </div>

        {preview && (
          <p
            className="text-xs leading-relaxed whitespace-pre-line line-clamp-3"
            style={{ color: '#9a8e87' }}
          >
            <HighlightedText text={preview} term={yarn} />
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StashBuster({
  patterns,
  collections,
}: {
  patterns: StashPattern[]
  collections: StashCollection[]
}) {
  const [yarn, setYarn]           = useState('')
  const [selectedColls, setSelectedColls] = useState<Set<string>>(new Set())

  const yarnQ = yarn.trim()
  const patternsWithNotes = patterns.filter(p => p.notes).length

  const results = useMemo(() => {
    if (!yarnQ) return []
    const re = new RegExp(escapeRegex(yarnQ), 'i')
    return patterns.filter(p => {
      if (!p.notes || !re.test(p.notes)) return false
      if (selectedColls.size > 0 && !selectedColls.has(p.collection_id ?? '')) return false
      return true
    })
  }, [yarnQ, patterns, selectedColls])

  function toggleColl(id: string) {
    setSelectedColls(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleYarnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setYarn(e.target.value)
    // Reset collection filter on new yarn search
    if (!e.target.value.trim()) setSelectedColls(new Set())
  }

  const hasCollFilter = selectedColls.size > 0
  const showFilters   = !!yarnQ && collections.length > 0

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
    >
      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 select-none text-2xl leading-none">🧶</span>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#f5f0eb' }}>
            Stash Busting Tool
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: '#7a6e67' }}>
            {patternsWithNotes > 0
              ? `Search your notes to find patterns for yarn you already have · ${patternsWithNotes} pattern${patternsWithNotes === 1 ? '' : 's'} with notes`
              : 'Search your pattern notes to find projects for yarn you already have'}
          </p>
        </div>
      </div>

      {/* Yarn search input */}
      <input
        type="text"
        value={yarn}
        onChange={handleYarnChange}
        placeholder="What yarn do you have? e.g. Merino, Cotton, Malabrigo Rios…"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
        onFocus={e  => (e.currentTarget.style.borderColor = '#C06B45')}
        onBlur={e   => (e.currentTarget.style.borderColor = '#4a4440')}
      />

      {/* Empty-input hint */}
      {!yarnQ && patternsWithNotes === 0 && (
        <p className="mt-3 text-xs" style={{ color: '#5a504a' }}>
          Add notes to patterns using the ✏️ icon on each card — include the yarn you plan to use, then search here to find your projects.
        </p>
      )}

      {/* Results area */}
      {yarnQ && (
        <div className="mt-5">

          {/* Results count */}
          <p
            className="mb-4 text-sm font-semibold"
            style={{ color: results.length > 0 ? '#C06B45' : '#7a6e67' }}
          >
            {results.length === 0
              ? `No patterns mention "${yarnQ}" in their notes${hasCollFilter ? ' with these filters' : ''}`
              : `🎉 ${results.length} pattern${results.length === 1 ? '' : 's'} match your stash!`}
          </p>

          <div className="flex gap-6">

            {/* Filter sidebar */}
            {showFilters && (
              <div className="hidden w-40 flex-shrink-0 sm:block">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider"
                   style={{ color: '#7a6e67' }}>
                  Collection
                </p>
                <div className="space-y-2">
                  {collections.map(c => (
                    <label key={c.id} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedColls.has(c.id)}
                        onChange={() => toggleColl(c.id)}
                        style={{ accentColor: c.color, width: 14, height: 14 }}
                      />
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="truncate text-sm" style={{ color: '#c4b8ae' }}>
                          {c.name}
                        </span>
                      </div>
                    </label>
                  ))}
                  {hasCollFilter && (
                    <button
                      onClick={() => setSelectedColls(new Set())}
                      className="text-xs transition-colors hover:text-white"
                      style={{ color: '#5a504a' }}
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results list */}
            <div className="min-w-0 flex-1 space-y-3">
              {results.map(p => (
                <ResultCard key={p.id} pattern={p} yarn={yarnQ} />
              ))}

              {results.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: '#5a504a' }}>
                    No matches yet.{' '}
                    {patternsWithNotes === 0
                      ? 'Add notes to your patterns with the ✏️ icon and include the yarn you plan to use!'
                      : 'Try a different yarn name, or add more notes to your patterns.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
