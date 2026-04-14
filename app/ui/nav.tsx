'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogOut() {
    await supabase.auth.signOut()
  }

  return (
    <nav style={{ backgroundColor: '#1e1c1a', borderBottom: '1px solid #3a3530' }}
         className="sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/"
              className="text-2xl tracking-tight"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}>
          Knit<em style={{ color: '#C06B45', fontStyle: 'italic' }}>wise</em>
        </Link>

        <div className="hidden items-center gap-8 text-sm sm:flex" style={{ color: '#c4b8ae' }}>
          <Link href="#" className="hover:text-white transition-colors" style={{ color: '#c4b8ae' }}>Explore</Link>
          <Link href="#" className="hover:text-white transition-colors" style={{ color: '#c4b8ae' }}>Designers</Link>
          <Link href="#" className="hover:text-white transition-colors" style={{ color: '#c4b8ae' }}>Your Stash</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm sm:block" style={{ color: '#c4b8ae' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogOut}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors bg-[#C06B45] hover:bg-[#A8572F]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm sm:block transition-colors" style={{ color: '#c4b8ae' }}>
                Log in
              </Link>
              <Link href="/signup"
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors bg-[#C06B45] hover:bg-[#A8572F]">
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
