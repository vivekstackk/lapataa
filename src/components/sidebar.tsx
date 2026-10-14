'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LapataWordmark, LapataMark } from '@/components/brand/lapata-wordmark'
import {
  HomeIcon, CompassIcon, MusicNoteIcon, UsersIcon,
  MessageIcon, InboxIcon, ListMusicIcon, BookOpenIcon,
  BellIcon, SettingsIcon, ShareIcon, UserIcon,
  ChevronRightIcon
} from '@/components/icons'

const navItems = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/discover', label: 'Discover', icon: CompassIcon },
  { href: '/my-music', label: 'My Music', icon: MusicNoteIcon },
  { href: '/friends', label: 'Friends', icon: UsersIcon },
  { href: '/messages', label: 'Messages', icon: MessageIcon },
  { href: '/inbox', label: 'Music Inbox', icon: InboxIcon },
  { href: '/playlists', label: 'Playlists', icon: ListMusicIcon },
  { href: '/diary', label: 'Listening Diary', icon: BookOpenIcon },
]

const bottomItems = [
  { href: '/notifications', label: 'Notifications', icon: BellIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const w = collapsed ? 64 : 240

  return (
    <aside className="sidebar" style={{ width: w }}>
      {/* Brand */}
      <div className="sidebar-brand">
        {collapsed ? (
          <LapataMark variant="indigo" size={28} />
        ) : (
          <LapataWordmark variant="indigo" size="sm" href="/home" />
        )}
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? 'is-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Share button */}
      <button className="sidebar-share-btn" title={collapsed ? 'Share a song' : undefined}>
        <ShareIcon size={18} />
        {!collapsed && <span>Share a song</span>}
      </button>

      <div className="sidebar-divider" />

      {/* Bottom items */}
      <div className="sidebar-bottom">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? 'is-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <UserIcon size={16} />
        </div>
        {!collapsed && <span className="sidebar-username">Vivek</span>}
      </div>

      {/* Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRightIcon
          size={18}
          className={collapsed ? '' : 'rotate-180'}
        />
      </button>
    </aside>
  )
}
