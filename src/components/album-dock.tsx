'use client'

import { useRef, useCallback } from 'react'

type DockAlbum = {
  id: string
  title: string
  artist: string
  image: string
}

type AlbumDockProps = {
  albums: DockAlbum[]
  activeIndex: number
  onSelect: (index: number) => void
}

export default function AlbumDock({ albums, activeIndex, onSelect }: AlbumDockProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

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
  }, [])

  const handleMouseLeave = useCallback(() => {
    const items = itemRefs.current
    for (let j = 0; j < items.length; j++) {
      const el = items[j]
      if (el) {
        el.classList.remove('is-hovered', 'is-sibling-1', 'is-sibling-2', 'is-sibling-3')
      }
    }
  }, [])

  return (
    <div
      className="album-dock"
      role="region"
      aria-label="Album dock"
      onMouseLeave={handleMouseLeave}
    >
      <div className="album-dock-inner">
        {albums.map((album, i) => {
          const isActive = i === activeIndex

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

              {/* Tooltip: strictly anchored 10px above the top of the card */}
              <div className="album-dock-tooltip" role="tooltip">
                {album.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
