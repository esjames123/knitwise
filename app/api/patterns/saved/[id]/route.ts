import type { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase-server'

// Save freeform notes for a pattern
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { notes } = body as Record<string, unknown>

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update({
      notes:      typeof notes === 'string' ? notes.trim() || null : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PUT patterns/saved/id]', error.code, error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json(data[0])
}

const VALID_STATUSES = ['not_started', 'in_progress', 'completed', 'on_hold'] as const

// Update collection assignment and/or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = { updated_at: now }

  if ('collection_id' in body) {
    const { collection_id } = body
    if (collection_id !== null && typeof collection_id !== 'string') {
      return Response.json({ error: 'collection_id must be a string or null' }, { status: 400 })
    }
    updates.collection_id = collection_id ?? null
  }

  if ('status' in body) {
    const { status } = body
    if (typeof status !== 'string' || !(VALID_STATUSES as readonly string[]).includes(status)) {
      return Response.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }
    updates.status = status

    if (status === 'in_progress') {
      // Only set started_at the first time
      const { data: current } = await auth.client
        .from('saved_patterns')
        .select('started_at')
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .maybeSingle()
      if (!current?.started_at) updates.started_at = now
    }

    if (status === 'completed') {
      updates.completed_at = now
    }
  }

  if (Object.keys(updates).length === 1) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PATCH patterns/saved/id] code:', error.code, 'msg:', error.message)
    return Response.json({ error: error.message, code: error.code }, { status: 500 })
  }
  if (!data || data.length === 0) {
    console.error('[PATCH patterns/saved/id] 0 rows')
    return Response.json({ error: 'Pattern not found' }, { status: 404 })
  }
  return Response.json(data[0])
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error, count } = await auth.client
    .from('saved_patterns')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (error) {
    console.error('[DELETE /api/patterns/saved/[id]]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (count === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({ success: true })
}
