// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Home from './pages/Home';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/home" element={<Home />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, AuthContext } from './context/AuthContext';
import JamendoPlayer from "./pages/JamendoPlayer"; 
import CreatePlaylist from "./pages/Playlist";
import ViewPublicPlaylists from "./pages/ViewPublicPlaylists";
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Admin_Home from './pages/AdminHome'
function App() {
  return (
    <AuthProvider>
      
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/jamendo" element={<JamendoPlayer />} /> {/* New route */}
          <Route path="/create-playlist" element={<CreatePlaylist />} />
          <Route path="/public-playlists" element={<ViewPublicPlaylists />} />
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/home" element={<Admin_Home />} />
        </Routes>
        
      </Router>

    </AuthProvider>
  );
}

// Create a PrivateRoute component that redirects if not authenticated
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
