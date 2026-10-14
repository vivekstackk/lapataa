'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, CompassIcon, ShareIcon, InboxIcon, UserIcon } from '@/components/icons'

const items = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/discover', label: 'Discover', icon: CompassIcon },
  { href: '/inbox', label: 'Inbox', icon: InboxIcon },
  { href: '/settings', label: 'Profile', icon: UserIcon },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? 'is-active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Center share button */}
        <button className="mobile-nav-item--share" aria-label="Share a song">
          <ShareIcon size={22} />
        </button>

        {items.slice(2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? 'is-active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
