import { NextResponse } from 'next/server'
import { getTrack, SpotifyConfigError, SpotifyAuthError, SpotifyApiError } from '@/lib/spotify'


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
  try {
    const track = await getTrack(id)
    return NextResponse.json({ ok: true, track })
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
