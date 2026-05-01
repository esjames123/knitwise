'use client'

import { useEffect, useRef, useState } from 'react'

export type GroupPayload = {
  name: string
  description: string
  what_to_bring: string
  community_outreach: string
  location_city: string
  location_state: string
  location_zip: string
  link: string
}

const INPUT = {
  backgroundColor: '#38342f',
  border: '1px solid #4a4440',
  color: '#f5f0eb',
}

const FOCUS_COLOR = '#D4A5A0'
const BLUR_COLOR  = '#4a4440'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
        {label} {required && <span style={{ color: FOCUS_COLOR }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function CreateGroupModal({
  onSave,
  onClose,
}: {
  onSave: (payload: GroupPayload) => Promise<void>
  onClose: () => void
}) {
  const [name, setName]                   = useState('')
  const [description, setDescription]     = useState('')
  const [whatToBring, setWhatToBring]     = useState('')
  const [outreach, setOutreach]           = useState('')
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

  function inputProps(value: string, onChange: (v: string) => void) {
    return {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      className: 'w-full rounded-xl px-4 py-2.5 text-sm outline-none',
      style: INPUT,
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = FOCUS_COLOR),
      onBlur:  (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = BLUR_COLOR),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Group name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), description, what_to_bring: whatToBring,
                     community_outreach: outreach, location_city: city,
                     location_state: state, location_zip: zip, link })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save group.')
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative my-4 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}
      >
        <h2 className="mb-5 text-lg font-bold" style={{ color: '#f5f0eb' }}>Post Your Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Group name" required>
            <input ref={nameRef} type="text" placeholder="e.g. Downtown Fiber Circle" {...inputProps(name, setName)} />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does your group do? When do you meet?"
              rows={3}
              className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
              style={INPUT}
              onFocus={e => (e.currentTarget.style.borderColor = FOCUS_COLOR)}
              onBlur={e  => (e.currentTarget.style.borderColor = BLUR_COLOR)}
            />
          </Field>

          <Field label="What to bring">
            <input type="text" placeholder="Yarn, needles, a snack to share…" {...inputProps(whatToBring, setWhatToBring)} />
          </Field>

          <Field label="Community outreach">
            <input type="text" placeholder="All skill levels welcome, beginner-friendly…" {...inputProps(outreach, setOutreach)} />
          </Field>

          {/* Location row */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="City">
              <input type="text" placeholder="Portland" {...inputProps(city, setCity)} />
            </Field>
            <Field label="State">
              <input type="text" placeholder="OR" maxLength={2} {...inputProps(state, setState)} />
            </Field>
            <Field label="ZIP">
              <input type="text" placeholder="97201" maxLength={10} {...inputProps(zip, setZip)} />
            </Field>
          </div>

          <Field label="Link (website, Meetup, Instagram…)">
            <input type="url" placeholder="https://…" {...inputProps(link, setLink)} />
          </Field>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: '#3a1a1a', border: '1px solid #8a3a3a', color: '#e0a090' }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: '#D4A5A0' }}
            >
              {saving ? 'Posting…' : 'Post Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
