// Messages page

const conversations = [
  { id: 1, name: 'Aanya Sharma', avatar: 'AS', lastMessage: 'Have you heard the new Tame Impala track?', time: '2m ago', unread: true },
  { id: 2, name: 'Rohan Mehta', avatar: 'RM', lastMessage: 'That Sufi album is incredible 🔥', time: '15m ago', unread: true },
  { id: 3, name: 'Priya Kapoor', avatar: 'PK', lastMessage: 'Adding it to our shared playlist now', time: '1h ago', unread: false },
  { id: 4, name: 'Arjun Nair', avatar: 'AN', lastMessage: 'The live version is even better honestly', time: '3h ago', unread: false },
  { id: 5, name: 'Kavya Iyer', avatar: 'KI', lastMessage: 'Thanks for sharing that lo-fi album!', time: '1d ago', unread: false },
  { id: 6, name: 'Sameer Joshi', avatar: 'SJ', lastMessage: 'Let me know what you think of track 3', time: '2d ago', unread: false },
]

export default function MessagesPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Talk about music with friends</p>
      </div>

      <div className="messages-list">
        {conversations.map((c) => (
          <button key={c.id} className="message-item" type="button">
            <div className="message-avatar">
              <span>{c.avatar}</span>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-name">{c.name}</span>
                <span className="message-time">{c.time}</span>
              </div>
              <p className={`message-preview ${c.unread ? 'is-unread' : ''}`}>
                {c.lastMessage}
              </p>
            </div>
            {c.unread && <span className="message-unread-dot" />}
          </button>
        ))}
      </div>
    </div>
  )
}
