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
    // Preserve Spotify fields for audio/link — not in Album type, carry via index signature
    ...({ spotifyUrl: t.spotifyUrl, previewUrl: t.previewUrl, durationMs: t.durationMs } as unknown as Partial<Album>),
  } as Album
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

const DOCK_MS = 86400000
const DOCK_KEY = 'lapata:dockLocked:v3'
type DockPersist = { window: number; selectedAt: number; tracks: Album[] }

function isMockAlbum(a: Album): boolean {
  if (/^\d+$/.test(a.id) && Number(a.id) >= 1 && Number(a.id) <= 32) return true
  const realPrefix = a.id.startsWith('itunes:') || a.id.startsWith('deezer:')
  if (a.image?.includes('images.unsplash.com') && !realPrefix) return true
  return false
}

function isRealChart(albums: Album[]): boolean {
  if (albums.length < 16) return false
  const firstId = albums[0]?.id ?? ''
  return firstId.startsWith('itunes:') || firstId.startsWith('deezer:')
}

function isMockPersist(p: DockPersist): boolean {
  if (!p.tracks.length) return true
  // If any track looks mock, the whole persist is stale
  if (p.tracks.some(isMockAlbum)) return true
  if (p.tracks.length !== 16) return true
  return false
}

function readDockPersist(): DockPersist | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DOCK_KEY)
    if (raw) {
      const d = JSON.parse(raw) as DockPersist
      if (typeof d.window === 'number' && typeof d.selectedAt !== 'number' && !Array.isArray(d.tracks)) return null
      if (typeof d.window !== 'number' || typeof d.selectedAt !== 'number' || !Array.isArray(d.tracks)) return null
      if (isMockPersist(d)) {
        try { localStorage.removeItem(DOCK_KEY) } catch {}
        return null
      }
      return d
    }
    // Migrate from older keys — but reject mock data
    for (const legacyKey of ['lapata:dockLocked:v2', 'lapata:dockLocked', 'lapata:dockWindow']) {
      const legacy = localStorage.getItem(legacyKey)
      if (!legacy) continue
      try {
        const ld = JSON.parse(legacy) as { window: number; selectedAt: number; tracks?: Album[] }
        if (typeof ld.window === 'number' && typeof ld.selectedAt === 'number') {
          if (ld.tracks && Array.isArray(ld.tracks) && ld.tracks.length === 16 && !ld.tracks.some(isMockAlbum)) {
            return { window: ld.window, selectedAt: ld.selectedAt, tracks: ld.tracks as Album[] }
          }
        }
      } catch {}
    }
    return null
  } catch {
    return null
  }
}

function writeDockPersist(p: DockPersist) {
  try {
    localStorage.setItem(DOCK_KEY, JSON.stringify(p))
    // Clean legacy keys
    localStorage.removeItem('lapata:dockLocked')
    localStorage.removeItem('lapata:dockLocked:v2')
    localStorage.removeItem('lapata:dockWindow')
  } catch {}
}

/* isRealChart defined above with isMockAlbum — covers itunes: and deezer: */

