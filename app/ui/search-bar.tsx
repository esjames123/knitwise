'use client'

import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <form onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-2xl items-center gap-2">

      <div className="relative flex-1">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2"
             style={{ color: '#9a8e87' }}
             width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patterns, yarn weights, techniques…"
          className="w-full rounded-xl py-4 pl-12 pr-4 text-base outline-none transition-all"
          style={{
            backgroundColor: '#38342f',
            border: '1px solid #4a4440',
            color: '#f5f0eb',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C06B45')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#4a4440')}
        />
      </div>

      <button
        type="submit"
        className="rounded-xl px-6 py-4 font-semibold text-white transition-colors"
        style={{ backgroundColor: '#C06B45' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A8572F')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C06B45')}
      >
        Search
      </button>
    </form>
  )
}
