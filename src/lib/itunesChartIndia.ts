export type ItunesChartTrack = import('./itunesChart').ItunesChartTrack
export async function fetchItunesTop50India(): Promise<{ tracks: ItunesChartTrack[]; source: string }> {
  const url = 'https://itunes.apple.com/in/rss/topsongs/limit=50/json'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`iTunes IN RSS ${res.status}`)
  const data = (await res.json()) as {
    feed: { entry: { 'im:name': { label: string }; 'im:artist': { label: string }; 'im:image': { label: string; attributes: { height: string } }[]; 'im:collection': { 'im:name': { label: string } }; id: { label: string; attributes: { 'im:id': string } }; link: { attributes: { href: string } }[] }[] }
  }
  const entries = data.feed.entry ?? []
  const tracks: ItunesChartTrack[] = []
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!
    const images = e['im:image'] ?? []
    const artwork = images.length ? (images[images.length - 1]!.label.replace(/\/\d+x\d+bb\.png$/, '/300x300bb.png') ?? images[images.length - 1]!.label) : null
    const linkEnclosure = (e.link ?? []).find((l) => (l as unknown as { 'im:duration'?: { label: string } })['im:duration'] != null) as unknown as { attributes: { href: string } } | undefined
    const preview = linkEnclosure?.attributes?.href ?? null
    const altLink = (e.link ?? []).find((l) => l.attributes.href)?.attributes.href ?? ''
    const storeId = e.id?.attributes?.['im:id'] ?? `${i}`
    tracks.push({ rank: i + 1, id: `itunes:${storeId}`, title: e['im:name']?.label ?? '', artist: e['im:artist']?.label ?? 'Unknown', album: e['im:collection']?.['im:name']?.label ?? e['im:name']?.label ?? '', artworkUrl: artwork, spotifyUrl: altLink, itunesUrl: altLink, previewUrl: preview })
  }
  return { tracks, source: 'itunes:rss:topsongs:50:IN' }
}
