import { featuredAlbums, popularTracks } from '@/data/music'
import { SearchIcon } from '@/components/icons'

const moods = [
  { name: 'Melancholy', color: '#4A5568' },
  { name: 'Energetic', color: '#E53E3E' },
  { name: 'Romantic', color: '#D53F8C' },
  { name: 'Chill', color: '#38A169' },
  { name: 'Dark', color: '#1A1A2E' },
  { name: 'Uplifting', color: '#D69E2E' },
  { name: 'Nostalgic', color: '#805AD5' },
  { name: 'Contemplative', color: '#3182CE' },
]

export default function DiscoverPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discover</h1>
        <p className="page-subtitle">Find your next favorite song.</p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <SearchIcon size={18} />
        <input type="text" placeholder="Search songs, artists, albums..." />
      </div>

      {/* Trending */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
        </div>
        <div className="h-scroll">
          {featuredAlbums.map((album) => (
            <div key={album.id} className="album-card">
              <div className="album-card-art">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={album.image} alt={album.title} />
              </div>
              <div className="album-card-title">{album.title}</div>
              <div className="album-card-artist">{album.artist}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Mood */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Browse by Mood</h2>
        </div>
        <div className="mood-grid">
          {moods.map((mood) => (
            <button
              key={mood.name}
              className="mood-card"
              style={{ backgroundColor: mood.color }}
            >
              {mood.name}
            </button>
          ))}
        </div>
      </section>

      {/* Popular This Week */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Popular This Week</h2>
        </div>
        <div className="track-list">
          {popularTracks.map((track) => (
            <div key={track.number} className="track-row">
              <span className="track-number">{track.number}</span>
              <div className="track-info">
                <div className="track-name">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <span className="track-duration">{track.duration}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
