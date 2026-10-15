'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { featuredAlbums as fallbackAlbums } from '@/data/music'
import type { Album } from '@/data/music'
import AlbumDock from '@/components/album-dock'

function SpotifyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.12-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

type ChartTrack = {
  id: string
  title: string
  artist: string
  album: string
  artworkUrl: string | null
  spotifyUrl: string
  previewUrl: string | null
  durationMs: number | null
}

function toAlbum(t: ChartTrack): Album {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    year: '',
    genre: t.album ? t.album : 'Single',
    rating: '',
    image: t.artworkUrl ?? fallbackAlbums[0]?.image ?? '',
    tracks: t.album ? [t.album] : undefined,
  }
}

function chartWindows(all: Album[]): Album[][] {
  const wins: Album[][] = []
  if (all.length >= 50) {
    wins.push(all.slice(0, 16))
    wins.push(all.slice(16, 32))
    wins.push(all.slice(32, 48))
    wins.push(all.slice(34, 50))
  } else if (all.length >= 32) {
    wins.push(all.slice(0, 16))
    wins.push(all.slice(16, 32))
    wins.push(all.slice(0, 16))
    wins.push(all.slice(16, 32))
    // If 32-49 tracks, last window limited to available
  } else {
    // Fallback: chunk into 16s
    for (let i = 0; i < all.length; i += 16) wins.push(all.slice(i, i + 16))
    if (!wins.length) wins.push(all)
  }
  // Filter out empty windows
  return wins.filter((w) => w.length > 0)
}

