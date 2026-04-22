import { getUserFromRequest } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const auth = await getUserFromRequest(request)
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await auth.client
    .from('saved_patterns')
    .select('id, pattern_id, pattern_name, designer_name, permalink, photo_url, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/patterns/saved]', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
