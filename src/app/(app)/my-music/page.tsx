import { featuredAlbums } from '@/data/music'

export default function MyMusicPage() {
  const savedAlbums = featuredAlbums.slice(0, 8)
  const recentlyPlayed = featuredAlbums.slice(2, 8)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Music</h1>
        <p className="page-subtitle">Your personal library</p>
      </div>

      {/* Stats */}
      <div className="music-stats mb-section">
        <div className="stat-card">
          <span className="stat-number">127</span>
          <span className="stat-label">Liked Songs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">34</span>
          <span className="stat-label">Saved Albums</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">12</span>
          <span className="stat-label">Playlists</span>
        </div>
      </div>

      {/* Recently Played */}
      <div className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Recently Played</h2>
          <a className="section-link" href="#">See all</a>
        </div>
        <div className="h-scroll">
          {recentlyPlayed.map((album) => (
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
      </div>

      {/* Saved Albums */}
      <div className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Saved Albums</h2>
          <a className="section-link" href="#">See all</a>
        </div>
        <div className="album-grid">
          {savedAlbums.map((album) => (
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
      </div>
    </div>
  )
}