export default function HomePage() {
  const [allChartAlbums, setAllChartAlbums] = useState<Album[]>(fallbackAlbums)
  const [chartSource, setChartSource] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [dockWindow, setDockWindow] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(fallbackAlbums[0]?.id ?? null)
  const [isPlaying, setIsPlaying] = useState(false)
  // Derived: visible dock = window slice
  const windows = chartWindows(allChartAlbums)
  const dockAlbums = windows[dockWindow] ?? windows[0] ?? allChartAlbums.slice(0, 16)
  // Active album resolved from allChartAlbums so playback persists across window rotation
  const activeAlbum = (allChartAlbums.find((a) => a.id === activeId) ?? allChartAlbums[0] ?? fallbackAlbums[0]) as Album
  const activeIndex = Math.max(0, allChartAlbums.findIndex((a) => a.id === activeId))
  const spotifyHref = (() => {
    const t = allChartAlbums.find((a) => a.id === activeId) as unknown as { spotifyUrl?: string } | null
    const url = t && 'spotifyUrl' in t ? (t as { spotifyUrl?: string }).spotifyUrl : undefined
    return url || 'https://open.spotify.com'
  })()

  // Preview audio — single element, cleanup on change
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const previewUrl = (activeAlbum as unknown as { previewUrl?: string | null })?.previewUrl ?? null

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    setAudioError(null)
    if (!previewUrl) {
      setIsPlaying(false)
      el.removeAttribute('src')
      el.load()
      return
    }
    el.src = previewUrl
    el.load()
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false))
    }
  }, [previewUrl])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (isPlaying) {
      if (!previewUrl) {
        setIsPlaying(false)
        return
      }
      // If src not yet loaded, let above effect handle play
      if (el.src && el.readyState >= 1) {
        el.play().catch(() => setIsPlaying(false))
      }
    } else {
      el.pause()
    }
  }, [isPlaying, previewUrl])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnded = () => {
      setIsPlaying(false)
      // Auto-advance to next in chart order
      const idx = allChartAlbums.findIndex((a) => a.id === activeId)
      if (idx >= 0 && idx < allChartAlbums.length - 1) {
        setActiveId(allChartAlbums[idx + 1]!.id)
        setIsPlaying(true)
      }
    }
    const onError = () => setAudioError('Preview unavailable')
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
    }
  }, [allChartAlbums, activeId])

  // Dock rotation — independent from chart refresh. 30s dev, 24h prod via NEXT_PUBLIC_DOCK_ROTATION_MS
  useEffect(() => {
    const raw = Number(process.env.NEXT_PUBLIC_DOCK_ROTATION_MS ?? '86400000')
    const ms = Number.isFinite(raw) ? raw : 86400000
    if (ms <= 0) return
    const id = setInterval(() => {
      setDockWindow((w) => (w + 1) % windows.length)
    }, ms)
    return () => clearInterval(id)
    // Depend on windows.length so timer resets correctly when chart loads
  }, [windows.length])

  // Chart refresh — every CHART cache TTL, fetch anew and keep last valid on failure
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let timer: ReturnType<typeof setInterval> | null = null
    async function load() {
      try {
        setChartLoading(true)
        setChartError(null)
        const res = await fetch('/api/music/chart', { signal: controller.signal, cache: 'no-store' })
        const data = (await res.json()) as {
          ok: boolean
          source?: string
          tracks?: ChartTrack[]
          error?: string
          fetchedAt?: string
        }
        if (cancelled) return
        if (!res.ok || !data.ok || !data.tracks?.length) {
          setChartError(data.error ?? `Chart unavailable (${res.status})`)
          setChartSource(data.source ?? null)
          if (data.fetchedAt) setFetchedAt(data.fetchedAt)
          // Preserve last valid — do not clear allChartAlbums
          return
        }
        const mapped = data.tracks.map(toAlbum)
        setAllChartAlbums(mapped)
        setChartSource(data.source ?? null)
        if (data.fetchedAt) setFetchedAt(data.fetchedAt)
        // Preserve activeId if still in new chart
        // Don't change activeId here unless it vanished
      } catch (e) {
        if (cancelled) return
        if ((e as Error).name === 'AbortError') return
        setChartError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setChartLoading(false)
      }
    }
    load()
    // Periodic refresh at chart TTL
    const ttlRaw = Number(process.env.NEXT_PUBLIC_DOCK_ROTATION_MS ?? '86400000')
    // Use server default for chart refresh — re-fetch at DOCK_ROTATION_MS cadence is okay for demo,
    // but chart refresh uses CHART_CACHE_TTL on server (24h). Client just polls chart endpoint.
    const chartPollMs = 86400000
    timer = setInterval(() => {
      if (!cancelled) load()
    }, chartPollMs)
    return () => {
      cancelled = true
      controller.abort()
      if (timer) clearInterval(timer)
    }
  }, [])

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
          href={spotifyHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SpotifyIcon /> Open in Spotify
        </a>
        {chartLoading && <span className="sr-only" aria-live="polite">Loading chart…</span>}
        {chartError && (
          <span className="welcome-chart-hint" role="status" aria-live="polite" title={chartSource ?? undefined}>
            {chartSource ? `${chartSource}: ` : ''}
            {chartError}
            {' — showing local tracks'}
          </span>
        )}

        <div className="welcome-player-main">
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
                const idx = allChartAlbums.findIndex((a) => a.id === activeId)
                const prev = idx <= 0 ? allChartAlbums.length - 1 : idx - 1
                setActiveId(allChartAlbums[prev]!.id)
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
                const idx = allChartAlbums.findIndex((a) => a.id === activeId)
                const next = (idx + 1) % allChartAlbums.length
                setActiveId(allChartAlbums[next]!.id)
                setIsPlaying(true)
              }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden preview audio element */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" style={{ display: 'none' }} />
      {previewUrl ? null : (
        <span className="welcome-preview-hint" role="status" aria-live="polite">
          Preview unavailable — <a href={spotifyHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Listen on Spotify</a>
          {audioError ? ` (${audioError})` : ''}
        </span>
      )}
      {fetchedAt && <span className="welcome-fetched-hint">Updated {new Date(fetchedAt).toLocaleString()}</span>}

      {/* Album Dock with macOS magnification effect — 16 at a time */}
      <AlbumDock
        albums={dockAlbums}
        activeIndex={Math.max(0, dockAlbums.findIndex((a) => a.id === activeId))}
        activeId={activeId}
        onSelect={(i) => {
          const id = dockAlbums[i]?.id
          if (id) setActiveId(id)
        }}
      />

      {/* Footer */}
      <footer className="welcome-footer">
        {fetchedAt ? `© 2026 Lapata · लापता · updated ${new Date(fetchedAt).toLocaleDateString()}` : '© 2026 Lapata · लापता'}
      </footer>
    </main>
  )
}
