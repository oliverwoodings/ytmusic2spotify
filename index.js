const SpotifyWebApi = require('spotify-web-api-node')

const rawAlbums = require('./albums.json')
const rawArtists = require('./artists.json')
const rawSongs = require('./songs.json')

const spotify = new SpotifyWebApi({
  clientId: '8e8e78d649254c848594a5dcdc8f2df2',
  clientSecret: 'nope',
  redirectUri: 'http://localhost:1234/callback'
})

// generateAuthUrl()
setAccessToken()

syncSongs()

async function syncArtists () {
  const artistsToAdd = []
  const notFound = []
  for (const { artist } of rawArtists) {
    const { body } = await spotify.searchArtists(artist)
    const matched = body.artists.items.find(i => i.name === artist)
    if (matched) {
      artistsToAdd.push(matched.id)
    } else {
      notFound.push(artist)
    }
  }

  for (let i = 0; i < artistsToAdd.length; i += 50) {
    const batch = artistsToAdd.slice(i, i + 50).filter(Boolean)
    const { body } = await spotify.followArtists(batch)
    console.log(body)
  }
  console.log(notFound)
}

async function syncAlbums () {
  const albumsToAdd = []
  const notFound = []

  for (const rawAlbum of rawAlbums) {
    const { body } = await spotify.searchAlbums(`album:${rawAlbum.title} artist:${rawAlbum.artists[0].name}`)
    const album = body.albums.items[0]
    if (album) {
      albumsToAdd.push(album.id)
    } else {
      notFound.push(rawAlbum)
    }
  }

  for (let i = 0; i < albumsToAdd.length; i += 50) {
    const batch = albumsToAdd.slice(i, i + 50).filter(Boolean)
    const { body } = await spotify.addToMySavedAlbums(batch)
    console.log(body)
  }
  console.log(notFound)
}

async function syncSongs () {
  const albumIds = rawAlbums.map(a => a.browseId)
  const tracksToAdd = []
  const notFound = []

  for (const rawSong of rawSongs) {
    const { body } = await spotify.searchTracks(`artist:${rawSong.artists[0].name} track:${rawSong.title} album:${rawSong.album.name}`)
    const track = body.tracks.items[0]
    if (track) {
      console.log('Found:', track.id, track.name)
      tracksToAdd.push(track.id)
    } else {
      console.log('Not found:', rawSong.title)
      notFound.push(rawSong)
    }
  }
  for (let i = 0; i < tracksToAdd.length; i += 50) {
    const batch = tracksToAdd.slice(i, i + 50).filter(Boolean)
    const { body } = await spotify.addToMySavedTracks(batch)
    console.log(body)
  }
  console.log(notFound)
}

function setAccessToken () {
  spotify.setAccessToken('nope')
}

function generateAuthUrl () {
  console.log(spotify.createAuthorizeURL(
    ['user-follow-modify', 'user-follow-read', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private', 'user-read-email', 'user-read-private', 'user-library-modify', 'user-library-read'],
    'foo',
    true,
    'token'
  ))
}
