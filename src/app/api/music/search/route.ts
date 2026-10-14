import { NextResponse } from 'next/server'
import { searchTracks, SpotifyConfigError, SpotifyAuthError, SpotifyApiError } from '@/lib/spotify'


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ ok: false, error: 'Missing q' }, { status: 400 })
  try {
    const tracks = await searchTracks(q, 20)
    return NextResponse.json({ ok: true, source: 'spotify:search', tracks })
  } catch (e) {
    if (e instanceof SpotifyConfigError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 503 })
    }
    if (e instanceof SpotifyAuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    if (e instanceof SpotifyApiError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

