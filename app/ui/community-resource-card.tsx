'use client'

export type CommunityResource = {
  id: string
  user_id: string
  title: string
  link: string
  category: 'beginner_knitting' | 'crochet' | 'weaving' | 'spinning' | 'felting' | 'dyeing' | 'other'
  description: string | null
  image_url: string | null
  creator_name: string | null
  created_at: string
  updated_at: string
  flag_count: number
  is_flagged: boolean
}

const CATEGORY_LABELS: Record<CommunityResource['category'], string> = {
  beginner_knitting: 'Beginner Knitting',
  crochet:           'Crochet',
  weaving:           'Weaving',
  spinning:          'Spinning',
  felting:           'Felting',
  dyeing:            'Dyeing',
  other:             'Other',
}

type Props = {
  resource: CommunityResource
  isOwner: boolean
  onView: () => void
  onDelete: () => void
  onFlag: () => void
}

export function CommunityResourceCard({ resource, isOwner, onView, onDelete, onFlag }: Props) {
  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:z-10 transition-transform hover:-translate-y-1"
      style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530', position: 'relative' }}
      onClick={onView}
    >
      {/* Image area */}
      <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
        {resource.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resource.image_url}
            alt={resource.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #1e2a1e 0%, #3a5a3a 50%, #1a2e1a 100%)',
            opacity: 0.85,
          }} />
        )}

        {/* Category badge — bottom left */}
        <span
          className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: 'rgba(26,36,26,0.85)', border: '1px solid #3a5a3a', color: '#8abf8a', backdropFilter: 'blur(4px)' }}
        >
          {CATEGORY_LABELS[resource.category]}
        </span>

        {/* Owner delete — top right */}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            aria-label="Delete resource"
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
        {!isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onFlag() }}
            aria-label="Report resource"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-colors"
            style={{ backgroundColor: 'rgba(26,23,20,0.75)', backdropFilter: 'blur(6px)', color: '#9a8e87' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e0a090')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9a8e87')}
            title="Report this resource"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="font-semibold leading-snug hover:underline"
          style={{ color: '#f5f0eb' }}
        >
          {resource.title}
        </a>
        {resource.creator_name && (
          <p className="text-xs" style={{ color: '#7a6e67' }}>{resource.creator_name}</p>
        )}
        {resource.description && (
          <p className="text-sm line-clamp-2 leading-relaxed mt-1" style={{ color: '#9a8e87' }}>
            {resource.description}
          </p>
        )}
      </div>
    </div>
  )
}
