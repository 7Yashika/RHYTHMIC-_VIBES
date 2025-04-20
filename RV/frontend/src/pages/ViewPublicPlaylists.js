import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewPublicPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/playlists/public");
        setPlaylists(res.data);
      } catch (err) {
        console.error("Error fetching public playlists:", err.message);
      }
    };

    fetchPublicPlaylists();
  }, []);

  return (
    <div>
      <h2>Public Playlists</h2>
      {playlists.length === 0 ? (
        <p>No public playlists available.</p>
      ) : (
        playlists.map((playlist) => (
          <div key={playlist._id} style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
            <h3>{playlist.name}</h3>
            <p><strong>By:</strong> {playlist.user?.username || "Unknown"}</p>
            <p><strong>Description:</strong> {playlist.description || "No description provided"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewPublicPlaylists;
