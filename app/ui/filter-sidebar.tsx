'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const CRAFTS = [
  { value: 'knitting', label: 'Knitting' },
  { value: 'crochet', label: 'Crochet' },
  { value: 'weaving', label: 'Weaving' },
  { value: 'spinning', label: 'Spinning' },
]

const WEIGHTS = [
  { value: 'lace', label: 'Lace' },
  { value: 'fingering', label: 'Fingering' },
  { value: 'sport', label: 'Sport' },
  { value: 'dk', label: 'DK' },
  { value: 'worsted', label: 'Worsted' },
  { value: 'bulky', label: 'Bulky' },
  { value: 'super_bulky', label: 'Super Bulky' },
]

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'easy', label: 'Easy' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'expert', label: 'Expert' },
]

const PATTERN_TYPES = [
  { value: 'sweater', label: 'Sweater' },
  { value: 'cardigan', label: 'Cardigan' },
  { value: 'hat', label: 'Hat' },
  { value: 'scarf', label: 'Scarf' },
  { value: 'shawl', label: 'Shawl / Wrap' },
  { value: 'socks', label: 'Socks' },
  { value: 'mittens', label: 'Mittens' },
  { value: 'blanket', label: 'Blanket' },
  { value: 'bag', label: 'Bag' },
  { value: 'toy', label: 'Toy' },
]

const SIZES = [
  { value: 'baby', label: 'Baby' },
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' },
  { value: 'plus', label: 'Plus Size' },
]

const YARDAGE_PRESETS = [
  { value: 'under200',  label: 'Under 200 yards' },
  { value: '200to400',  label: '200–400 yards'   },
  { value: '400to800',  label: '400–800 yards'   },
  { value: '800to1500', label: '800–1500 yards'  },
  { value: '1500plus',  label: '1500+ yards'     },
]

const NEEDLE_PRESETS = [
  { value: 'us0to2',      label: 'US 0–2 (lace/fingering)' },
  { value: 'us3to5',      label: 'US 3–5 (sport/DK)'       },
  { value: 'us6to8',      label: 'US 6–8 (worsted)'        },
  { value: 'us9to11',     label: 'US 9–11 (bulky)'         },
  { value: 'us13plus',    label: 'US 13+ (super bulky)'    },
  { value: 'crochet2to4', label: '2mm–4mm crochet'         },
  { value: 'crochet5to7', label: '5mm–7mm crochet'         },
  { value: 'crochet8plus', label: '8mm+ crochet'           },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms',
        flexShrink: 0,
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SectionHeader({
  label,
  open,
  onToggle,
}: {
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 text-sm font-semibold uppercase tracking-wider"
      style={{ color: '#c4b8ae', letterSpacing: '0.08em' }}
    >
      {label}
      <ChevronIcon open={open} />
    </button>
  )
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm" style={{ color: '#e8e0d8' }}>
      <span
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded"
        style={{
          backgroundColor: checked ? '#C06B45' : 'transparent',
          border: checked ? '1px solid #C06B45' : '1px solid #5a5048',
          transition: 'all 150ms',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  )
}

function RadioItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm" style={{ color: '#e8e0d8' }}>
      <span
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          border: checked ? '1px solid #C06B45' : '1px solid #5a5048',
          transition: 'all 150ms',
        }}
      >
        {checked && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: '#C06B45' }}
          />
        )}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  )
}

