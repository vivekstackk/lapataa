// Mix of regions + dedup + aesthetic shuffle — single 50 unique.
// Keeps dir simple: caller just gets shuffled 50.

import { fetchItunesTop50 } from './itunesChart'

function variantBase(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\(.*?(version|remix|acoustic|extended|live|edit|radio|instrumental|piano).*?\)\s*$/i, '')
    .replace(/\s*-\s*(acoustic|piano|extended|remix|version).*$/i, '')
    .replace(/\s*-\s*single\s*$/i, '')
    .trim()
}

function artworkKey(url: string | null): string {
  if (!url) return ''
  return url.replace(/\/\d+x\d+bb\.(png|jpg)$/, '').toLowerCase()
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0
    const j = h % (i + 1)
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

// Fetch US + IN (50 each), merge, keep most aesthetic: prefer non-variant title once.
export async function fetchMixedAesthetic50(): Promise<{ tracks: import('./itunesChart').ItunesChartTrack[]; source: string }> {
  const [us, inn] = await Promise.all([fetchItunesTop50(), import('./itunesChartIndia').then(m => m.fetchItunesTop50India())])
  const all = [...us.tracks, ...inn.tracks]
  // Deduplicate by id, variant base+artist, and shared artwork (your BAD TIMES two albums share one cover)
  const byId = new Map<string, typeof all[number]>()
  const byVariant = new Map<string, typeof all[number]>()
  const byArtwork = new Map<string, string>()
  const deduped: typeof all[number][] = []
  for (const t of all) {
    if (byId.has(t.id)) continue
    const variantKey = `${variantBase(t.title)}::${t.artist.split(',')[0]!.split('&')[0]!.trim().toLowerCase()}`
    if (byVariant.has(variantKey)) continue
    const art = artworkKey(t.artworkUrl)
    if (art && byArtwork.has(art)) continue
    byId.set(t.id, t)
    byVariant.set(variantKey, t)
    if (art) byArtwork.set(art, t.id)
    deduped.push(t)
  }
  // Deterministic daily shuffle — locks still 24h, but order mixes regions aesthetically
  const dayKey = new Date().toISOString().slice(0, 10)
  const shuffled = seededShuffle(deduped, `lapata-mix-${dayKey}`).slice(0, 50)
  // Re-rank 1..50
  shuffled.forEach((t, i) => { t.rank = i + 1 })
  return { tracks: shuffled, source: `${us.source} + ${'itunes:in:50'} — mixed aesthetic, deduped variant, daily shuffled (${shuffled.length} unique)` }
}
