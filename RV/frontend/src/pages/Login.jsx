import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);  // Access login function from context
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { emailOrUsername, password } = formData;

    const { success, message } = await login(emailOrUsername, password);
    if (success) {
      navigate('/home');  // Navigate to home page after successful login
    } else {
      setError(message);  // Show error message on failed login
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Rhythmic Vibes</h2>
        <input
          type="text"
          name="emailOrUsername"
          placeholder="Email or Username"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
        <p>Login as an admin <Link to="/admin-login">Admin Login</Link></p>
      </form>
    </div>
  );
};

export default Login;