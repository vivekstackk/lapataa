import { PlusIcon } from '@/components/icons'

const playlists = [
  { id: 1, title: 'Late Night Drives', trackCount: 24, duration: '1h 42m', images: [
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80',
  ]},
  { id: 2, title: 'Monsoon Mornings', trackCount: 18, duration: '1h 15m', images: [
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1504898770365-e916e29b4e72?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=200&q=80',
  ]},
  { id: 3, title: 'Workout Energy', trackCount: 32, duration: '2h 08m', images: [
    'https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80',
  ]},
  { id: 4, title: 'Sufi & Qawwali', trackCount: 14, duration: '2h 30m', images: [
    'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1504898770365-e916e29b4e72?auto=format&fit=crop&w=200&q=80',
  ]},
  { id: 5, title: 'Focus & Flow', trackCount: 20, duration: '1h 28m', images: [
    'https://images.unsplash.com/photo-1504898770365-e916e29b4e72?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=200&q=80',
  ]},
]

export default function PlaylistsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Playlists</h1>
        <p className="page-subtitle">Your curated collections</p>
      </div>

      <button className="create-playlist-btn" type="button">
        <PlusIcon size={18} />
        <span>Create New Playlist</span>
      </button>

      <div className="playlist-grid">
        {playlists.map((pl) => (
          <button key={pl.id} className="playlist-card" type="button">
            <div className="playlist-mosaic">
              {pl.images.map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={img} alt="" />
              ))}
            </div>
            <div className="playlist-card-info">
              <span className="playlist-card-title">{pl.title}</span>
              <span className="playlist-card-meta">{pl.trackCount} tracks · {pl.duration}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
