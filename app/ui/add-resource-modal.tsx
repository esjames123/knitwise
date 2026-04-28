'use client'

import { useEffect, useRef, useState } from 'react'

export type ResourcePayload = {
  title: string
  url: string
  resource_type: string
  description: string
  source: string
}

const RESOURCE_TYPE_OPTIONS = [
  { value: 'weaving',  label: 'Weaving'  },
  { value: 'spinning', label: 'Spinning' },
  { value: 'dyeing',   label: 'Dyeing'   },
  { value: 'knitting', label: 'Knitting' },
  { value: 'crochet',  label: 'Crochet'  },
  { value: 'other',    label: 'Other'    },
]

const INPUT_STYLE = {
  backgroundColor: '#38342f',
  border: '1px solid #4a4440',
  color: '#f5f0eb',
}

export function AddResourceModal({
  onSave,
  onClose,
}: {
  onSave: (payload: ResourcePayload) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle]               = useState('')
  const [url, setUrl]                   = useState('')
  const [resourceType, setResourceType] = useState('other')
  const [description, setDescription]  = useState('')
  const [source, setSource]            = useState('')
  const [saving, setSaving]            = useState(false)
  const [error, setError]              = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) { setError('Title and URL are required.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({ title: title.trim(), url: url.trim(), resource_type: resourceType, description: description.trim(), source: source.trim() })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save resource.')
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: '#2e2b28', border: '1px solid #4a4440' }}
      >
        <h2 className="mb-5 text-lg font-bold" style={{ color: '#f5f0eb' }}>Add Resource</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
              Title <span style={{ color: '#C06B45' }}>*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Rigid Heddle Weaving for Beginners"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={INPUT_STYLE}
              onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>
              URL <span style={{ color: '#C06B45' }}>*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={INPUT_STYLE}
              onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {/* Type + Source row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Type</label>
              <select
                value={resourceType}
                onChange={e => setResourceType(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
                style={INPUT_STYLE}
              >
                {RESOURCE_TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Source</label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="YouTube, Blog…"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={INPUT_STYLE}
                onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: '#9a8e87' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this resource about?"
              rows={3}
              className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
              style={INPUT_STYLE}
              onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
              onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#e0a090' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#C06B45' }}
            >
              {saving ? 'Saving…' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
