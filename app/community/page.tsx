'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/ui/nav'
import { supabase } from '@/lib/supabase'
import { GroupCard } from '@/app/ui/group-card'
import type { Group } from '@/app/ui/group-card'
import { CreateGroupModal } from '@/app/ui/create-group-modal'
import type { GroupPayload } from '@/app/ui/create-group-modal'
import { GroupDetailModal } from '@/app/ui/group-detail-modal'
import { FlagGroupModal } from '@/app/ui/flag-group-modal'
import { FiberBusinessCard } from '@/app/ui/fiber-business-card'
import type { FiberBusiness } from '@/app/ui/fiber-business-card'
import { CreateFiberBusinessModal } from '@/app/ui/create-fiber-business-modal'
import type { FiberBusinessPayload } from '@/app/ui/create-fiber-business-modal'
import { FiberBusinessDetailModal } from '@/app/ui/fiber-business-detail-modal'
import { FlagFiberBusinessModal } from '@/app/ui/flag-fiber-business-modal'
import { CommunityResourceCard } from '@/app/ui/community-resource-card'
import type { CommunityResource } from '@/app/ui/community-resource-card'
import { CreateCommunityResourceModal } from '@/app/ui/create-community-resource-modal'
import type { CommunityResourcePayload } from '@/app/ui/create-community-resource-modal'
import { CommunityResourceDetailModal } from '@/app/ui/community-resource-detail-modal'
import { FlagCommunityResourceModal } from '@/app/ui/flag-community-resource-modal'

