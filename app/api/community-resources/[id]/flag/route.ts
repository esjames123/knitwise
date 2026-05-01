import type { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let reason = ''
  try {
    const body = await request.json()
    reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  } catch { /* reason stays empty */ }

  const { data: existing } = await auth.client
    .from('community_resource_flags')
    .select('id')
    .eq('resource_id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'You have already flagged this resource.' }, { status: 409 })
  }

  const { error: flagError } = await auth.client
    .from('community_resource_flags')
    .insert({ resource_id: id, user_id: auth.user.id, reason: reason || null })

  if (flagError) {
    console.error('[POST /api/community-resources/id/flag]', flagError.message)
    return Response.json({ error: flagError.message }, { status: 500 })
  }

  const { data: resource } = await auth.client
    .from('community_resources')
    .select('flag_count, is_flagged')
    .eq('id', id)
    .maybeSingle()

  return Response.json({ success: true, flag_count: resource?.flag_count ?? 1, is_flagged: resource?.is_flagged ?? false })
}