const divider = <div style={{ borderTop: '1px solid #3a3530', marginTop: '12px', marginBottom: '4px' }} />

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState<Record<string, boolean>>({
    sort: true,
    craft: true,
    price: true,
    type: true,
    weight: true,
    difficulty: true,
    rating: true,
    sizes: false,
    yardage: false,
    needle: false,
  })

  function toggle(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function getParam(key: string) {
    return searchParams.get(key) ?? ''
  }

  function getMulti(key: string): string[] {
    return searchParams.get(key)?.split(',').filter(Boolean) ?? []
  }

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (!value || value === 'any') {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    router.push(`/search?${p.toString()}`)
  }

  function toggleMulti(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    const current = p.get(key)?.split(',').filter(Boolean) ?? []
    const idx = current.indexOf(value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(value)
    if (current.length === 0) p.delete(key)
    else p.set(key, current.join(','))
    router.push(`/search?${p.toString()}`)
  }

const crafts    = getMulti('craft')
  const weights   = getMulti('weight')
  const diffs     = getMulti('difficulty')
  const types     = getMulti('type')
  const sizes     = getMulti('sizes')
  const price     = getParam('price')
  const sort      = getParam('sort') || 'popularity'
  const rating    = getParam('rating')
  const yardages  = getMulti('yardage')
  const needles   = getMulti('needle')

  const hasFilters =
    crafts.length > 0 || weights.length > 0 || diffs.length > 0 ||
    types.length > 0 || sizes.length > 0 || price || rating ||
    (sort && sort !== 'popularity') || yardages.length > 0 || needles.length > 0

  function clearAll() {
    const q = searchParams.get('q')
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.push(`/search?${p.toString()}`)
  }

  return (
    <aside
      className="rounded-2xl p-5 text-sm"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-bold" style={{ color: '#f5f0eb' }}>Filters</span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-medium transition-colors"
            style={{ color: '#C06B45' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4845f')}
            onMouseLeave={e => (e.currentTarget.style.color = '#C06B45')}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sort By */}
      <SectionHeader label="Sort by" open={open.sort} onToggle={() => toggle('sort')} />
      {open.sort && (
        <div className="mb-2 mt-1">
          {[
            { value: 'popularity', label: 'Most Popular' },
            { value: 'date',       label: 'Newest' },
            { value: 'rating',     label: 'Highest Rated' },
            { value: 'projects',   label: 'Most Projects' },
          ].map(opt => (
            <RadioItem
              key={opt.value}
              label={opt.label}
              checked={sort === opt.value}
              onChange={() => setParam('sort', opt.value === 'popularity' ? '' : opt.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Craft Type */}
      <SectionHeader label="Craft Type" open={open.craft} onToggle={() => toggle('craft')} />
      {open.craft && (
        <div className="mb-2 mt-1">
          {CRAFTS.map(c => (
            <CheckItem
              key={c.value}
              label={c.label}
              checked={crafts.includes(c.value)}
              onChange={() => toggleMulti('craft', c.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Price */}
      <SectionHeader label="Price" open={open.price} onToggle={() => toggle('price')} />
      {open.price && (
        <div className="mb-2 mt-1">
          {[
            { value: '',     label: 'Any' },
            { value: 'free', label: 'Free only' },
            { value: 'paid', label: 'Paid only' },
          ].map(opt => (
            <RadioItem
              key={opt.value}
              label={opt.label}
              checked={price === opt.value}
              onChange={() => setParam('price', opt.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Pattern Type */}
      <SectionHeader label="Pattern Type" open={open.type} onToggle={() => toggle('type')} />
      {open.type && (
        <div className="mb-2 mt-1">
          {PATTERN_TYPES.map(t => (
            <CheckItem
              key={t.value}
              label={t.label}
              checked={types.includes(t.value)}
              onChange={() => toggleMulti('type', t.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Yarn Weight */}
      <SectionHeader label="Yarn Weight" open={open.weight} onToggle={() => toggle('weight')} />
      {open.weight && (
        <div className="mb-2 mt-1">
          {WEIGHTS.map(w => (
            <CheckItem
              key={w.value}
              label={w.label}
              checked={weights.includes(w.value)}
              onChange={() => toggleMulti('weight', w.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Difficulty */}
      <SectionHeader label="Difficulty" open={open.difficulty} onToggle={() => toggle('difficulty')} />
      {open.difficulty && (
        <div className="mb-2 mt-1">
          {DIFFICULTIES.map(d => (
            <CheckItem
              key={d.value}
              label={d.label}
              checked={diffs.includes(d.value)}
              onChange={() => toggleMulti('difficulty', d.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Rating */}
      <SectionHeader label="Rating" open={open.rating} onToggle={() => toggle('rating')} />
      {open.rating && (
        <div className="mb-2 mt-1">
          {[
            { value: '',  label: 'Any rating' },
            { value: '3', label: '3+ stars ★★★' },
            { value: '4', label: '4+ stars ★★★★' },
          ].map(opt => (
            <RadioItem
              key={opt.value}
              label={opt.label}
              checked={rating === opt.value}
              onChange={() => setParam('rating', opt.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Available Sizes */}
      <SectionHeader label="Available Sizes" open={open.sizes} onToggle={() => toggle('sizes')} />
      {open.sizes && (
        <div className="mb-2 mt-1">
          {SIZES.map(s => (
            <CheckItem
              key={s.value}
              label={s.label}
              checked={sizes.includes(s.value)}
              onChange={() => toggleMulti('sizes', s.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Yardage Range */}
      <SectionHeader label="Yardage Range" open={open.yardage} onToggle={() => toggle('yardage')} />
      {open.yardage && (
        <div className="mb-2 mt-1">
          {YARDAGE_PRESETS.map(p => (
            <CheckItem
              key={p.value}
              label={p.label}
              checked={yardages.includes(p.value)}
              onChange={() => toggleMulti('yardage', p.value)}
            />
          ))}
        </div>
      )}

      {divider}

      {/* Needle / Hook Size */}
      <SectionHeader label="Needle / Hook Size" open={open.needle} onToggle={() => toggle('needle')} />
      {open.needle && (
        <div className="mb-2 mt-1">
          {NEEDLE_PRESETS.map(p => (
            <CheckItem
              key={p.value}
              label={p.label}
              checked={needles.includes(p.value)}
              onChange={() => toggleMulti('needle', p.value)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}

