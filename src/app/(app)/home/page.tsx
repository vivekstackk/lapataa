'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { featuredAlbums } from '@/data/music'
import { PlayIcon, HeartIcon, ShareIcon, UserIcon } from '@/components/icons'

function useGreeting() {
  const [greeting, setGreeting] = useState('Hello')
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])
  return greeting
}

const recentShares = [
  { sender: 'Ananya', note: 'This reminded me of you', album: featuredAlbums[3], time: '2h ago' },
  { sender: 'Rohan', note: 'Listen to this when you have time', album: featuredAlbums[1], time: '5h ago' },
  { sender: 'Priya', note: 'This is exactly how today feels', album: featuredAlbums[2], time: '1d ago' },
]

export default function HomePage() {
  const greeting = useGreeting()

  return (
    <div>
      {/* Greeting */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, Vivek</h1>
        <p className="page-subtitle">Here&apos;s what&apos;s been shared with you.</p>
      </div>

      {/* Music Inbox Preview */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Music Inbox</h2>
          <Link href="/inbox" className="section-link">See all →</Link>
        </div>
        <div>
          {recentShares.map((share, i) => (
            <div key={i} className="inbox-item">
              <div className="inbox-sender-avatar">
                <UserIcon size={18} />
              </div>
              <div className="inbox-content">
                <div className="inbox-meta">
                  <span className="inbox-sender">{share.sender}</span>
                  <span className="inbox-time">{share.time}</span>
                </div>
                <div className="inbox-song">
                  <div className="inbox-song-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={share.album.image} alt={share.album.title} />
                  </div>
                  <div>
                    <div className="inbox-song-title">{share.album.title}</div>
                    <div className="inbox-song-artist">{share.album.artist}</div>
                  </div>
                </div>
                <p className="inbox-note">&ldquo;{share.note}&rdquo;</p>
                <div className="inbox-actions">
                  <button className="inbox-action" aria-label="Play"><PlayIcon size={16} /></button>
                  <button className="inbox-action" aria-label="Save"><HeartIcon size={16} /></button>
                  <button className="inbox-action" aria-label="Share"><ShareIcon size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Your Music */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Your Music</h2>
          <Link href="/my-music" className="section-link">See all →</Link>
        </div>
        <div className="h-scroll">
          {featuredAlbums.slice(0, 4).map((album) => (
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

      {/* Recently Shared */}
      <section className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Recently Shared by Friends</h2>
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
    </div>
  )
}
