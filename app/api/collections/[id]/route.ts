import { getUserFromRequest } from '@/lib/supabase-server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, description, color } = body as Record<string, unknown>
  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await auth.client
    .from('collections')
    .update({
      name:        name.trim(),
      description: typeof description === 'string' ? description.trim() || null : null,
      color:       typeof color === 'string' && color ? color : '#D4A5A0',
    })
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { error } = await auth.client
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
