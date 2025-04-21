// Playlist.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Playlist.css';
import { debounce } from 'lodash';

const API_URL = 'http://localhost:5000/api/playlists'; // Adjust this if needed

const Playlist = ({ playlistId, userToken }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: true });
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songIdToAdd, setSongIdToAdd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${userToken || localStorage.getItem('token')}`,
    },
  };

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, authHeaders);
      setPlaylists(res.data.data);
    } catch (err) {
      setError('Could not fetch playlists.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePlaylist = async () => {
    try {
      const res = await axios.get(`${API_URL}/${playlistId}`, authHeaders);
      setSelectedPlaylist(res.data.data);
    } catch (err) {
      setError('Could not fetch playlist.');
    }
  };

  const createPlaylist = async () => {
    try {
      await axios.post(API_URL, newPlaylist, authHeaders);
      setNewPlaylist({ name: '', description: '', isPublic: true });
      fetchPlaylists();
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  const updatePlaylist = async () => {
    if (!selectedPlaylist) return;
    try {
      await axios.put(`${API_URL}/${selectedPlaylist._id}`, selectedPlaylist, authHeaders);
      fetchPlaylists();
    } catch (err) {
      console.error('Error updating playlist:', err);
    }
  };

  const deletePlaylist = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedPlaylist._id}`, authHeaders);
      alert('Playlist deleted!');
      setSelectedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      setError('Failed to delete playlist.');
    }
  };

  const addSongToPlaylist = async () => {
    try {
      await axios.post(`${API_URL}/${selectedPlaylist._id}/add`, { songId: songIdToAdd }, authHeaders);
      selectPlaylist(selectedPlaylist._id);
      setSongIdToAdd('');
    } catch (err) {
      console.error('Error adding song:', err);
    }
  };

  const removeSongFromPlaylist = async (nodeId) => {
    try {
      await axios.delete(`${API_URL}/${selectedPlaylist._id}/remove/${nodeId}`, authHeaders);
      selectPlaylist(selectedPlaylist._id);
    } catch (err) {
      console.error('Error removing song:', err);
    }
  };

  const debouncedSearch = debounce(async (query) => {
    try {
      const res = await axios.get(`https://api.jamendo.com/v3.0/tracks`, {
        params: {
          client_id: 'bca2f8fa',
          format: 'json',
          limit: 5,
          namesearch: query,
        },
      });
      setSearchResults(res.data.results);
    } catch (err) {
      console.error('Jamendo search failed', err);
    }
  }, 1000);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const addSearchedSongToPlaylist = async (song) => {
    try {
      const saveRes = await axios.post(
        'http://localhost:5000/api/songs/saveOrGetId',
        {
          title: song.name,
          artist: song.artist_name,
          audioUrl: song.audio,
          coverUrl: song.album_image,
        },
        authHeaders
      );
      const songId = saveRes.data.songId;
      await axios.post(`${API_URL}/${selectedPlaylist._id}/add`, { songId }, authHeaders);
      selectPlaylist(selectedPlaylist._id);
    } catch (err) {
      console.error('Error adding searched song:', err);
    }
  };

  const selectPlaylist = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`, authHeaders);
      setSelectedPlaylist(res.data.data);
    } catch (err) {
      console.error('Error fetching playlist:', err);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchSinglePlaylist();
    } else {
      fetchPlaylists();
    }
  }, [playlistId]);

  if (playlistId && !selectedPlaylist) return <p>{error || 'Loading playlist...'}</p>;

  return (
    <div className="playlist-container">
      <div className="playlist-overlay"></div>
      <div className="playlist-content">
        <h2 className="page-title">{playlistId ? selectedPlaylist?.name : 'Your Playlists'}</h2>

        {loading && <p>Loading playlists...</p>}

        {!playlistId && (
          <>
            {/* Create Playlist Section */}
            <div className="form-section">
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                className="form-input"
              />
              <button onClick={createPlaylist} className="playlist-button">
                Create
              </button>
            </div>

            {/* Playlist List */}
            <div className="main-content">
              <div className="playlists-container">
                <ul className="playlist-list">
                  {playlists.length ? (
                    playlists.map((pl) => (
                      <li key={pl._id} className="playlist-item">
                        <button onClick={() => selectPlaylist(pl._id)} className="playlist-button">
                          {pl.name}
                        </button>
                      </li>
                    ))
                  ) : (
                    <p>No playlists available</p>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Playlist Detail Section */}
        {selectedPlaylist && (
          <div className="details-container">
            {!playlistId && <h3>Edit Playlist: {selectedPlaylist.name}</h3>}
            <input
              type="text"
              value={selectedPlaylist.name}
              onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, name: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              value={selectedPlaylist.description}
              onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, description: e.target.value })}
              className="form-input"
            />
            <button onClick={updatePlaylist} className="playlist-button">Update</button>
            

            <div>
              <input
                type="text"
                placeholder="Enter Song ID"
                value={songIdToAdd}
                onChange={(e) => setSongIdToAdd(e.target.value)}
                className="form-input"
              />
              <button onClick={addSongToPlaylist} className="playlist-button">Add Song</button>
            </div>

            <h4>Songs in this Playlist:</h4>
<ul className="song-list">
  {selectedPlaylist.songs.map((songNode) => (
    <li key={songNode._id} className="song-item">
      {songNode.songId ? (
        <>
          <p><strong>Title:</strong> {songNode.songId.title}</p>
          <p><strong>Artist:</strong> {songNode.songId.artist}</p>
          {songNode.songId.coverUrl && (
            <img src={songNode.songId.coverUrl} alt="Cover" width="20" />
          )}
          {songNode.songId.audioUrl && (
            <audio controls src={songNode.songId.audioUrl} />
          )}
        </>
      ) : (
        <p>Song added</p>
      )}
    </li>
  ))}
</ul>


            {/* Song Search Section */}
            <div className="search-section">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for songs"
                className="form-input"
              />
              <div>
                {searchResults.map((song) => (
                  <div key={song.id}>
                    <p>{song.name} by {song.artist_name}</p>
                    <button onClick={() => addSearchedSongToPlaylist(song)} className="playlist-button">
                      Add Song
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Playlist;
