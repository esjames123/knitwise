export function ravelryAuthHeader(): string {
  const key    = process.env.RAVELRY_ACCESS_KEY!
  const secret = process.env.RAVELRY_ACCESS_SECRET!
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
}

export async function ravelryFetch(path: string): Promise<Response> {
  return fetch(`https://api.ravelry.com${path}`, {
    headers: { Authorization: ravelryAuthHeader(), Accept: 'application/json' },
    cache: 'no-store',
  })
}
