export interface DefaultPlaylist {
  name: string
  category: string
  youtubePlaylistId: string
}

// Replace these placeholders with embeddable playlist IDs you have permission to reference.
export const defaultPlaylists: DefaultPlaylist[] = [
  { name: 'Soft Bollywood Instrumentals', category: 'Instrumental', youtubePlaylistId: 'TODO_PASTE_PLAYLIST_ID' },
  { name: 'Bollywood Lofi', category: 'Lofi', youtubePlaylistId: 'TODO_PASTE_PLAYLIST_ID' },
  { name: 'Indian Classical Focus', category: 'Classical', youtubePlaylistId: 'TODO_PASTE_PLAYLIST_ID' },
  { name: 'Piano, Flute, and Sitar', category: 'Instrumental', youtubePlaylistId: 'TODO_PASTE_PLAYLIST_ID' },
]
