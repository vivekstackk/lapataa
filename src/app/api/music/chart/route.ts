import { NextResponse } from 'next/server'
import { getChartTracks, SpotifyConfigError, SpotifyAuthError, SpotifyApiError } from '@/lib/spotify'


export async function GET() {
  try {
    const result = await getChartTracks()
    if (result.ok) {
      return NextResponse.json({ ok: true, source: result.source, tracks: result.tracks, fetchedAt: result.fetchedAt })
    }
    const status = result.status ?? 503
    return NextResponse.json({ ok: false, source: result.source, error: result.error, tracks: [], fetchedAt: result.fetchedAt }, { status })
  } catch (e) {
    if (e instanceof SpotifyConfigError) {
      return NextResponse.json({ ok: false, error: e.message, hint: 'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local' }, { status: 503 })
    }
    if (e instanceof SpotifyAuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status === 401 ? 503 : e.status })
    }
    if (e instanceof SpotifyApiError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

