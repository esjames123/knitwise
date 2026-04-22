'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <p>Email: {user.email}</p>
      </div>
    </div>
  )
}
