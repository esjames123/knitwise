'use client'

export type Group = {
  id: string
  user_id: string
  name: string
  description: string | null
  what_to_bring: string | null
  community_outreach: string | null
  location_city: string | null
  location_state: string | null
  location_zip: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  flag_count: number
  is_flagged: boolean
}

type Props = {
  group: Group
  userId: string | null
  onView: () => void
  onDelete: () => void
  onFlag: () => void
}

function locationLabel(g: Group): string {
  const parts = [g.location_city, g.location_state].filter(Boolean)
  if (parts.length) return parts.join(', ') + (g.location_zip ? ` ${g.location_zip}` : '')
  return g.location_zip ?? ''
}

export function GroupCard({ group, userId, onView, onDelete, onFlag }: Props) {
  const isOwner = userId === group.user_id
  const loc = locationLabel(group)

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:z-10 transition-transform hover:-translate-y-1"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530', position: 'relative' }}
      onClick={onView}
    >
      {/* Image area */}
      <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
        {group.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={group.image_url}
            alt={group.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #1a2e1a 0%, #3a6a3a 50%, #1e4a2a 100%)',
            opacity: 0.85,
          }} />
        )}

        {/* Location badge */}
        {loc && (
          <span
            className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: 'rgba(26,40,26,0.85)', border: '1px solid #2a5a3a', color: '#6dcfa0', backdropFilter: 'blur(4px)' }}
          >
            {loc}
          </span>
        )}

        {/* Owner delete — top right */}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            aria-label="Delete group"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-colors"
            style={{ backgroundColor: 'rgba(26,23,20,0.75)', backdropFilter: 'blur(6px)', color: '#9a8e87' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e08080')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9a8e87')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        )}

        {/* Non-owner flag — top right */}
        {!isOwner && userId && (
          <button
            onClick={e => { e.stopPropagation(); onFlag() }}
            aria-label="Report group"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-colors"
            style={{ backgroundColor: 'rgba(26,23,20,0.75)', backdropFilter: 'blur(6px)', color: '#9a8e87' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e0a090')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9a8e87')}
            title="Report this group"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug" style={{ color: '#f5f0eb' }}>
          {group.name}
        </h3>
        {group.description && (
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#9a8e87' }}>
            {group.description}
          </p>
        )}
        <p className="mt-auto pt-1 text-xs" style={{ color: '#5a504a' }}>
          Click to view details
        </p>
      </div>
    </div>
  )
}
