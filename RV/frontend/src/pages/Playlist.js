import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/playlists'; // Adjust if needed

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: true });
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songIdToAdd, setSongIdToAdd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(API_URL, authHeaders);
      setPlaylists(res.data.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
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

  const selectPlaylist = async (playlistId) => {
    try {
      const res = await axios.get(`${API_URL}/${playlistId}`, authHeaders);
      setSelectedPlaylist(res.data.data);
    } catch (err) {
      console.error('Error fetching playlist:', err);
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

  const searchJamendo = async () => {
    try {
      const res = await axios.get(`https://api.jamendo.com/v3.0/tracks`, {
        params: {
          client_id: 'bca2f8fa',
          format: 'json',
          limit: 5,
          namesearch: searchQuery
        }
      });
      setSearchResults(res.data.results);
    } catch (err) {
      console.error('Jamendo search failed', err);
    }
  };

  const addSearchedSongToPlaylist = async (song) => {
    try {
      const saveRes = await axios.post(
        'http://localhost:5000/api/songs/saveOrGetId',
        {
          title: song.name,
          artist: song.artist_name,
          audioUrl: song.audio,
          coverUrl: song.album_image
        },
        authHeaders
      );
      const songId = saveRes.data.songId;

      await axios.post(
        `${API_URL}/${selectedPlaylist._id}/add`,
        { songId },
        authHeaders
      );

      selectPlaylist(selectedPlaylist._id);
    } catch (err) {
      console.error('Error adding searched song:', err);
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

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>

      {/* Create Playlist */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Playlist Name"
          value={newPlaylist.name}
          onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={newPlaylist.description}
          onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <button onClick={createPlaylist} className="bg-blue-500 text-white px-4 py-2 rounded">
          Create
        </button>
      </div>

      {/* Playlist List */}
      <ul className="mb-4">
  {playlists.map((pl) => (
    <li key={pl._id} className="mb-2">
      <button
        onClick={() => {
          if (selectedPlaylist && selectedPlaylist._id === pl._id) {
            setSelectedPlaylist(null); // toggle off
          } else {
            selectPlaylist(pl._id); // fetch and show
          }
        }}
        className="text-blue-700 underline"
      >
        {pl.name}
      </button>

      {/* Show songs if this playlist is selected */}
      {selectedPlaylist && selectedPlaylist._id === pl._id && (
        <div className="ml-4 mt-2">
          <h4 className="text-md font-semibold">Songs:</h4>
          {selectedPlaylist.songs && selectedPlaylist.songs.length > 0 ? (
            selectedPlaylist.songs.map((songNode) => (
              <div key={songNode._id} className="flex justify-between items-center mb-2 border p-2 rounded">
                <div>
                  <p className="font-medium">{songNode.song?.title}</p>
                  <p className="text-sm text-gray-500">{songNode.song?.artist}</p>
                </div>
                <button
                  onClick={() => removeSongFromPlaylist(songNode._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No songs yet.</p>
          )}
        </div>
      )}
    </li>
  ))}
</ul>


      {/* Playlist Detail */}
      {selectedPlaylist && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Edit Playlist: {selectedPlaylist.name}</h3>
          <input
            type="text"
            value={selectedPlaylist.name}
            onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, name: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            value={selectedPlaylist.description}
            onChange={(e) => setSelectedPlaylist({ ...selectedPlaylist, description: e.target.value })}
            className="border p-2 mr-2"
          />
          <button onClick={updatePlaylist} className="bg-green-500 text-white px-4 py-2 rounded">
            Update
          </button>

          {/* Add Song Manually */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter Song ID"
              value={songIdToAdd}
              onChange={(e) => setSongIdToAdd(e.target.value)}
              className="border p-2 mr-2"
            />
            <button onClick={addSongToPlaylist} className="bg-purple-500 text-white px-4 py-2 rounded">
              Add Song
            </button>
          </div>

          {/* Jamendo Search */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Search Songs (Jamendo)</h4>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song name..."
              className="border p-2 mr-2"
            />
            <button onClick={searchJamendo} className="bg-blue-600 text-white px-4 py-2 rounded">
              Search
            </button>

            <div className="mt-4">
              {searchResults.map((song) => (
                <div key={song.id} className="flex justify-between items-center mb-2 p-2 border rounded">
                  <div>
                    <p className="font-semibold">{song.name}</p>
                    <p className="text-sm text-gray-600">{song.artist_name}</p>
                  </div>
                  <button
                    onClick={() => addSearchedSongToPlaylist(song)}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          
        </div>
      )}
    </div>
  );
};

export default Playlist;