export default function CommunityPage() {
  const router = useRouter()
  const [userId, setUserId]   = useState<string | null>(null)
  const tokenRef              = useRef<string | null>(null)

  // Groups state
  const [groups, setGroups]     = useState<Group[]>([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [groupCity, setGroupCity]   = useState('')
  const [groupState, setGroupState] = useState('')
  const [groupZip, setGroupZip]     = useState('')

  // Businesses state
  const [businesses, setBusinesses]     = useState<FiberBusiness[]>([])
  const [bizLoading, setBizLoading]     = useState(true)
  const [bizCity, setBizCity]           = useState('')
  const [bizState, setBizState]         = useState('')
  const [bizZip, setBizZip]             = useState('')

  // Group modals
  const [showCreateGroup, setShowCreateGroup]   = useState(false)
  const [detailGroup, setDetailGroup]           = useState<Group | null>(null)
  const [flagGroup, setFlagGroup]               = useState<Group | null>(null)

  // Business modals
  const [showCreateBiz, setShowCreateBiz]       = useState(false)
  const [detailBiz, setDetailBiz]               = useState<FiberBusiness | null>(null)
  const [flagBiz, setFlagBiz]                   = useState<FiberBusiness | null>(null)

  // Resources state
  const [resources, setResources]               = useState<CommunityResource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [resourcesError, setResourcesError]     = useState<string | null>(null)
  const [resourceCategory, setResourceCategory] = useState('')

  // Resource modals
  const [showCreateResource, setShowCreateResource] = useState(false)
  const [detailResource, setDetailResource]         = useState<CommunityResource | null>(null)
  const [flagResource, setFlagResource]             = useState<CommunityResource | null>(null)

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(msg: string, ok: boolean) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, ok })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null)
      tokenRef.current = session?.access_token ?? null
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null)
      tokenRef.current = session?.access_token ?? null
    })
    fetchGroups()
    fetchBusinesses()
    fetchResources()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchGroups(params?: { city?: string; state?: string; zip?: string }) {
    setGroupsLoading(true)
    const qs = new URLSearchParams()
    if (params?.zip)   qs.set('zip',   params.zip)
    if (params?.city)  qs.set('city',  params.city)
    if (params?.state) qs.set('state', params.state)
    const res = await fetch(`/api/groups?${qs.toString()}`)
    if (res.ok) setGroups(await res.json())
    setGroupsLoading(false)
  }

  async function fetchBusinesses(params?: { city?: string; state?: string; zip?: string }) {
    setBizLoading(true)
    const qs = new URLSearchParams()
    if (params?.zip)   qs.set('zip',   params.zip)
    if (params?.city)  qs.set('city',  params.city)
    if (params?.state) qs.set('state', params.state)
    const res = await fetch(`/api/fiber-businesses?${qs.toString()}`)
    if (res.ok) setBusinesses(await res.json())
    setBizLoading(false)
  }

  function handleGroupSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchGroups({ city: groupCity.trim(), state: groupState.trim(), zip: groupZip.trim() })
  }

  function handleGroupClear() {
    setGroupCity(''); setGroupState(''); setGroupZip('')
    fetchGroups()
  }

  function handleBizSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchBusinesses({ city: bizCity.trim(), state: bizState.trim(), zip: bizZip.trim() })
  }

  function handleBizClear() {
    setBizCity(''); setBizState(''); setBizZip('')
    fetchBusinesses()
  }

  async function handleCreateGroup(payload: GroupPayload) {
    if (!tokenRef.current) { router.push('/login'); return }
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRef.current}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Could not post group')
    setGroups(prev => [json as Group, ...prev])
    showToast('Group posted!', true)
  }

  async function handleDeleteGroup(group: Group) {
    if (!tokenRef.current) return
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/groups/${group.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    })
    if (res.ok) {
      setGroups(prev => prev.filter(g => g.id !== group.id))
      setDetailGroup(null)
      showToast('Group deleted.', true)
    } else {
      showToast('Could not delete group.', false)
    }
  }

  async function fetchResources(category?: string) {
    setResourcesLoading(true); setResourcesError(null)
    const qs = new URLSearchParams()
    if (category) qs.set('category', category)
    const res = await fetch(`/api/community-resources?${qs.toString()}`)
    if (res.ok) setResources(await res.json())
    else setResourcesError('Could not load resources.')
    setResourcesLoading(false)
  }

  async function handleCreateResource(payload: CommunityResourcePayload) {
    if (!tokenRef.current) { router.push('/login'); return }
    const res = await fetch('/api/community-resources', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRef.current}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Could not post resource')
    setResources(prev => [json as CommunityResource, ...prev])
    showToast('Resource shared!', true)
  }

  async function handleDeleteResource(resource: CommunityResource) {
    if (!tokenRef.current) return
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/community-resources/${resource.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    })
    if (res.ok) {
      setResources(prev => prev.filter(r => r.id !== resource.id))
      setDetailResource(null)
      showToast('Resource deleted.', true)
    } else {
      showToast('Could not delete resource.', false)
    }
  }

  async function handleCreateBiz(payload: FiberBusinessPayload) {
    if (!tokenRef.current) { router.push('/login'); return }
    const res = await fetch('/api/fiber-businesses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRef.current}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Could not post listing')
    setBusinesses(prev => [json as FiberBusiness, ...prev])
    showToast('Listing posted!', true)
  }

  async function handleDeleteBiz(biz: FiberBusiness) {
    if (!tokenRef.current) return
    if (!confirm(`Delete "${biz.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/fiber-businesses/${biz.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    })
    if (res.ok) {
      setBusinesses(prev => prev.filter(b => b.id !== biz.id))
      setDetailBiz(null)
      showToast('Listing deleted.', true)
    } else {
      showToast('Could not delete listing.', false)
    }
  }

  const INPUT = { backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#f5f0eb' }

  const hasGroupSearch = groupCity.trim() || groupState.trim() || groupZip.trim()
  const hasBizSearch   = bizCity.trim()   || bizState.trim()   || bizZip.trim()

  return (
    <div style={{ backgroundColor: '#242220', color: '#f5f0eb', minHeight: '100vh' }}>
      <Nav />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-16">

        {/* ── Groups section ── */}
        <section>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#f5f0eb' }}>Community</h1>
              <p className="mt-1 text-sm" style={{ color: '#9a8e87' }}>
                Find local fiber arts groups — knitting circles, spinning guilds, weaving collectives, and more.
              </p>
            </div>
            <button
              onClick={() => userId ? setShowCreateGroup(true) : router.push('/login')}
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#C06B45' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
            >
              + Post Your Group
            </button>
          </div>

          <form onSubmit={handleGroupSearch} className="mb-8 flex flex-wrap gap-3">
            {[
              { placeholder: 'City',  value: groupCity,  set: setGroupCity,  flex: 'flex-1 min-w-[120px]' },
              { placeholder: 'State', value: groupState, set: setGroupState, flex: 'w-20' },
              { placeholder: 'ZIP',   value: groupZip,   set: setGroupZip,   flex: 'w-28' },
            ].map(({ placeholder, value, set, flex }) => (
              <input
                key={placeholder}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                className={`${flex} rounded-xl px-4 py-2.5 text-sm outline-none`}
                style={INPUT}
                onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
              />
            ))}
            <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#C06B45' }}>Search</button>
            {hasGroupSearch && (
              <button type="button" onClick={handleGroupClear}
                className="rounded-xl px-4 py-2.5 text-sm font-medium"
                style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                Clear
              </button>
            )}
          </form>

          {groupsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl"
                     style={{ height: 260, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>
                {hasGroupSearch ? 'No groups found in that area.' : 'No groups posted yet.'}
              </p>
              <p className="mt-2 text-sm" style={{ color: '#5a504a' }}>Be the first to post your fiber arts group!</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm" style={{ color: '#7a6e67' }}>
                {groups.length} group{groups.length !== 1 ? 's' : ''}{hasGroupSearch ? ' found' : ''}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map(g => (
                  <GroupCard
                    key={g.id}
                    group={g}
                    userId={userId}
                    onView={() => setDetailGroup(g)}
                    onDelete={() => handleDeleteGroup(g)}
                    onFlag={() => setFlagGroup(g)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Local Fiber Businesses section ── */}
        <section>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#f5f0eb' }}>Local Fiber Businesses</h2>
              <p className="mt-1 text-sm" style={{ color: '#9a8e87' }}>
                Discover farms, mills, yarn shops, dyers, and other fiber arts businesses near you.
              </p>
            </div>
            <button
              onClick={() => userId ? setShowCreateBiz(true) : router.push('/login')}
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#C06B45' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
            >
              + List Your Business
            </button>
          </div>

          <form onSubmit={handleBizSearch} className="mb-8 flex flex-wrap gap-3">
            {[
              { placeholder: 'City',  value: bizCity,  set: setBizCity,  flex: 'flex-1 min-w-[120px]' },
              { placeholder: 'State', value: bizState, set: setBizState, flex: 'w-20' },
              { placeholder: 'ZIP',   value: bizZip,   set: setBizZip,   flex: 'w-28' },
            ].map(({ placeholder, value, set, flex }) => (
              <input
                key={placeholder}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                className={`${flex} rounded-xl px-4 py-2.5 text-sm outline-none`}
                style={INPUT}
                onFocus={e => (e.currentTarget.style.borderColor = '#C06B45')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#4a4440')}
              />
            ))}
            <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#C06B45' }}>Search</button>
            {hasBizSearch && (
              <button type="button" onClick={handleBizClear}
                className="rounded-xl px-4 py-2.5 text-sm font-medium"
                style={{ backgroundColor: '#38342f', border: '1px solid #4a4440', color: '#9a8e87' }}>
                Clear
              </button>
            )}
          </form>

          {bizLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl"
                     style={{ height: 260, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>
                {hasBizSearch ? 'No businesses found in that area.' : 'No businesses listed yet.'}
              </p>
              <p className="mt-2 text-sm" style={{ color: '#5a504a' }}>Be the first to list your fiber arts business!</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm" style={{ color: '#7a6e67' }}>
                {businesses.length} business{businesses.length !== 1 ? 'es' : ''}{hasBizSearch ? ' found' : ''}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map(b => (
                  <FiberBusinessCard
                    key={b.id}
                    business={b}
                    userId={userId}
                    onView={() => setDetailBiz(b)}
                    onDelete={() => handleDeleteBiz(b)}
                    onFlag={() => setFlagBiz(b)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Community Resources section ── */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#f5f0eb' }}>Community Resources</h2>
              <p className="mt-1 text-sm" style={{ color: '#9a8e87' }}>
                Share helpful videos, blogs, and tutorials for fiber arts learning. Please no spam and do not post the same link more than once.
              </p>
            </div>
            <button
              onClick={() => userId ? setShowCreateResource(true) : router.push('/login')}
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#C06B45' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A8572F')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C06B45')}
            >
              + Share a Resource
            </button>
          </div>

          {/* Category filter pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { value: '',                  label: 'All' },
              { value: 'beginner_knitting', label: 'Beginner Knitting' },
              { value: 'crochet',           label: 'Crochet' },
              { value: 'weaving',           label: 'Weaving' },
              { value: 'spinning',          label: 'Spinning' },
              { value: 'felting',           label: 'Felting' },
              { value: 'dyeing',            label: 'Dyeing' },
              { value: 'other',             label: 'Other' },
            ].map(({ value, label }) => {
              const active = resourceCategory === value
              return (
                <button
                  key={value}
                  onClick={() => {
                    setResourceCategory(value)
                    fetchResources(value || undefined)
                  }}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? '#C06B45' : '#38342f',
                    border: `1px solid ${active ? '#C06B45' : '#4a4440'}`,
                    color: active ? '#fff' : '#9a8e87',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {resourcesLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl"
                     style={{ height: 260, backgroundColor: '#2e2b28', border: '1px solid #3a3530' }} />
              ))}
            </div>
          ) : resourcesError ? (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: '#e0a090' }}>{resourcesError}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium" style={{ color: '#9a8e87' }}>
                {resourceCategory ? 'No resources in that category yet.' : 'No resources shared yet.'}
              </p>
              <p className="mt-2 text-sm" style={{ color: '#5a504a' }}>Be the first to share a helpful resource!</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm" style={{ color: '#7a6e67' }}>
                {resources.length} resource{resources.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map(r => (
                  <CommunityResourceCard
                    key={r.id}
                    resource={r}
                    isOwner={userId === r.user_id}
                    onView={() => setDetailResource(r)}
                    onDelete={() => handleDeleteResource(r)}
                    onFlag={() => setFlagResource(r)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

      </div>

      {/* Group modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onSave={handleCreateGroup}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
      {detailGroup && (
        <GroupDetailModal
          group={detailGroup}
          userId={userId}
          onClose={() => setDetailGroup(null)}
          onDelete={() => handleDeleteGroup(detailGroup)}
          onFlag={() => { setDetailGroup(null); setFlagGroup(detailGroup) }}
          onUpdated={updated => {
            setGroups(prev => prev.map(g => g.id === updated.id ? updated : g))
            setDetailGroup(updated)
          }}
        />
      )}
      {flagGroup && (
        <FlagGroupModal
          groupId={flagGroup.id}
          onClose={() => setFlagGroup(null)}
          onFlagged={() => { showToast('Report submitted — thank you.', true); setFlagGroup(null) }}
        />
      )}

      {/* Business modals */}
      {showCreateBiz && (
        <CreateFiberBusinessModal
          onSave={handleCreateBiz}
          onClose={() => setShowCreateBiz(false)}
        />
      )}
      {detailBiz && (
        <FiberBusinessDetailModal
          business={detailBiz}
          userId={userId}
          onClose={() => setDetailBiz(null)}
          onDelete={() => handleDeleteBiz(detailBiz)}
          onFlag={() => { setDetailBiz(null); setFlagBiz(detailBiz) }}
          onUpdated={updated => {
            setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b))
            setDetailBiz(updated)
          }}
        />
      )}
      {flagBiz && (
        <FlagFiberBusinessModal
          businessId={flagBiz.id}
          onClose={() => setFlagBiz(null)}
          onFlagged={() => { showToast('Report submitted — thank you.', true); setFlagBiz(null) }}
        />
      )}

      {/* Resource modals */}
      {showCreateResource && (
        <CreateCommunityResourceModal
          onSave={handleCreateResource}
          onClose={() => setShowCreateResource(false)}
        />
      )}
      {detailResource && (
        <CommunityResourceDetailModal
          resource={detailResource}
          userId={userId}
          onClose={() => setDetailResource(null)}
          onDelete={() => handleDeleteResource(detailResource)}
          onFlag={() => { setDetailResource(null); setFlagResource(detailResource) }}
          onUpdated={updated => {
            setResources(prev => prev.map(r => r.id === updated.id ? updated : r))
            setDetailResource(updated)
          }}
        />
      )}
      {flagResource && (
        <FlagCommunityResourceModal
          resourceId={flagResource.id}
          onClose={() => setFlagResource(null)}
          onFlagged={() => { showToast('Report submitted — thank you.', true); setFlagResource(null) }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] rounded-xl px-5 py-3 text-sm font-medium shadow-xl whitespace-nowrap"
          style={{
            backgroundColor: toast.ok ? '#1a3a2a' : '#3a1a1a',
            border: `1px solid ${toast.ok ? '#2a5a3a' : '#6a2a2a'}`,
            color: toast.ok ? '#6dcfa0' : '#e08080',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
