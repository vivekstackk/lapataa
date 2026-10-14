/*************** Spotify Provider — Client Credentials flow *****************
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 * Server-only. Never called from browser. Secrets stay in process.env.
 ****************************************************************************/

type TokenCache = {
  token: string
  expiresAt: number // epoch ms
}

let tokenCache: TokenCache | null = null
let inflight: Promise<string> | null = null

function credentials() {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || id === 'replace_with_my_client_id' || !secret || secret === 'replace_with_my_client_secret') {
    throw new SpotifyConfigError('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET — set them in .env.local')
  }
  return { id, secret }
}

export class SpotifyConfigError extends Error {}
export class SpotifyAuthError extends Error {
  status: number
  constructor(msg: string, status: number) {
    super(msg)
    this.status = status
  }
}
export class SpotifyApiError extends Error {
  status: number
  body?: unknown
  constructor(msg: string, status: number, body?: unknown) {
    super(msg)
    this.status = status
    this.body = body
  }
}

async function fetchAccessToken(): Promise<string> {
  // Deduplicate concurrent callers
  if (inflight) return inflight
  inflight = (async () => {
    const { id, secret } = credentials()
    const basic = Buffer.from(`${id}:${secret}`).toString('base64')
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        signal: controller.signal,
        // Next.js fetch cache: never cache token endpoint
        cache: 'no-store',
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new SpotifyAuthError(`Spotify auth failed: ${res.status} ${text.slice(0, 400)}`, res.status)
      }
      const data = (await res.json()) as { access_token: string; expires_in: number }
      if (!data.access_token) throw new SpotifyAuthError('Spotify auth: no access_token', 500)
      const skewMs = 60_000 // renew 60s early
      tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000 - skewMs),
      }
      return data.access_token
    } finally {
      clearTimeout(t)
      inflight = null
    }
  })()
  return inflight
}

export async function getSpotifyToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token
  return fetchAccessToken()
}

export type NormalizedTrack = {
  id: string
  title: string
  artist: string
  album: string
  artworkUrl: string | null
  spotifyUrl: string
  previewUrl: string | null
  durationMs: number | null
  source: 'spotify'
}

function pickArtwork(images: { url: string; width?: number }[] | undefined): string | null {
  if (!images?.length) return null
  // Prefer 300-640, fallback largest
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  const mid = sorted.find((i) => (i.width ?? 0) >= 300) ?? sorted[sorted.length - 1]
  return mid?.url ?? null
}

function normalizeTrack(raw: {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string; width?: number }[] }
  external_urls: { spotify: string }
  preview_url: string | null
  duration_ms: number
}): NormalizedTrack {
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists.map((a) => a.name).join(', ') || 'Unknown',
    album: raw.album.name,
    artworkUrl: pickArtwork(raw.album.images),
    spotifyUrl: raw.external_urls.spotify,
    previewUrl: raw.preview_url ?? null,
    durationMs: raw.duration_ms ?? null,
    source: 'spotify',
  }
}

async function spotifyFetch<T>(path: string, init?: RequestInit, retry = 1): Promise<T> {
  const base = (process.env.SPOTIFY_API_BASE ?? 'https://api.spotify.com').replace(/\/$/, '')
  const token = await getSpotifyToken()
  const url = `${base}${path}`
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    if (res.status === 401 && retry > 0) {
      // Token expired race — clear and retry once
      tokenCache = null
      return spotifyFetch<T>(path, init, retry - 1)
    }
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? '2')
      throw new SpotifyApiError(`Spotify rate limited, retry after ${retryAfter}s`, 429)
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      let parsed: unknown = body
      try { parsed = JSON.parse(body) } catch {}
      throw new SpotifyApiError(`Spotify API ${res.status} ${String(body).slice(0, 600)}`, res.status, parsed)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(to)
  }
}

// Public helpers

export async function searchTracks(q: string, limit = 20): Promise<NormalizedTrack[]> {
  const query = q.trim()
  if (!query) return []
  const data = await spotifyFetch<{
    tracks: { items: Parameters<typeof normalizeTrack>[0][] }
  }>(`/v1/search?${new URLSearchParams({ q: query, type: 'track', limit: String(Math.min(50, limit)) })}`)
  return data.tracks.items.map(normalizeTrack)
}

