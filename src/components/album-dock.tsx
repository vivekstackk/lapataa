'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

type DockAlbum = {
  id: string
  title: string
  artist: string
  image: string
}

type AlbumDockProps = {
  albums: DockAlbum[]
  activeIndex: number
  activeId?: string | null
  onSelect: (index: number) => void
}

export default function AlbumDock({ albums, activeIndex, activeId, onSelect }: AlbumDockProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hovered, setHovered] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number; text: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const updateTooltip = useCallback((index: number | null) => {
    if (index === null || index < 0 || index >= albums.length) {
      setTooltipPos(null)
      return
    }
    const el = itemRefs.current[index]
    const btn = el?.querySelector('.album-dock-item') as HTMLElement | null
    const target = btn ?? el
    if (!target) return
    const rect = target.getBoundingClientRect()
    const vw = window.innerWidth
    const text = albums[index]!.title
    // Temporarily measure tooltip width via offscreen span
    const span = document.createElement('span')
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:500 13px sans-serif;padding:4px 9px;'
    span.textContent = text
    document.body.appendChild(span)
    const w = span.offsetWidth + 4
    document.body.removeChild(span)
    const gap = 10
    let left = rect.left + rect.width / 2 - w / 2
    left = Math.max(8, Math.min(left, vw - w - 8))
    // Top clamped to viewport but above thumb
    const top = Math.max(8, rect.top - 28 - gap)
    setTooltipPos({ left, top, text })
  }, [albums])

  const handleMouseEnter = useCallback((index: number) => {
    const items = itemRefs.current
    for (let j = 0; j < items.length; j++) {
      const el = items[j]
      if (!el) continue
      const diff = Math.abs(j - index)
      el.classList.remove('is-hovered', 'is-sibling-1', 'is-sibling-2', 'is-sibling-3')
      if (diff === 0) el.classList.add('is-hovered')
      else if (diff === 1) el.classList.add('is-sibling-1')
      else if (diff === 2) el.classList.add('is-sibling-2')
      else if (diff === 3) el.classList.add('is-sibling-3')
    }
    setHovered(index)
    updateTooltip(index)
  }, [updateTooltip])

  const handleMouseLeave = useCallback(() => {
    const items = itemRefs.current
    for (let j = 0; j < items.length; j++) {
      const el = items[j]
      if (el) {
        el.classList.remove('is-hovered', 'is-sibling-1', 'is-sibling-2', 'is-sibling-3')
      }
    }
    setHovered(null)
    setTooltipPos(null)
  }, [])

  // Keep tooltip in sync on resize/scroll/rotation
  useEffect(() => {
    if (hovered === null) return
    const onRecalc = () => updateTooltip(hovered)
    window.addEventListener('resize', onRecalc)
    window.addEventListener('scroll', onRecalc, true)
    return () => {
      window.removeEventListener('resize', onRecalc)
      window.removeEventListener('scroll', onRecalc, true)
    }
  }, [hovered, updateTooltip])

  return (
    <>
      <div
        className="album-dock"
        role="region"
        aria-label="Album dock"
        onMouseLeave={handleMouseLeave}
      >
        <div className="album-dock-inner">
          {albums.map((album, i) => {
            const isActive = activeId ? album.id === activeId : i === activeIndex

            return (
              <div
                key={album.id || i}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className={`album-dock-item-wrapper${isActive ? ' is-active-wrapper' : ''}`}
                onMouseEnter={() => handleMouseEnter(i)}
              >
                <button
                  className={`album-dock-item${isActive ? ' is-active' : ''}`}
                  type="button"
                  aria-label={`Select ${album.title}`}
                  onClick={() => onSelect(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={album.image} alt={album.title} draggable={false} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
      {mounted && tooltipPos && hovered !== null
        ? createPortal(
            <div
              className="album-dock-tooltip album-dock-tooltip--portal"
              role="tooltip"
              style={{ left: tooltipPos.left, top: tooltipPos.top }}
            >
              {tooltipPos.text}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
