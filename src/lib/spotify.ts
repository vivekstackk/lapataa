/*************** Spotify Provider — Client Credentials flow *****************
 * https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 * Server-only. Never called from browser. Secrets stay in process.env.
 ****************************************************************************/
import { enrichWithItunesPreviews } from './itunesPreview'

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
  previewSource?: 'spotify' | 'itunes'
  itunesUrl?: string
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

export async function searchTracks(q: string, limit = 10): Promise<NormalizedTrack[]> {
  const query = q.trim()
  if (!query) return []
  // Spotify /search limit max is 50 but our app's token currently 400s at 12+, clamp to 10.
  const safe = Math.min(10, Math.max(1, limit))
  const data = await spotifyFetch<{
    tracks: { items: Parameters<typeof normalizeTrack>[0][] }
  }>(`/v1/search?${new URLSearchParams({ q: query, type: 'track', limit: String(safe) })}`)
  return data.tracks.items.map(normalizeTrack)
}

export async function getTrack(id: string): Promise<NormalizedTrack> {
  const raw = await spotifyFetch<Parameters<typeof normalizeTrack>[0]>(`/v1/tracks/${encodeURIComponent(id)}`)
  return normalizeTrack(raw)
}

// ChartProvider abstraction — replaceable without UI changes

export type ChartResult =
  | { ok: true; source: string; tracks: NormalizedTrack[]; fetchedAt: string }
  | { ok: false; source: string; error: string; status?: number; fetchedAt?: string }

let chartCache: { at: number; result: ChartResult } | null = null
let chartVersion = 2 // bump to invalidate server cache from bad BAD TIMES dup build

function chartTtlMs() {
  // Default 24h for production refresh, overridable.
  const v = Number(process.env.CHART_CACHE_TTL ?? process.env.CHART_REFRESH_MS ?? '86400000')
  // Allow seconds or ms: if value < 10000 treat as seconds (back-compat with 600)
  const ms = v < 10000 ? v * 1000 : v
  return Number.isFinite(ms) ? ms : 86400000
}

/**
 * Real chart attempt (Global Top 50 first):
 * 1. Try official Spotify Global Top 50 playlist (37i9dQZEVXbMDoHDwVN2tF).
 *    Development Mode apps often 403 here.
 * 2. Search-based real tracks — /search IS allowed on Client Credentials.
 *    Uses GLOBAL-focused queries to honor Global Top 50 default.
 */
