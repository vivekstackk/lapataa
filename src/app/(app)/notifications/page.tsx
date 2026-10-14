import { ShareIcon, UsersIcon, ListMusicIcon, HeartIcon } from '@/components/icons'

const notifications = [
  { id: 1, type: 'share', icon: 'share', user: 'Aanya Sharma', message: 'shared "Bekhayali" with you', time: '5m ago', read: false },
  { id: 2, type: 'follow', icon: 'follow', user: 'Rohan Mehta', message: 'started following you', time: '20m ago', read: false },
  { id: 3, type: 'playlist', icon: 'playlist', user: 'Priya Kapoor', message: 'added 3 songs to "Late Night Drives"', time: '1h ago', read: false },
  { id: 4, type: 'like', icon: 'like', user: 'Arjun Nair', message: 'liked your diary entry for Oct 11', time: '3h ago', read: true },
  { id: 5, type: 'share', icon: 'share', user: 'Kavya Iyer', message: 'shared "Canopy Stillness" with you', time: '5h ago', read: true },
  { id: 6, type: 'follow', icon: 'follow', user: 'Sameer Joshi', message: 'started following you', time: '1d ago', read: true },
  { id: 7, type: 'playlist', icon: 'playlist', user: 'Tanvi Verma', message: 'created a playlist "Monsoon Vibes"', time: '1d ago', read: true },
  { id: 8, type: 'share', icon: 'share', user: 'Faizan Qureshi', message: 'shared "Dam Hama Dam" with you', time: '2d ago', read: true },
]

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'share': return <ShareIcon size={16} />
    case 'follow': return <UsersIcon size={16} />
    case 'playlist': return <ListMusicIcon size={16} />
    case 'like': return <HeartIcon size={16} />
    default: return <ShareIcon size={16} />
  }
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">{unreadCount} new</p>
      </div>

      <div className="notif-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notif-item ${!n.read ? 'is-unread' : ''}`}>
            <div className={`notif-icon notif-icon--${n.type}`}>
              <NotifIcon type={n.type} />
            </div>
            <div className="notif-content">
              <p className="notif-text">
                <strong>{n.user}</strong> {n.message}
              </p>
              <span className="notif-time">{n.time}</span>
            </div>
            {!n.read && <span className="notif-unread-dot" />}
          </div>
        ))}
      </div>
    </div>
  )
}
