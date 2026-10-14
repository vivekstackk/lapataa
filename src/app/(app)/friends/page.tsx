import { SearchIcon } from '@/components/icons'

const friends = [
  { id: 1, name: 'Aanya Sharma', status: 'Listening to Bekhayali', avatar: 'AS', online: true, lastActive: 'Now' },
  { id: 2, name: 'Rohan Mehta', status: 'Listening to Let It Happen', avatar: 'RM', online: true, lastActive: 'Now' },
  { id: 3, name: 'Priya Kapoor', status: 'Last played Ivy', avatar: 'PK', online: false, lastActive: '2h ago' },
  { id: 4, name: 'Arjun Nair', status: 'Listening to Walkin', avatar: 'AN', online: true, lastActive: 'Now' },
  { id: 5, name: 'Kavya Iyer', status: 'Last played Nikes', avatar: 'KI', online: false, lastActive: '5h ago' },
  { id: 6, name: 'Sameer Joshi', status: 'Listening to Dam Hama Dam', avatar: 'SJ', online: true, lastActive: 'Now' },
]

const suggested = [
  { id: 7, name: 'Tanvi Verma', mutualFriends: 4, avatar: 'TV' },
  { id: 8, name: 'Faizan Qureshi', mutualFriends: 2, avatar: 'FQ' },
  { id: 9, name: 'Meera Nair', mutualFriends: 6, avatar: 'MN' },
]

export default function FriendsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Friends</h1>
        <p className="page-subtitle">Your music circle</p>
      </div>

      <div className="search-bar">
        <SearchIcon size={18} />
        <input type="text" placeholder="Find friends..." />
      </div>

      {/* Online / All Friends */}
      <div className="mb-section">
        <div className="section-header">
          <h2 className="section-title">All Friends · {friends.length}</h2>
        </div>
        <div className="friends-list">
          {friends.map((f) => (
            <div key={f.id} className="friend-card">
              <div className="friend-avatar">
                {f.online && <span className="friend-online-dot" />}
                <span>{f.avatar}</span>
              </div>
              <div className="friend-info">
                <span className="friend-name">{f.name}</span>
                <span className="friend-status">{f.status}</span>
              </div>
              <span className="friend-time">{f.lastActive}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested */}
      <div className="mb-section">
        <div className="section-header">
          <h2 className="section-title">Suggested for you</h2>
        </div>
        <div className="friends-list">
          {suggested.map((s) => (
            <div key={s.id} className="friend-card">
              <div className="friend-avatar">
                <span>{s.avatar}</span>
              </div>
              <div className="friend-info">
                <span className="friend-name">{s.name}</span>
                <span className="friend-status">{s.mutualFriends} mutual friends</span>
              </div>
              <button className="friend-add-btn" type="button">Add</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
