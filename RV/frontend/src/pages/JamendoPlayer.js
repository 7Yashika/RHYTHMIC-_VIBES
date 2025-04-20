import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-h5-audio-player';
import { ToastContainer, toast } from 'react-toastify';

import 'react-h5-audio-player/lib/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import './JamendoPlayer.css'; // Custom styles

const JamendoPlayer = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentTrackRef = useRef(null);

  const client_id = 'bca2f8fa';

  const searchTracks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
        params: {
          client_id,
          format: 'json',
          limit: 10,
          search: searchQuery,
          audioformat: 'mp32',
        },
      });
      setTracks(response.data.results);
      setCurrentTrackIndex(0);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (index) => setCurrentTrackIndex(index);

  const handlePrevious = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1));
  };

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0));
    }
  };

  const addToPlaylist = (track) => {
    if (!playlist.find((t) => t.id === track.id)) {
      setPlaylist([...playlist, track]);
      toast.success(`${track.name} added to playlist!`);
    }
  };

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (currentTrackRef.current) {
      currentTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTrackIndex]);

  return (
    <div className={isDarkMode ? 'container dark' : 'container'}>
      <div className="header">
        <h2>🎵 Rhythmic Vibes</h2>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for songs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchTracks}>Search</button>
      </div>

      <div className="content">
        <div className="track-list">
          {loading ? (
            <p>Loading tracks...</p>
          ) : (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className={`track-item ${index === currentTrackIndex ? 'active' : ''}`}
                ref={index === currentTrackIndex ? currentTrackRef : null}
              >
                <img src={track.album_image || track.image} alt="cover" />
                <div>
                  <strong>{track.name}</strong><br />
                  <small>{track.artist_name}</small><br />
                  <small>
                    {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                  </small>
                </div>
                <button onClick={() => handlePlay(index)}>Play</button>
                <button onClick={() => addToPlaylist(track)}>➕</button>
              </div>
            ))
          )}
        </div>

        <div className="playlist-section">
          <h4>🎧 My Playlist</h4>
          <ul>
            {playlist.map((track) => (
              <li
                key={track.id}
                onClick={() => {
                  const indexInTracks = tracks.findIndex((t) => t.id === track.id);
                  if (indexInTracks !== -1) setCurrentTrackIndex(indexInTracks);
                }}
              >
                {track.name} - {track.artist_name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {currentTrack && (
        <div className="audio-player">
          <h3>
            Now Playing: {currentTrack.name} - {currentTrack.artist_name}
          </h3>
          <AudioPlayer
            src={currentTrack.audio}
            autoPlay
            showJumpControls
            loop={isLoop}
            onEnded={handleNext}
          />
          <div className="controls">
            <button onClick={handlePrevious}>⏮ Prev</button>
            <button onClick={handleNext}>⏭ Next</button>
            <button onClick={() => setIsShuffle(!isShuffle)}>
              {isShuffle ? '🔀 Shuffle On' : 'Shuffle Off'}
            </button>
            <button onClick={() => setIsLoop(!isLoop)}>
              {isLoop ? '🔁 Loop On' : 'Loop Off'}
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default JamendoPlayer;