export async function getTrack(id: string): Promise<NormalizedTrack> {
  const raw = await spotifyFetch<Parameters<typeof normalizeTrack>[0]>(`/v1/tracks/${encodeURIComponent(id)}`)
  return normalizeTrack(raw)
}

// ChartProvider abstraction — replaceable without UI changes

export type ChartResult =
  | { ok: true; source: string; tracks: NormalizedTrack[] }
  | { ok: false; source: string; error: string; status?: number }

let chartCache: { at: number; result: ChartResult } | null = null

function chartTtlMs() {
  const v = Number(process.env.CHART_CACHE_TTL ?? '600')
  return (Number.isFinite(v) ? v : 600) * 1000
}

/**
 * Real chart attempt:
 * 1. Try official Spotify chart playlist (e.g. Top 50 Global) if app permissions allow.
 *    Many Workspaces in Development Mode cannot access arbitrary public playlists via /playlists.
 * 2. If that fails, fall back to Spotify's browse/new-releases which IS available via Client Credentials.
 *    We do NOT label that as an official chart — source field reflects reality.
 */
export async function getChartTracks(): Promise<ChartResult> {
  const now = Date.now()
  if (chartCache && now - chartCache.at < chartTtlMs()) return chartCache.result

  // Attempt 1: try a real chart playlist — verify with actual permissions.
  // Using Spotify's curated Top 50 Global (37i9dQZEVXbMDoHDwVN2tF) is the canonical chart playlist.
  // If your app is in Development Mode and not allowlisted, this will 403/404 and we fall back.
  const chartPlaylistIds = [
    '37i9dQZEVXbMDoHDwVN2tF', // Top 50 Global
    '37i9dQZEVXbLZ52Xmny55g', // Top 50 India (if available)
  ]

  for (const pid of chartPlaylistIds) {
    try {
      const data = await spotifyFetch<{
        name: string
        tracks: { items: { track: Parameters<typeof normalizeTrack>[0] | null }[] }
      }>(`/v1/playlists/${pid}?market=IN&fields=name,tracks.items(track(id,name,artists,album(name,images),external_urls,preview_url,duration_ms))&limit=20`)
      const tracks = data.tracks.items.map((i) => i.track).filter(Boolean) as Parameters<typeof normalizeTrack>[0][]
      if (tracks.length) {
        const result: ChartResult = {
          ok: true,
          source: `spotify:playlist:${pid} (${data.name})`,
          tracks: tracks.slice(0, 20).map(normalizeTrack),
        }
        chartCache = { at: now, result }
        return result
      }
    } catch (e) {
      // 403/404 expected in Dev Mode — try next, then fall back
      const status = (e as SpotifyApiError).status
      if (status && status !== 403 && status !== 404) {
        // Unexpected — surface it after fallback attempt
        // but continue to new-releases fallback first
      }
    }
  }

  // Attempt 2: search-based real tracks — browse/new-releases and featured-playlists
  // are currently 403 for this app, but /search IS allowed on Client Credentials.
  // Use a curated search to get real Spotify tracks honestly labelled as search fallback.
  try {
    const queries = [
      'top hits india',
      'arijit singh',
      'bollywood hits',
      'punjabi hits',
    ]
    const seen = new Set<string>()
    const tracks: NormalizedTrack[] = []
    for (const q of queries) {
      if (tracks.length >= 16) break
      try {
        const found = await searchTracks(q, 8)
        for (const t of found) {
          if (seen.has(t.id)) continue
          seen.add(t.id)
          tracks.push(t)
          if (tracks.length >= 16) break
        }
      } catch {
        // skip query
      }
    }
    if (tracks.length) {
      const result: ChartResult = {
        ok: true,
        source: 'spotify:search (real Spotify tracks — curated queries; not an official chart)',
        tracks,
      }
      chartCache = { at: now, result }
      return result
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const status = (e as SpotifyApiError).status
    const result: ChartResult = { ok: false, source: 'spotify:search', error: msg, status }
    chartCache = { at: now - chartTtlMs() + 30_000, result }
    return result
  }

  const result: ChartResult = { ok: false, source: 'spotify', error: 'No chart data available with current permissions', status: 503 }
  chartCache = { at: now - chartTtlMs() + 30_000, result }
  return result
}

export function clearChartCache() {
  chartCache = null
}
