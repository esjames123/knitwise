import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client scoped to the requesting user's JWT.
 * Pass the raw value from the Authorization header (everything after "Bearer ").
 * The JWT is forwarded as the auth header so RLS policies fire as that user.
 */
export function createUserClient(jwt: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  )
}

/**
 * Extracts the Bearer token from a Request and returns both the authenticated
 * Supabase client and the verified user. Returns null if the token is missing
 * or invalid.
 */
export async function getUserFromRequest(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null

  const client = createUserClient(token)
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) return null

  return { user, client }
}