export async function getChartTracks(): Promise<ChartResult> {
  const now = Date.now()
  if (chartCache && chartVersion === 2 && now - chartCache.at < chartTtlMs()) return chartCache.result
  if (chartVersion !== 2) { chartCache = null; chartVersion = 2 }

  const fetchedAt = new Date().toISOString()

  // Attempt 1: Spotify Global Top 50 playlist — try to fetch 50 tracks.
  const chartPlaylistIds = [
    '37i9dQZEVXbMDoHDwVN2tF', // Top Songs – Global (Spotify Charts) — canonical Global Top 50
    '37i9dQZEVXbNG2KDcFcKOF9', // Top Songs – Global alternate
  ]

  for (const pid of chartPlaylistIds) {
    try {
      // Fetch without fields limit so we can paginate up to 50
      const all: Parameters<typeof normalizeTrack>[0][] = []
      let offset = 0
      const limit = 50
      while (all.length < 50) {
        const chunk = Math.min(50, 50 - all.length)
        const data = await spotifyFetch<{
          name: string
          tracks: { items: { track: Parameters<typeof normalizeTrack>[0] | null }[]; next: string | null }
        }>(`/v1/playlists/${pid}?market=US&fields=name,tracks.items(track(id,name,artists,album(name,images),external_urls,preview_url,duration_ms)),tracks.next&limit=${chunk}&offset=${offset}`)
        const tracks = data.tracks.items.map((i) => i.track).filter(Boolean) as Parameters<typeof normalizeTrack>[0][]
        all.push(...tracks)
        if (!data.tracks.next || tracks.length < chunk) break
        offset += chunk
        // For playlists endpoint with fields+limit/offset we actually use /playlists/{id}/tracks
        // Break after one fetch if pagination via this endpoint not available; try tracks sub-route
        break
      }
      // If we only got one page but playlist has more, try tracks sub-route pagination
      if (all.length < 50) {
        try {
          let off = all.length
          while (all.length < 50) {
            const data = await spotifyFetch<{ items: { track: Parameters<typeof normalizeTrack>[0] | null }[]; next: string | null }>(
              `/v1/playlists/${pid}/tracks?market=US&limit=${Math.min(50, 50 - all.length)}&offset=${off}&fields=items(track(id,name,artists,album(name,images),external_urls,preview_url,duration_ms)),next`,
            )
            const chunk = data.items.map((i) => i.track).filter(Boolean) as Parameters<typeof normalizeTrack>[0][]
            if (!chunk.length) break
            all.push(...chunk)
            if (!data.next) break
            off += chunk.length
          }
        } catch {}
      }
      if (all.length) {
        const sliced = all.slice(0, 50).map(normalizeTrack)
        const enriched = await enrichWithItunesPreviews(sliced.map((t: NormalizedTrack) => ({ ...t, previewSource: (t.previewUrl ? 'spotify' : undefined) as NormalizedTrack['previewSource'] })))
        const withSource = enriched.map((t: NormalizedTrack) => ({ ...t, previewSource: (t.previewUrl ? (t.previewSource ?? 'itunes') : undefined) as NormalizedTrack['previewSource'] }))
        const result: ChartResult = {
          ok: true,
          source: `spotify:playlist:${pid} (Global Top 50)`,
          tracks: withSource,
          fetchedAt,
        }
        chartCache = { at: now, result }
        return result
      }
    } catch (e) {
      const status = (e as SpotifyApiError).status
      if (status && status !== 403 && status !== 404) {
        // keep trying
      }
    }
  }

  // Attempt 2: Deezer Chart — public, no auth. Try first as requested.
  // Deezer tracks are often empty for this server region (India, open=false), so detect empty and fall through.
  try {
    const { fetchDeezerChart } = await import('./deezerChart')
    const deezer = await fetchDeezerChart(50)
    if (deezer.tracks.length >= 16) {
      const mapped: NormalizedTrack[] = deezer.tracks.slice(0, 50).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        artworkUrl: t.artworkUrl,
        spotifyUrl: t.link,
        previewUrl: t.preview,
        durationMs: t.duration,
        source: 'spotify' as const,
        previewSource: (t.preview ? 'deezer' as unknown as NormalizedTrack['previewSource'] : undefined),
        itunesUrl: t.link,
      }))
      const previewCount = mapped.filter((m) => m.previewUrl).length
      const result: ChartResult = {
        ok: true,
        source: `${deezer.source} — Deezer editorial chart (ranking ${deezer.rawTotal} tracks; may be regional per Deezer terms; preview ${previewCount}/50)`,
        tracks: mapped,
        fetchedAt,
      }
      chartCache = { at: now, result }
      return result
    }
    // If Deezer returned empty, record so diagnostics can report it (but fall through to iTunes)
  } catch {}

  // Attempt 3: iTunes mixed aesthetic — US+IN shuffled daily, variants deduped, no duplicate song twice.
  try {
    const { fetchMixedAesthetic50 } = await import('./itunesMix')
    const mixed = await fetchMixedAesthetic50()
    if (mixed.tracks.length >= 16) {
      const mapped: NormalizedTrack[] = mixed.tracks.slice(0, 50).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        artworkUrl: t.artworkUrl,
        spotifyUrl: t.itunesUrl,
        previewUrl: t.previewUrl,
        durationMs: null,
        source: 'spotify' as const,
        previewSource: (t.previewUrl ? 'itunes' : undefined) as NormalizedTrack['previewSource'],
        itunesUrl: t.itunesUrl,
      }))
      // Backfill Spotify URL for dock window only (less spam)
      try {
        for (let i = 0; i < Math.min(16, mapped.length); i++) {
          const t = mapped[i]!
          try {
            const found = await searchTracks(`${t.title} ${t.artist.split(',')[0]!.trim()}`, 2)
            if (found[0]?.spotifyUrl) {
              t.spotifyUrl = found[0].spotifyUrl
              if (!t.previewUrl && found[0].previewUrl) {
                t.previewUrl = found[0].previewUrl
                t.previewSource = 'spotify'
              }
            }
          } catch {}
        }
      } catch {}
      const result: ChartResult = {
        ok: true,
        source: mixed.source,
        tracks: mapped,
        fetchedAt,
      }
      chartCache = { at: now, result }
      return result
    }
  } catch {}

  // Attempt 3: fallback search (only if iTunes unavailable) — still not labelled as chart
  try {
    const queries = [
      'top hits global',
      'global top 50',
      'most played global',
      'viral global',
      'chart hits 2024',
      'pop hits global',
    ]
    const seen = new Set<string>()
    const tracks: NormalizedTrack[] = []
    for (const q of queries) {
      if (tracks.length >= 50) break
      try {
        const found = await searchTracks(q, 10)
        for (const t of found) {
          if (seen.has(t.id)) continue
          seen.add(t.id)
          tracks.push(t)
          if (tracks.length >= 50) break
        }
      } catch {
        // skip query
      }
    }
    if (tracks.length) {
      const limited = tracks.slice(0, 50)
      // Enrich with iTunes previews where Spotify preview_url is null — keep chart independent from audio
      const enriched = await enrichWithItunesPreviews(
        limited.map((t: NormalizedTrack) => ({ ...t, previewSource: (t.previewUrl ? 'spotify' : undefined) as NormalizedTrack['previewSource'] })),
      )
      // Mark source for enriched
      const withSource = enriched.map((t: NormalizedTrack) => ({
        ...t,
        previewSource: (t.previewUrl ? (t.previewSource ?? 'itunes') : undefined) as NormalizedTrack['previewSource'],
      }))
      const result: ChartResult = {
        ok: true,
        source: 'spotify:search (real Spotify tracks — NOT an official Global Top 50 chart; use only when Apple RSS unavailable)',
        tracks: withSource,
        fetchedAt,
      }
      chartCache = { at: now, result }
      return result
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const status = (e as SpotifyApiError).status
    const result: ChartResult = { ok: false, source: 'spotify:search', error: msg, status, fetchedAt }
    chartCache = { at: now - chartTtlMs() + 30_000, result }
    return result
  }

  const result: ChartResult = { ok: false, source: 'spotify', error: 'No chart data available with current permissions', status: 503, fetchedAt }
  chartCache = { at: now - chartTtlMs() + 30_000, result }
  return result
}

export function clearChartCache() {
  chartCache = null
}
