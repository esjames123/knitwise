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

  // Prevent duplicate flags
  const { data: existing } = await auth.client
    .from('group_flags')
    .select('id')
    .eq('group_id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'You have already flagged this group.' }, { status: 409 })
  }

  // Insert flag — DB trigger handles incrementing flag_count and setting is_flagged
  const { error: flagError } = await auth.client
    .from('group_flags')
    .insert({ group_id: id, user_id: auth.user.id, reason: reason || null })

  if (flagError) {
    console.error('[POST /api/groups/id/flag]', flagError.message)
    return Response.json({ error: flagError.message }, { status: 500 })
  }

  // Read back updated flag_count for the response
  const { data: group } = await auth.client
    .from('groups')
    .select('flag_count, is_flagged')
    .eq('id', id)
    .maybeSingle()

  return Response.json({ success: true, flag_count: group?.flag_count ?? 1, is_flagged: group?.is_flagged ?? false })
}
