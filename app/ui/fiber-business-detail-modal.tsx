'use client'

import { useEffect, useState } from 'react'
import type { FiberBusiness } from './fiber-business-card'

const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }
const FOCUS = '#D4A5A0'
const BLUR  = '#4a4440'

const BUSINESS_TYPES = [
  { value: 'farm',      label: 'Farm' },
  { value: 'mill',      label: 'Mill' },
  { value: 'yarn_shop', label: 'Yarn Shop' },
  { value: 'dyer',      label: 'Dyer' },
  { value: 'other',     label: 'Other' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>{title}</p>
      <div className="text-sm leading-relaxed" style={{ color: '#c4b8ae' }}>{children}</div>
    </div>
  )
}

type Props = {
  business: FiberBusiness
  userId: string | null
  onClose: () => void
  onDelete: () => void
  onFlag: () => void
  onUpdated: (b: FiberBusiness) => void
}

export function FiberBusinessDetailModal({ business, userId, onClose, onDelete, onFlag, onUpdated }: Props) {
  const isOwner = userId === business.user_id
  const [editing, setEditing] = useState(false)

  const [name, setName]               = useState(business.name)
  const [businessType, setBusinessType] = useState(business.business_type)
  const [whatTheyOffer, setWhatTheyOffer] = useState(business.what_they_offer ?? '')
  const [programs, setPrograms]       = useState(business.fiber_arts_programs)
  const [programsDesc, setProgramsDesc] = useState(business.programs_description ?? '')
  const [breeds, setBreeds]           = useState(business.animal_breeds ?? '')
  const [services, setServices]       = useState(business.services_offered ?? '')
  const [about, setAbout]             = useState(business.about ?? '')
  const [city, setCity]               = useState(business.location_city ?? '')
  const [state, setState]             = useState(business.location_state ?? '')
  const [zip, setZip]                 = useState(business.location_zip ?? '')
  const [link, setLink]               = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function inp(value: string, onChange: (v: string) => void, extra?: Partial<React.InputHTMLAttributes<HTMLInputElement>>) {
    return {
      value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      className: 'w-full rounded-xl px-3 py-2 text-sm outline-none',
      style: INPUT,
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = FOCUS),
      onBlur:  (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = BLUR),
      ...extra,
    }
  }

  async function handleSave() {
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession()
      if (!session) { setError('Not logged in.'); setSaving(false); return }
      const res = await fetch(`/api/fiber-businesses/${business.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, business_type: businessType, what_they_offer: whatTheyOffer,
          fiber_arts_programs: programs, programs_description: programsDesc,
          animal_breeds: breeds, services_offered: services, about,
          location_city: city, location_state: state, location_zip: zip, link,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Could not update listing.'); setSaving(false); return }
      onUpdated(json as FiberBusiness)
      setEditing(false)
    } catch {
      setError('Network error.')
    }
    setSaving(false)
  }

  const TYPE_LABEL = BUSINESS_TYPES.find(t => t.value === business.business_type)?.label ?? business.business_type
  const locParts = [business.location_city, business.location_state].filter(Boolean).join(', ')
  const loc = locParts + (business.location_zip ? (locParts ? ` ${business.location_zip}` : business.location_zip) : '')

  const textareaStyle = {
    ...INPUT,
    width: '100%', resize: 'none' as const, borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none',
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative my-4 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}
      >
        {/* Image */}
        <div className="relative w-full" style={{ height: '200px' }}>
          {business.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.image_url} alt={business.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #2e1a0e 0%, #6b3a1f 50%, #3a1e0a 100%)',
            }} />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(26,23,20,0.8)', backdropFilter: 'blur(6px)', color: '#f5f0eb' }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1l10 10M11 1 1 11" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Name <span style={{ color: FOCUS }}>*</span></label>
                <input {...inp(name, setName)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Business type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as FiberBusiness['business_type'])}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={INPUT}
                  onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                >
                  {BUSINESS_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>About</label>
                <textarea
                  value={about} onChange={e => setAbout(e.target.value)} rows={2}
                  style={textareaStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                  onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>What they offer</label>
                <input {...inp(whatTheyOffer, setWhatTheyOffer)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Services offered</label>
                <input {...inp(services, setServices)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Animal breeds</label>
                <input {...inp(breeds, setBreeds)} />
              </div>

              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }}>
                <input
                  id="edit-programs"
                  type="checkbox"
                  checked={programs}
                  onChange={e => setPrograms(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#D4A5A0]"
                />
                <label htmlFor="edit-programs" className="text-sm cursor-pointer" style={{ color: '#c4b8ae' }}>
                  Offers fiber arts programs / classes
                </label>
              </div>

              {programs && (
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Program details</label>
                  <textarea
                    value={programsDesc} onChange={e => setProgramsDesc(e.target.value)} rows={2}
                    style={textareaStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = FOCUS)}
                    onBlur={e  => (e.currentTarget.style.borderColor = BLUR)}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {([['City', city, setCity], ['State', state, setState], ['ZIP', zip, setZip]] as const).map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>{label}</label>
                    <input {...inp(val as string, setter as (v: string) => void)} />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>New website URL (re-fetches image)</label>
                <input type="url" {...inp(link, setLink)} placeholder="https://…" />
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setEditing(false); setError(null) }}
                  className="flex-1 rounded-xl py-2 text-sm font-medium"
                  style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: FOCUS }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-start gap-2">
                  <h2 className="text-xl font-bold" style={{ color: '#f5f0eb' }}>{business.name}</h2>
                  <span className="mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: '#3a2210', border: '1px solid #6b3a1f', color: '#d4956a' }}>
                    {TYPE_LABEL}
                  </span>
                </div>
                {loc && <p className="mt-0.5 text-sm" style={{ color: '#9a8e87' }}>{loc}</p>}
              </div>

              {business.about && <Section title="About">{business.about}</Section>}
              {business.what_they_offer && <Section title="What they offer">{business.what_they_offer}</Section>}
              {business.services_offered && <Section title="Services">{business.services_offered}</Section>}
              {business.animal_breeds && <Section title="Animal breeds">{business.animal_breeds}</Section>}
              {business.fiber_arts_programs && (
                <Section title="Fiber arts programs">
                  {business.programs_description || 'This business offers fiber arts programs and classes.'}
                </Section>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {isOwner && (
                  <>
                    <button onClick={() => setEditing(true)}
                      className="rounded-xl px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#c4b8ae' }}>
                      Edit
                    </button>
                    <button onClick={onDelete}
                      className="rounded-xl px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: '#3a1a1a', border: '1px solid #6a2a2a', color: '#e08080' }}>
                      Delete
                    </button>
                  </>
                )}
                {!isOwner && userId && (
                  <button onClick={onFlag}
                    className="rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                    Report
                  </button>
                )}
                <button onClick={onClose}
                  className="ml-auto rounded-xl px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