export default function HomePage() {
  const [allChartAlbums, setAllChartAlbums] = useState<Album[]>(fallbackAlbums)
  const [chartSource, setChartSource] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)
  const [chartLoading, setChartLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(fallbackAlbums[0]?.id ?? null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [didHydratePersist, setDidHydratePersist] = useState(false)
  const [dockLocked, setDockLocked] = useState<DockPersist | null>(null)
  useEffect(() => {
    const p = readDockPersist()
    if (!p) { setDidHydratePersist(true); return }
    const elapsed = Date.now() - p.selectedAt
    if (elapsed >= 0 && elapsed < DOCK_MS && p.tracks.length === 16 && !isMockPersist(p)) setDockLocked(p)
    else {
      // Expired or mock — clear so a real window will be locked from fresh chart
      try { localStorage.removeItem(DOCK_KEY) } catch {}
    }
    setDidHydratePersist(true)
  }, [])
  const windows = chartWindows(allChartAlbums)
  const dockWindow = dockLocked?.window ?? 0
  const dockAlbums = (() => {
    if (!didHydratePersist) return [] // avoid flash of mock before persist resolves
    if (dockLocked && dockLocked.tracks.length === 16) {
      const elapsed = Date.now() - dockLocked.selectedAt
      if (elapsed >= 0 && elapsed < DOCK_MS) return dockLocked.tracks
    }
    return windows[dockWindow] ?? windows[0] ?? allChartAlbums.slice(0, 16)
  })()
  // Main player uses same 16 as dock when dock is locked — fixes mismatch
  const effectiveChartForPlayer = dockLocked && dockLocked.tracks.length === 16 ? dockLocked.tracks : allChartAlbums
  const activeAlbum = (effectiveChartForPlayer.find((a) => a.id === activeId) ?? dockAlbums[0] ?? effectiveChartForPlayer[0] ?? allChartAlbums[0] ?? null) as Album | null
  const activeIndex = Math.max(0, effectiveChartForPlayer.findIndex((a) => a.id === activeId))
  const spotifyHref = (() => {
    const t = effectiveChartForPlayer.find((a) => a.id === activeId) as unknown as { spotifyUrl?: string; itunesUrl?: string } | null
    const url = t && ('spotifyUrl' in t || 'itunesUrl' in t) ? ((t as { spotifyUrl?: string }).spotifyUrl ?? (t as { itunesUrl?: string }).itunesUrl) : undefined
    return url || 'https://open.spotify.com'
  })()
  // After dock hydration + chart load, ensure activeId is inside the visible 16 (from mock fallback -> real)
  useEffect(() => {
    if (!didHydratePersist || !dockAlbums.length) return
    if (activeId && dockAlbums.some((a) => a.id === activeId)) return
    if (!activeId || (activeId && isMockAlbum({ id: activeId } as Album))) {
      setActiveId(dockAlbums[0]!.id)
    }
  }, [didHydratePersist, dockAlbums, activeId])

  // Preview audio — single element, cleanup on change
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewUrl = (activeAlbum as unknown as { previewUrl?: string | null })?.previewUrl ?? null
  // Dev-only diagnostic — verify live provider vs mock
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (!didHydratePersist || chartLoading) return
    const liveItunes = allChartAlbums.filter((a) => a.id.startsWith('itunes:')).length
    const liveDeezer = allChartAlbums.filter((a) => a.id.startsWith('deezer:')).length
    const mock = allChartAlbums.filter((a) => /^\d+$/.test(a.id) && Number(a.id) <= 16).length
    console.info('[Lapata diag]', {
      provider: chartSource,
      fetchedAt,
      total: allChartAlbums.length,
      liveItunes,
      liveDeezer,
      mockFallback: mock,
      dockWindow,
      dockTracks: dockAlbums.slice(0, 5).map((t) => `${t.title} — ${t.artist}`),
      locked: !!dockLocked,
    })
  }, [didHydratePersist, chartLoading, allChartAlbums, chartSource, fetchedAt, dockWindow, dockAlbums, dockLocked])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    if (!previewUrl) {
      if (isPlaying) setIsPlaying(false)
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
      if (el.src && el.readyState >= 1) {
        el.play().catch((err) => {
          console.warn('preview play failed', err)
          setIsPlaying(false)
        })
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
      const idx = allChartAlbums.findIndex((a) => a.id === activeId)
      if (idx >= 0 && idx < allChartAlbums.length - 1) {
        setActiveId(allChartAlbums[idx + 1]!.id)
        setIsPlaying(true)
      }
    }
    const onError = () => {
      console.warn('preview error', el.error)
      setIsPlaying(false)
    }
    const onPlaying = () => setIsPlaying(true)
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)
    el.addEventListener('playing', onPlaying)
    return () => {
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
      el.removeEventListener('playing', onPlaying)
    }
  }, [allChartAlbums, activeId])

  // Initialize or restore 24h-locked dock: lock only from real chart, never from fallbackAlbums
  useEffect(() => {
    if (!windows.length) return
    if (dockLocked) return // already locked, 24h timer below handles rotation
    if (!isRealChart(allChartAlbums)) return // wait for real Global Top 50 — do not lock mock
    // If persist had mock, or we never locked, pick window 0 of real chart
    const nextTracks = windows[0] ?? allChartAlbums.slice(0, 16)
    if (!nextTracks.length || nextTracks.some(isMockAlbum)) return
    // Ensure activeId points into real chart if it was on a mock
    if (activeId && !allChartAlbums.some((a) => a.id === activeId)) {
      const firstReal = nextTracks[0] ?? allChartAlbums[0]
      if (firstReal) setActiveId(firstReal.id)
    }
    const locked: DockPersist = { window: 0, selectedAt: Date.now(), tracks: nextTracks }
    setDockLocked(locked)
    writeDockPersist(locked)
  }, [windows.length, dockLocked, allChartAlbums, activeId])

  // 24h rotation — single setTimeout locked to selectedAt, uses real chart windows
  useEffect(() => {
    if (!dockLocked) return
    if (!windows.length) return
    if (!isRealChart(allChartAlbums)) return
    const elapsed = Date.now() - dockLocked.selectedAt
    const delay = Math.max(0, DOCK_MS - elapsed)
    const timeout = setTimeout(() => {
      const nextWindow = (dockLocked.window + 1) % windows.length
      const nextTracks = windows[nextWindow] ?? allChartAlbums.slice(0, 16)
      if (nextTracks.some(isMockAlbum)) return // do not rotate into mock
      const locked: DockPersist = { window: nextWindow, selectedAt: Date.now(), tracks: nextTracks }
      setDockLocked(locked)
      writeDockPersist(locked)
    }, delay)
    return () => clearTimeout(timeout)
  }, [dockLocked, windows, allChartAlbums])

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
          // Do NOT overwrite real chart with empty/mock — keep last valid
          return
        }
        const mapped = data.tracks.map(toAlbum)
        if (mapped.some((a) => !a.id?.startsWith('itunes:') && /^\d+$/.test(a.id))) {
          console.warn('[Lapata] ignoring chart response with mock ids')
          return
        }
        setAllChartAlbums(mapped)
        setChartSource(data.source ?? null)
        if (data.fetchedAt) setFetchedAt(data.fetchedAt)
        // If current dock is still on mock/fallback, migrate to real immediately (one-time)
        if (dockLocked && isMockPersist(dockLocked)) {
          const firstReal = mapped.slice(0, 16)
          const migrated: DockPersist = { window: 0, selectedAt: Date.now(), tracks: firstReal }
          setDockLocked(migrated)
          writeDockPersist(migrated)
          setActiveId(firstReal[0]!.id)
        } else if (!isMockPersist({ window: 0, selectedAt: Date.now(), tracks: mapped.slice(0, 16) } as DockPersist)) {
          // First load from fallbackAlbums (didHydratePersist false) — snap active to new dock if on mock
          if (activeId && isMockAlbum({ id: activeId } as Album)) {
            setActiveId(mapped[0]!.id)
          }
        }
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
        {chartLoading && didHydratePersist && !dockLocked && <span className="sr-only" aria-live="polite">Loading chart…</span>}
        {chartLoading && !didHydratePersist && <span className="welcome-chart-hint" role="status">Loading Global Top 50…</span>}
        {chartError && didHydratePersist && (
          <span className="welcome-chart-hint" role="status" aria-live="polite" title={chartSource ?? undefined}>
            {chartSource ? `${chartSource}: ` : ''}
            {chartError}
            {dockLocked ? '' : ' — chart unavailable'}
          </span>
        )}

        <div className="welcome-player-main">
          {/* Main Stage: artwork + disc */}
          <div className="welcome-stage">
            <div className="welcome-artwork">
              {activeAlbum ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeAlbum.image}
                  alt={`${activeAlbum.title} by ${activeAlbum.artist}`}
                />
              ) : (
                <div className="welcome-artwork--empty" aria-hidden="true" />
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
            <span className="welcome-artist">{activeAlbum?.artist ?? (chartLoading ? 'Loading…' : '—')}</span>
            <span className="welcome-title">{activeAlbum?.title ?? (chartLoading ? 'Loading Global Top 50' : 'Chart unavailable')}</span>
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

      {/* Album Dock — 16 locked tracks, hidden until hydrated to avoid mock flash */}
      {didHydratePersist && dockAlbums.length > 0 ? (
        <AlbumDock
          albums={dockAlbums}
          activeIndex={Math.max(0, dockAlbums.findIndex((a) => a.id === activeId))}
          activeId={activeId}
          onSelect={(i) => {
            const id = dockAlbums[i]?.id
            if (id) setActiveId(id)
          }}
        />
      ) : (
        <div className="album-dock album-dock--loading" aria-hidden="true">
          <div className="album-dock-inner" />
        </div>
      )}

      {/* Footer */}
      <footer className="welcome-footer">
        © 2026 Lapata · लापता
      </footer>
    </main>
  )
}
