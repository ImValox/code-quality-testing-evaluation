import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginUser } from '../services/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      onLogin();
      navigate('/products');
    } catch (err) {
      setError(err.error || 'An error occurred');
    }
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        margin: '0 auto',
        maxWidth: '400px',
        padding: '20px'
      }}
    >
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h2>
      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            color: 'red',
            marginBottom: '10px',
            padding: '10px'
          }}
        >
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <input
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="text"
          value={username}
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="password"
          value={password}
        />
        <button
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            padding: '10px'
          }}
          type="submit"
        >
          Login
        </button>
      </form>
      <p
        style={{
          marginTop: '20px',
          textAlign: 'center'
        }}
      >
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
