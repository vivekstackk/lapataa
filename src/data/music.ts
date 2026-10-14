export type Album = {
  id: string
  title: string
  artist: string
  year: string
  genre: string
  rating: string
  image: string
  color?: string
  /** Standout tracks, shown under "On the record" */
  tracks?: string[]
  /** Short Lapata review lines, shown under the discs */
  notes?: { source: string; line: string }[]
}

export type Track = {
  number: string
  title: string
  artist: string
  duration: string
}

export const featuredAlbums: Album[] = [
  {
    id: "1",
    title: "Kabir Singh",
    artist: "Various Artists",
    year: "2019",
    genre: "Bollywood",
    rating: "8.7",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Bekhayali", "Kaise Hua", "Tujhe Kitna Chahne Lage", "Tera Ban Jaunga"],
    notes: [
      { source: "Lapata Selects", line: "A heartbreak on repeat" },
      { source: "Listeners' Diary", line: "Bekhayali at 2 a.m." },
    ],
  },
  {
    id: "2",
    title: "Roja",
    artist: "A. R. Rahman",
    year: "1992",
    genre: "Indian Classical / Film",
    rating: "9.4",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Chinna Chinna Aasai", "Roja Janeman", "Dil Hai Chhota Sa", "Yeh Haseen Vadiyan"],
    notes: [
      { source: "Lapata Selects", line: "The sound of a new India" },
      { source: "Listeners' Diary", line: "Romance, scored in rain" },
    ],
  },
  {
    id: "3",
    title: "Currents",
    artist: "Tame Impala",
    year: "2015",
    genre: "Psychedelic Pop",
    rating: "9.0",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Let It Happen", "The Less I Know the Better", "Eventually", "Yes I'm Changing"],
    notes: [
      { source: "Lapata Selects", line: "Psychedelia, melted slow" },
      { source: "Listeners' Diary", line: "Built for late drives" },
    ],
  },
  {
    id: "4",
    title: "Blonde",
    artist: "Frank Ocean",
    year: "2016",
    genre: "Alternative R&B",
    rating: "9.5",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Nikes", "Ivy", "Pink + White", "Nights"],
    notes: [
      { source: "Lapata Selects", line: "An album like a whisper" },
      { source: "Listeners' Diary", line: "All nerve, no noise" },
    ],
  },
  {
    id: "5",
    title: "The Forever Story",
    artist: "JID",
    year: "2022",
    genre: "Hip-Hop",
    rating: "9.1",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Surround Sound", "Dance Now", "Crack Sandwich", "Kody Blu 31"],
    notes: [
      { source: "Lapata Selects", line: "A memoir in rapid fire" },
      { source: "Listeners' Diary", line: "Every bar lands" },
    ],
  },
  {
    id: "6",
    title: "Melt My Eyez See Your Future",
    artist: "Denzel Curry",
    year: "2022",
    genre: "Hip-Hop",
    rating: "9.0",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Walkin", "Sanjuro", "Zatoichi", "Troubles"],
    notes: [
      { source: "Lapata Selects", line: "Calm, furious, focused" },
      { source: "Listeners' Diary", line: "The quiet kind of loud" },
    ],
  },
  {
    id: "7",
    title: "Midnight Raga Noir",
    artist: "The Bombay Quintet",
    year: "2023",
    genre: "Jazz",
    rating: "9.2",
    image:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Colaba After Rain", "Hornbill & Saxophone", "Marine Drive Solitude", "Todi in 7/8"],
    notes: [
      { source: "Lapata Selects", line: "A sultry fusion of modal jazz and Indian classical" },
      { source: "Listeners' Diary", line: "Walking alone at 2 AM" },
    ],
  },
  {
    id: "8",
    title: "Pulse of Neon Vistas",
    artist: "Kavya & The Grid",
    year: "2024",
    genre: "Electronic",
    rating: "8.9",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Synthetic Dawn", "Subterranean Orbit", "Velvet Frequency", "Echo Chamber 9"],
    notes: [
      { source: "Lapata Selects", line: "Modular synth layering at its finest" },
      { source: "Listeners' Diary", line: "Deep basslines through the chest" },
    ],
  },
  {
    id: "9",
    title: "Letters We Never Sent",
    artist: "Faraway Pines",
    year: "2022",
    genre: "Indie",
    rating: "9.1",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Rusty Keyholes", "Dusk on Old Highway", "Overcast Horizons", "Ghost in the Attic"],
    notes: [
      { source: "Lapata Selects", line: "Warm tape distortion, bittersweet lyrics" },
      { source: "Listeners' Diary", line: "Monsoon evenings in Shillong" },
    ],
  },
  {
    id: "10",
    title: "Mist Over Whispering Pines",
    artist: "Aranya Soundscapes",
    year: "2024",
    genre: "Ambient",
    rating: "9.3",
    image:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Canopy Stillness", "Valley of Drift", "Rain on Cedar Bark", "First Frost At Dawn"],
    notes: [
      { source: "Lapata Selects", line: "A meditative sanctuary in sound" },
      { source: "Listeners' Diary", line: "My go-to for deep focus" },
    ],
  },
  {
    id: "11",
    title: "Chai & Cassette Decks",
    artist: "Breezehead",
    year: "2023",
    genre: "Lo-fi",
    rating: "8.8",
    image:
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Warm Kettle Steam", "Balcony Pigeons", "Sunday Nap", "Tapes in the Glovebox"],
    notes: [
      { source: "Lapata Selects", line: "Crunchy vinyl crackle, pure nostalgia" },
      { source: "Listeners' Diary", line: "Instant stress reliever" },
    ],
  },
  {
    id: "12",
    title: "Wooden Strings & Worn Pages",
    artist: "Ishan & The Drifters",
    year: "2021",
    genre: "Acoustic",
    rating: "9.0",
    image:
      "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Himalayan Breeze", "Footsteps in Deodar", "Cottage Fireplace", "Old Mountain Bus"],
    notes: [
      { source: "Lapata Selects", line: "Honest, unpolished storytelling" },
      { source: "Listeners' Diary", line: "Breathtaking fingerpicking" },
    ],
  },
  {
    id: "13",
    title: "Ruhaaniyat",
    artist: "Ustad Amjad Nizami Brothers",
    year: "2023",
    genre: "Sufi",
    rating: "9.6",
    image:
      "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Dam Hama Dam", "Chashm-e-Mastana", "Rang Barse Noor", "Man Kunto Maula"],
    notes: [
      { source: "Lapata Selects", line: "Transcendent vocal improvisations" },
      { source: "Listeners' Diary", line: "Not music — a spiritual cleanse" },
    ],
  },
  {
    id: "14",
    title: "Echoes of Darbari",
    artist: "Pandit Alok Sharma",
    year: "2022",
    genre: "Classical",
    rating: "9.4",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Alaap: Raag Darbari Kanada", "Jor & Jhala in Vilambit", "Gat in Teental", "Drut Finale"],
    notes: [
      { source: "Lapata Selects", line: "Masterclass in Raag Darbari" },
      { source: "Listeners' Diary", line: "Absolute mastery of the instrument" },
    ],
  },
  {
    id: "15",
    title: "Noches de Luna Llena",
    artist: "Mateo Cordero",
    year: "2024",
    genre: "Latin",
    rating: "8.9",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Brisa de Sevilla", "Corazón Gitano", "Café en la Playa", "Viento Caliente"],
    notes: [
      { source: "Lapata Selects", line: "Spanish guitar like warm ocean waves" },
      { source: "Listeners' Diary", line: "Impossible to sit still" },
    ],
  },
  {
    id: "16",
    title: "Midnight Aurora",
    artist: "LUMINA",
    year: "2024",
    genre: "K-Pop",
    rating: "9.0",
    image:
      "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?auto=format&fit=crop&w=1000&q=90",
    tracks: ["Prism Galaxy", "Starlight Runner", "Neon Velvet", "After Midnight"],
    notes: [
      { source: "Lapata Selects", line: "Sophisticated dream-pop production" },
      { source: "Listeners' Diary", line: "Synth hooks that stick for days" },
    ],
  },
]

