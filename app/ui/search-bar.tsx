'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type RecentSearch = { query: string; created_at: string }

export default function SearchBar() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [query, setQuery]           = useState(searchParams.get('q') ?? '')
  const [recents, setRecents]       = useState<RecentSearch[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tokenRef   = useRef<string | null>(null)

  // Load recent searches once on mount (silently skipped if not logged in)
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      tokenRef.current = session.access_token
      const res = await fetch('/api/search-history', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setRecents(await res.json())
    }
    load()
  }, [])

  // Close dropdown on outside click (mousedown so it fires before blur)
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  async function getToken(): Promise<string | null> {
    if (tokenRef.current) return tokenRef.current
    const { data: { session } } = await supabase.auth.getSession()
    tokenRef.current = session?.access_token ?? null
    return tokenRef.current
  }

  function logSearch(q: string) {
    // Fire and forget — update local state optimistically
    setRecents(prev => {
      const deduped = prev.filter(r => r.query !== q)
      return [{ query: q, created_at: new Date().toISOString() }, ...deduped].slice(0, 20)
    })
    getToken().then(token => {
      if (!token) return
      fetch('/api/search-history', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      }).catch(() => {})
    })
  }

  function navigate(q: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', q)
    router.push(`/search?${params.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setShowDropdown(false)
    logSearch(q)
    navigate(q)
  }

  function handleRecentClick(q: string) {
    setQuery(q)
    setShowDropdown(false)
    logSearch(q)
    navigate(q)
  }

  function clearHistory() {
    setRecents([])
    setShowDropdown(false)
    getToken().then(token => {
      if (!token) return
      fetch('/api/search-history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    })
  }

  const displayRecents = recents.slice(0, 8)

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">

        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
            onChange={e => setQuery(e.target.value)}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#D4A5A0'
              if (displayRecents.length > 0) setShowDropdown(true)
            }}
            onBlur={e => (e.currentTarget.style.borderColor = '#4a4440')}
            placeholder="Search patterns, yarn weights, techniques…"
            className="w-full rounded-xl py-4 pl-12 pr-4 text-base outline-none transition-all"
            style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }}
          />
        </div>

        <button
          type="submit"
          className="rounded-xl px-6 py-4 font-semibold text-white transition-colors"
          style={{ backgroundColor: '#D4A5A0' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#D4A5A0')}
        >
          Search
        </button>
      </form>

      {/* Recent searches dropdown */}
      {showDropdown && displayRecents.length > 0 && (
        <div
          className="absolute left-0 right-12 top-full mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ backgroundColor: '#2a2724', border: '1px solid #4a4440' }}
        >
          <div className="flex items-center justify-between px-3 py-2"
               style={{ borderBottom: '1px solid #3a3530' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7a6e67' }}>
              Recent searches
            </span>
            <button
              onClick={clearHistory}
              className="text-xs transition-colors hover:text-white"
              style={{ color: '#5a504a' }}
            >
              Clear
            </button>
          </div>

          {displayRecents.map(r => (
            <button
              key={r.query}
              onClick={() => handleRecentClick(r.query)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#3a3530]"
              style={{ color: '#c4b8ae' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   style={{ color: '#5a504a', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {r.query}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
