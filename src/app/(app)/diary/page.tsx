const diaryEntries = [
  {
    id: 1,
    date: 'Today · Oct 13',
    mood: '🎧 Reflective',
    albums: ['Blonde', 'Mist Over Whispering Pines'],
    tracks: 14,
    note: 'Spent the morning with Frank Ocean. The ambient album was perfect for the rainy afternoon.',
  },
  {
    id: 2,
    date: 'Yesterday · Oct 12',
    mood: '🔥 Energized',
    albums: ['Currents', 'Pulse of Neon Vistas'],
    tracks: 22,
    note: 'Tame Impala on the morning commute. Kavya & The Grid for the late night coding session.',
  },
  {
    id: 3,
    date: 'Oct 11',
    mood: '🌙 Calm',
    albums: ['Ruhaaniyat', 'Echoes of Darbari'],
    tracks: 8,
    note: 'Classical evening. The Sufi qawwali was transcendent — goosebumps on Man Kunto Maula.',
  },
  {
    id: 4,
    date: 'Oct 10',
    mood: '☀️ Upbeat',
    albums: ['Noches de Luna Llena', 'Midnight Aurora'],
    tracks: 18,
    note: 'Latin guitar and K-Pop — weird combo but it worked. Brisa de Sevilla is stuck in my head.',
  },
  {
    id: 5,
    date: 'Oct 9',
    mood: '🍂 Nostalgic',
    albums: ['Kabir Singh', 'Wooden Strings & Worn Pages'],
    tracks: 12,
    note: 'Bekhayali hit different today. The acoustic folk album was a beautiful discovery.',
  },
  {
    id: 6,
    date: 'Oct 8',
    mood: '💜 Dreamy',
    albums: ['Chai & Cassette Decks', 'Letters We Never Sent'],
    tracks: 16,
    note: 'Lo-fi and indie all day. Perfect Sunday listening with chai and rain.',
  },
]

export default function DiaryPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Listening Diary</h1>
        <p className="page-subtitle">Your musical journey, day by day</p>
      </div>

      <div className="diary-timeline">
        {diaryEntries.map((entry) => (
          <div key={entry.id} className="diary-entry">
            <div className="diary-date-col">
              <span className="diary-date">{entry.date}</span>
              <span className="diary-mood">{entry.mood}</span>
            </div>
            <div className="diary-content">
              <div className="diary-albums">
                {entry.albums.map((a, i) => (
                  <span key={i} className="diary-album-tag">{a}</span>
                ))}
                <span className="diary-track-count">{entry.tracks} tracks</span>
              </div>
              <p className="diary-note">{entry.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
