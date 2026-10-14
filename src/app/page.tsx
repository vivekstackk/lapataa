'use client'

import { useState } from 'react'
import Link from 'next/link'
import { featuredAlbums } from '@/data/music'
import AlbumDock from '@/components/album-dock'

function SpotifyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.12-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const activeAlbum = featuredAlbums[activeIndex] ?? null

  return (
    <main className="welcome">
      {/* Top-right auth actions */}
      <div className="welcome-auth">
        <Link href="/login" className="welcome-auth-link">Log in</Link>
        <Link href="/register" className="welcome-auth-btn">Create your music space</Link>
      </div>

      {/* Brand Logo */}
      <div className="welcome-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/lapata-brush-logo.png"
          alt="लापता — Lapata"
          className="welcome-logo"
        />
      </div>

      {/* Central Player Stage */}
      <div className="welcome-player-center">
        {/* Spotify-style link */}
        <a
          className="welcome-spotify-link"
          href="https://spotify.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SpotifyIcon /> Open in Spotify
        </a>

        {/* Main Stage: artwork + disc */}
        <div className="welcome-stage">
          <div className="welcome-artwork">
            {activeAlbum && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeAlbum.image}
                alt={`${activeAlbum.title} by ${activeAlbum.artist}`}
              />
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`welcome-disc${isPlaying ? ' is-playing' : ''}`}
            src="/brand/diskk.png"
            alt=""
            aria-hidden="true"
          />
        </div>

        {/* Track Info */}
        <div className="welcome-info">
          <span className="welcome-artist">{activeAlbum?.artist ?? 'Lapata'}</span>
          <span className="welcome-title">{activeAlbum?.title ?? 'Featured Album'}</span>
        </div>

        {/* Player Controls — Original PNG artwork with transparent hit areas */}
        <div className="welcome-controls-wrap">
          <div className="welcome-controls-pill" role="group" aria-label="Music player controls">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Glossy Minimal Media Control Pill(1).png"
              alt="Music player controls (Play)"
              className="music-control-artwork"
              draggable={false}
              style={{ display: isPlaying ? 'none' : 'block' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Glossy Pause Media Control Bar.png"
              alt="Music player controls (Pause)"
              className="music-control-artwork"
              draggable={false}
              style={{ display: isPlaying ? 'block' : 'none' }}
            />
            <button
              className="pill-zone pill-zone--prev"
              aria-label="Previous track"
              type="button"
              onClick={() => {
                setActiveIndex((p) => (p - 1 + featuredAlbums.length) % featuredAlbums.length)
                setIsPlaying(true)
              }}
            />
            <button
              className="pill-zone pill-zone--play"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              aria-pressed={isPlaying}
              type="button"
              onClick={() => setIsPlaying((v) => !v)}
            />
            <button
              className="pill-zone pill-zone--next"
              aria-label="Next track"
              type="button"
              onClick={() => {
                setActiveIndex((p) => (p + 1) % featuredAlbums.length)
                setIsPlaying(true)
              }}
            />
          </div>
        </div>
      </div>

      {/* Album Dock with macOS magnification effect */}
      <AlbumDock
        albums={featuredAlbums}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />

      {/* Footer */}
      <footer className="welcome-footer">
        © 2026 Lapata · लापता
      </footer>
    </main>
  )
}
