import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      {/* Avatar Top Right */}
      {token && (
        <div style={styles.avatarContainer}>
          <img
            src="https://yt3.googleusercontent.com/OXbxyxi7XaDta1HS8rAUWzgLcegQxXf4clltpIUE3qCzuO3LxFhRqqatphRP788cVqYiRWWKPXQ=s900-c-k-c0x00ffffff-no-rj"
            alt="avatar"
            style={styles.avatarImage}
          />
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      )}

      <div style={styles.content}>
        <h1 style={styles.title}>🎶 Rhythmic Vibes</h1>
        <h2 style={styles.tagline}>Feel the Beat. Curate Your Vibe.</h2>

        {token && <h3 style={styles.welcome}>Welcome, {username}!</h3>}

        <p style={styles.description}>
          Create, manage, and explore music playlists tailored to your mood.
        </p>

        <nav style={styles.nav}>
          {token ? (
            <>
              
              <Link to="/create-playlist" style={styles.link}>Playlist</Link>
              <Link to="/jamendo" style={styles.link}>Discover Music</Link>
            </>
          ) : (
            <>
              <Link to="/register" style={styles.link}> Register</Link>
              <Link to="/login" style={styles.link}> Login</Link>
            </>
          )}
        </nav>

        <footer style={styles.footer}>
          <p>&copy; 2025 Rhythmic Vibes. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2000&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(15, 15, 15, 0.75)",
    zIndex: 0,
  },
  avatarContainer: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    zIndex: 2,
  },
  avatarImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
  },
  logoutButton: {
    padding: "0.4rem 0.8rem",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  content: {
    position: "relative",
    zIndex: 1,
    width: "85%",
    color: "#fff",
    textAlign: "center",
    background: "transparent",
    padding: "2rem",
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "4rem",
    color: "#ff5c5c",
    marginBottom: "0.5rem",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
  },
  tagline: {
    fontSize: "1.8rem",
    color: "#f8f8f8",
    marginBottom: "1rem",
    textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
  },
  welcome: {
    fontSize: "1.5rem",
    color: "#10b981",
    marginBottom: "1.5rem",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  },
  description: {
    fontSize: "1.3rem",
    color: "#e5e7eb",
    marginBottom: "3rem",
    maxWidth: "800px",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1.5rem",
    marginBottom: "3rem",
    width: "100%",
  },
  link: {
    backgroundColor: "#ff5c5c",
    color: "#fff",
    padding: "1rem 2rem",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    fontSize: "1.1rem",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  footer: {
    marginTop: "auto",
    fontSize: "1rem",
    color: "#9ca3af",
    width: "100%",
    padding: "1rem 0",
  },
};

export default Home;