import type { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase-server'

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
