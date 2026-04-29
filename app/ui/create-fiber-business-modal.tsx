'use client'

import { useEffect, useRef, useState } from 'react'

const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }
const FOCUS = '#C06B45'
const BLUR  = '#4a4440'

export type FiberBusinessPayload = {
  name: string
  business_type: string
  what_they_offer: string
  fiber_arts_programs: boolean
  programs_description: string
  animal_breeds: string
  services_offered: string
  about: string
  location_city: string
  location_state: string
  location_zip: string
  link: string
}

const BUSINESS_TYPES = [
  { value: 'farm',      label: 'Farm' },
  { value: 'mill',      label: 'Mill' },
  { value: 'yarn_shop', label: 'Yarn Shop' },
  { value: 'dyer',      label: 'Dyer' },
  { value: 'other',     label: 'Other' },
]

type Props = {
  onSave: (payload: FiberBusinessPayload) => Promise<void>
  onClose: () => void
}

export function CreateFiberBusinessModal({ onSave, onClose }: Props) {
  const [name, setName]                   = useState('')
  const [businessType, setBusinessType]   = useState('yarn_shop')
  const [whatTheyOffer, setWhatTheyOffer] = useState('')
  const [programs, setPrograms]           = useState(false)
  const [programsDesc, setProgramsDesc]   = useState('')
  const [breeds, setBreeds]               = useState('')
  const [services, setServices]           = useState('')
  const [about, setAbout]                 = useState('')
  const [city, setCity]                   = useState('')
  const [state, setState]                 = useState('')
  const [zip, setZip]                     = useState('')
  const [link, setLink]                   = useState('')
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    try {
      await onSave({
        name: name.trim(),
        business_type: businessType,
        what_they_offer: whatTheyOffer,
        fiber_arts_programs: programs,
        programs_description: programsDesc,
        animal_breeds: breeds,
        services_offered: services,
        about,
        location_city: city,
        location_state: state,
        location_zip: zip,
        link,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post business.')
    }
    setSaving(false)
  }

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
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#f5f0eb' }}>List Your Business</h2>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1 1l10 10M11 1 1 11" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
                Business name <span style={{ color: FOCUS }}>*</span>
              </label>
              <input ref={nameRef} {...inp(name, setName)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
                Business type <span style={{ color: FOCUS }}>*</span>
              </label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
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
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Animal breeds (farms/mills)</label>
              <input {...inp(breeds, setBreeds)} placeholder="e.g. Merino, Alpaca, Corriedale" />
            </div>

            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: '#38342f', border: '1px solid #4a4440' }}>
              <input
                id="programs"
                type="checkbox"
                checked={programs}
                onChange={e => setPrograms(e.target.checked)}
                className="h-4 w-4 rounded accent-[#C06B45]"
              />
              <label htmlFor="programs" className="text-sm cursor-pointer" style={{ color: '#c4b8ae' }}>
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
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Website URL (fetches preview image)</label>
              <input type="url" {...inp(link, setLink)} placeholder="https://…" />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                   style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}>
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl py-2 text-sm font-medium"
                style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: FOCUS }}>
                {saving ? 'Posting…' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
