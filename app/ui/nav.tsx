'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { CrownLogo } from '@/app/ui/icons/CrownLogo'
import { ExploreIcon } from '@/app/ui/icons/ExploreIcon'
import { CommunityIcon } from '@/app/ui/icons/CommunityIcon'
import { LibraryIcon } from '@/app/ui/icons/LibraryIcon'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

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
    setMenuOpen(false)
  }

  const publicLinks = [
    { href: '/search',    label: 'Explore',    Icon: ExploreIcon    },
    { href: '/community', label: 'Community',  Icon: CommunityIcon  },
  ]
  const authLinks = [
    { href: '/library', label: 'My Library', Icon: LibraryIcon },
    { href: '/profile', label: 'Profile',    Icon: null         },
  ]
  const navLinks = [...publicLinks, ...(user ? authLinks : [])]

  return (
    <>
      <nav style={{ backgroundColor: '#1e1c1a', borderBottom: '1px solid #3a3530' }}
           className="sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

          {/* Logo */}
          <Link href="/"
            className="flex items-center gap-2"
            style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#f5f0eb' }}>
            <CrownLogo size={24} />
            <span className="text-2xl tracking-tight">
              Knit<em style={{ color: '#D4A5A0', fontStyle: 'italic' }}>wise</em>
            </span>
          </Link>

          {/* Desktop centre links */}
          <div className="hidden items-center gap-6 text-sm sm:flex" style={{ color: '#c4b8ae' }}>
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
                style={{ color: pathname === l.href ? '#f5f0eb' : '#c4b8ae' }}>
                {l.Icon && <l.Icon size={20} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <span className="max-w-[160px] truncate text-sm" style={{ color: '#c4b8ae' }}>
                  {user.email}
                </span>
                <button onClick={handleLogOut}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#D4A5A0] hover:bg-[#A8572F] transition-colors">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: '#c4b8ae' }}>
                  Log in
                </Link>
                <Link href="/signup"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#D4A5A0] hover:bg-[#A8572F] transition-colors">
                  Sign up free
                </Link>
              </>
            )}
          </div>

          {/* Mobile right: hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg sm:hidden"
            style={{ backgroundColor: menuOpen ? '#3a3530' : 'transparent' }}
          >
            {menuOpen ? (
              /* X icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#f5f0eb" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#c4b8ae" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col sm:hidden"
          style={{ backgroundColor: '#1a1917', top: '65px' }}
        >
          <div className="flex flex-col px-6 py-6 gap-1">
            {/* Nav links */}
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors"
                style={{
                  color: pathname === l.href ? '#f5f0eb' : '#c4b8ae',
                  backgroundColor: pathname === l.href ? '#2e2b28' : 'transparent',
                }}>
                {l.Icon && <l.Icon size={28} />}
                {l.label}
              </Link>
            ))}
            {/* Divider */}
            <div className="my-3" style={{ borderTop: '1px solid #3a3530' }} />

            {/* Auth */}
            {user ? (
              <>
                <p className="px-4 pb-2 text-sm truncate" style={{ color: '#7a6e67' }}>{user.email}</p>
                <button onClick={handleLogOut}
                  className="rounded-xl px-4 py-3.5 text-left text-base font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#D4A5A0' }}>
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login"
                  className="rounded-xl px-4 py-3.5 text-center text-base font-medium transition-colors"
                  style={{ backgroundColor: '#2e2b28', border: '1px solid #3a3530', color: '#f5f0eb' }}>
                  Log in
                </Link>
                <Link href="/signup"
                  className="rounded-xl px-4 py-3.5 text-center text-base font-semibold text-white"
                  style={{ backgroundColor: '#D4A5A0' }}>
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