export const popularTracks: Track[] = [
  {
    number: "01",
    title: "Bekhayali",
    artist: "Sachet Tandon",
    duration: "6:11",
  },
  {
    number: "02",
    title: "Kaise Hua",
    artist: "Vishal Mishra",
    duration: "4:15",
  },
  {
    number: "03",
    title: "Tujhe Kitna Chahne Lage",
    artist: "Arijit Singh",
    duration: "4:44",
  },
  {
    number: "04",
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva",
    duration: "3:56",
  },
  {
    number: "05",
    title: "Colaba After Rain",
    artist: "The Bombay Quintet",
    duration: "4:32",
  },
  {
    number: "06",
    title: "Synthetic Dawn",
    artist: "Kavya & The Grid",
    duration: "4:15",
  },
  {
    number: "07",
    title: "Rusty Keyholes",
    artist: "Faraway Pines",
    duration: "3:24",
  },
  {
    number: "08",
    title: "Dam Hama Dam",
    artist: "Ustad Amjad Nizami Brothers",
    duration: "8:42",
  },
  {
    number: "09",
    title: "Brisa de Sevilla",
    artist: "Mateo Cordero",
    duration: "3:40",
  },
  {
    number: "10",
    title: "Prism Galaxy",
    artist: "LUMINA",
    duration: "3:18",
  },
]

export const genres = [
  "Bollywood",
  "Indie",
  "Pop",
  "Rock",
  "Hip-Hop",
  "Classical",
  "Jazz",
  "Electronic",
  "Sufi",
  "Lo-fi",
  "Ambient",
  "Latin",
  "K-Pop",
  "Acoustic",
]

export const communityStats = {
  listeners: "24.8K",
  logs: "182K",
  albums: "31.4K",
}