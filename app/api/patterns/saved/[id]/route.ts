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

// Update a saved pattern's collection assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { collection_id } = body as Record<string, unknown>
  if (collection_id !== null && typeof collection_id !== 'string') {
    return Response.json({ error: 'collection_id must be a string or null' }, { status: 400 })
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .update({ collection_id: collection_id ?? null })
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()

  if (error) {
    console.error('[PATCH patterns/saved/id] code:', error.code, 'msg:', error.message)
    return Response.json({ error: error.message, code: error.code }, { status: 500 })
  }
  if (!data || data.length === 0) {
    console.error('[PATCH patterns/saved/id] 0 rows — id not found or collection_id column missing')
    return Response.json({ error: 'Pattern not found or collection_id column missing — run DB migration' }, { status: 404 })
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
