// iTunes Search API — legitimate 30s preview provider (no auth, public).
// https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
// Used ONLY as audio-source adapter when Spotify preview_url is null. Chart stays Spotify Global Top 50.

export type ItunesPreviewResult = { previewUrl: string | null; itunesUrl?: string }

const ITUNES_TIMEOUT_MS = 6000

function scoreMatch(query: string, title: string, artist: string): number {
  const q = query.toLowerCase()
  const t = title.toLowerCase()
  const a = artist.toLowerCase()
  let s = 0
  if (q.includes(t) || t.includes(q.split(' ').slice(0, 2).join(' '))) s += 2
  if (artist && (q.includes(a) || a.split(',')[0]!.trim().toLowerCase().includes(q.split(' ').slice(0, 2).join(' ').toLowerCase()))) s += 1
  if (s === 0 && (q.includes(t.slice(0, 6)) || t.includes(q.slice(0, 6)))) s += 0.5
  return s
}

export async function resolveItunesPreview(title: string, artist: string): Promise<ItunesPreviewResult> {
  const term = `${title} ${artist}`.trim()
  if (!term) return { previewUrl: null }
  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), ITUNES_TIMEOUT_MS)
  try {
    const url = `https://itunes.apple.com/search?${new URLSearchParams({ term, entity: 'song', limit: '5' })}`
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return { previewUrl: null }
    const data = (await res.json()) as {
      resultCount: number
      results: { trackName: string; artistName: string; previewUrl?: string; trackViewUrl?: string }[]
    }
    if (!data.results?.length) return { previewUrl: null }
    // Pick best match by title/artist overlap
    const ranked = [...data.results].sort((a, b) => scoreMatch(term, b.trackName, b.artistName) - scoreMatch(term, a.trackName, a.artistName))
    const best = ranked[0]!
    if (!best.previewUrl) return { previewUrl: null }
    // Require some overlap to avoid wrong song
    if (scoreMatch(term, best.trackName, best.artistName) < 0.5) return { previewUrl: null }
    return { previewUrl: best.previewUrl, itunesUrl: best.trackViewUrl }
  } catch {
    return { previewUrl: null }
  } finally {
    clearTimeout(to)
  }
}

// Batch resolver with simple concurrency
export async function enrichWithItunesPreviews<T extends { title: string; artist: string; previewUrl: string | null }>(
  tracks: T[],
  concurrency = 4,
): Promise<T[]> {
  const out = [...tracks] as (T & { itunesUrl?: string })[]
  // Only enrich where previewUrl is null
  const needIdx: number[] = []
  out.forEach((t, i) => { if (!t.previewUrl) needIdx.push(i) })
  for (let i = 0; i < needIdx.length; i += concurrency) {
    const batch = needIdx.slice(i, i + concurrency)
    await Promise.all(batch.map(async (idx) => {
      const t = out[idx]!
      const r = await resolveItunesPreview(t.title, t.artist)
      if (r.previewUrl) {
        out[idx] = { ...t, previewUrl: r.previewUrl, itunesUrl: r.itunesUrl } as T & { itunesUrl?: string }
      }
    }))
  }
  return out
}
