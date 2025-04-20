import React, { useEffect, useState } from "react";
import axios from "axios";

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/playlists/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlaylists(res.data);
      } catch (err) {
        setMessage("Error fetching playlists");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div>
      <h2>My Playlists</h2>
      {loading ? (
        <p>Loading...</p>
      ) : message ? (
        <p>{message}</p>
      ) : playlists.length === 0 ? (
        <p>No playlists created yet.</p>
      ) : (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist._id}>
              <strong>{playlist.name}</strong> <br />
              {playlist.description && <em>{playlist.description}</em>} <br />
              <small>{playlist.isPublic ? "Public" : "Private"}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPlaylists;
