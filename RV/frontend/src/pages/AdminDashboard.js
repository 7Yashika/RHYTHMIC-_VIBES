import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [createForm, setCreateForm] = useState({ username: '', email: '', password: '' });
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin-login');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admins/users', createForm);
      setMessage('User created successfully');
      setCreateForm({ username: '', email: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/admins/users/${userIdToDelete}`);
      setMessage(`User with ID ${userIdToDelete} deleted`);
      setUserIdToDelete('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
        </div>

        {message && <p className="text-center text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleCreateUser} className="mb-6">
          <h2 className="text-lg font-medium mb-2">Create User</h2>
          <div className="grid gap-2 mb-4">
            <input
              type="text"
              placeholder="Username"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create User
          </button>
        </form>

        <form onSubmit={handleDeleteUser}>
          <h2 className="text-lg font-medium mb-2">Delete User</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="User ID"
              value={userIdToDelete}
              onChange={(e) => setUserIdToDelete(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
