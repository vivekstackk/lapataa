import { featuredAlbums } from '@/data/music'
import { UserIcon, PlayIcon, HeartIcon, MessageIcon, InboxIcon } from '@/components/icons'

const inboxItems = [
  {
    sender: 'Ananya',
    note: 'This reminded me of you.',
    album: featuredAlbums[3],
    time: '2 hours ago',
  },
  {
    sender: 'Rohan',
    note: 'Listen to this when you have time.',
    album: featuredAlbums[1],
    time: '5 hours ago',
  },
  {
    sender: 'Priya',
    note: 'This is exactly how today feels.',
    album: featuredAlbums[2],
    time: '1 day ago',
  },
  {
    sender: 'Arjun',
    note: 'We need to listen to this together.',
    album: featuredAlbums[0],
    time: '2 days ago',
  },
]

export default function InboxPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Music Inbox
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 10,
            padding: '2px 10px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: 'var(--indigo)',
            color: '#ffffff',
            borderRadius: 9999,
            fontFamily: 'var(--sans)',
            verticalAlign: 'middle',
          }}>
            {inboxItems.length}
          </span>
        </h1>
        <p className="page-subtitle">Songs your friends have shared with you.</p>
      </div>

      {inboxItems.length > 0 ? (
        <div>
          {inboxItems.map((item, i) => (
            <div key={i} className="inbox-item">
              <div className="inbox-sender-avatar">
                <UserIcon size={18} />
              </div>
              <div className="inbox-content">
                <div className="inbox-meta">
                  <span className="inbox-sender">{item.sender}</span>
                  <span className="inbox-time">{item.time}</span>
                </div>
                <div className="inbox-song">
                  <div className="inbox-song-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.album.image} alt={item.album.title} />
                  </div>
                  <div>
                    <div className="inbox-song-title">{item.album.title}</div>
                    <div className="inbox-song-artist">{item.album.artist}</div>
                  </div>
                </div>
                <p className="inbox-note">&ldquo;{item.note}&rdquo;</p>
                <div className="inbox-actions">
                  <button className="inbox-action" aria-label="Play"><PlayIcon size={16} /></button>
                  <button className="inbox-action" aria-label="Save"><HeartIcon size={16} /></button>
                  <button className="inbox-action" aria-label="Reply"><MessageIcon size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <InboxIcon size={48} />
          </div>
          <div className="empty-state-title">No new songs yet</div>
          <p className="empty-state-text">
            When friends share music with you, it&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  )
}
