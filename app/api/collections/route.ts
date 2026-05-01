import { getUserFromRequest } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.client
    .from('collections')
    .select('id, name, description, color, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, description, color } = body as Record<string, unknown>
  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await auth.client
    .from('collections')
    .insert({
      user_id:     auth.user.id,
      name:        name.trim(),
      description: typeof description === 'string' ? description.trim() || null : null,
      color:       typeof color === 'string' && color ? color : '#D4A5A0',
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
