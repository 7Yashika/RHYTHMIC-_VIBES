import React, { useState } from "react";
import axios from "axios";

const CreatePlaylist = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/playlists",
        { name, description, isPublic },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Playlist created successfully!");
      setName("");
      setDescription("");
      setIsPublic(false);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Create Playlist</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            {" "}Make Public
          </label>
        </div>
        <button type="submit" style={{ padding: "10px 20px" }}>
          Create
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreatePlaylist;
