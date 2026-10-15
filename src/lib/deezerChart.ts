// Deezer Chart provider — public, no auth required.
// Endpoints: https://api.deezer.com/chart (empty tracks for this region from our server),
// and https://api.deezer.com/chart/0/tracks (also empty).
// Implement normalization + empty detection so caller can fall back honestly.
export type DeezerChartTrack = {
  id: string
  title: string
  artist: string
  album: string
  artworkUrl: string | null
  link: string
  preview: string | null
  duration: number | null
  rank: number | null
}

export type DeezerChartRawChart = {
  tracks: { data: { id: number; title: string; title_short: string; link: string; duration: number; rank: number; preview: string; position: number; artist: { name: string }; album: { title: string; cover_medium: string; cover_big: string } }[]; total: number }
  albums: { data: unknown[]; total: number }
}

export async function fetchDeezerChart(limit = 50): Promise<{ tracks: DeezerChartTrack[]; source: string; rawTotal: number; empty: boolean }> {
  const res = await fetch(`https://api.deezer.com/chart?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Deezer chart ${res.status}`)
  const data = (await res.json()) as DeezerChartRawChart
  const raw = data.tracks?.data ?? []
  const tracks: DeezerChartTrack[] = raw.map((t) => ({
    id: `deezer:${t.id}`,
    title: t.title_short || t.title,
    artist: t.artist?.name ?? 'Unknown',
    album: t.album?.title ?? t.title,
    artworkUrl: t.album?.cover_big ?? t.album?.cover_medium ?? null,
    link: t.link,
    preview: t.preview || null,
    duration: t.duration ? t.duration * 1000 : null,
    rank: t.position ?? t.rank ?? null,
  }))
  return {
    tracks,
    source: 'deezer:chart (Dz media — ranking; Deezer public API, no auth)',
    rawTotal: data.tracks?.total ?? 0,
    empty: tracks.length === 0,
  }
}

export async function fetchDeezerChartTracks(limit = 50): Promise<{ tracks: DeezerChartTrack[]; source: string; rawTotal: number; empty: boolean }> {
  const res = await fetch(`https://api.deezer.com/chart/0/tracks?limit=${limit}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Deezer chart/0/tracks ${res.status}`)
  const data = (await res.json()) as { data: { id: number; title: string; title_short: string; link: string; duration: number; rank: number; preview: string; position: number; artist: { name: string }; album: { title: string; cover_medium: string; cover_big: string } }[]; total: number }
  const tracks: DeezerChartTrack[] = (data.data ?? []).map((t) => ({
    id: `deezer:${t.id}`,
    title: t.title_short || t.title,
    artist: t.artist?.name ?? 'Unknown',
    album: t.album?.title ?? t.title,
    artworkUrl: t.album?.cover_big ?? t.album?.cover_medium ?? null,
    link: t.link,
    preview: t.preview || null,
    duration: t.duration ? t.duration * 1000 : null,
    rank: t.position ?? null,
  }))
  return { tracks, source: 'deezer:chart/0/tracks', rawTotal: data.total, empty: tracks.length === 0 }
}
