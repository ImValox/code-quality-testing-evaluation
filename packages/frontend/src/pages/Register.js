import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Register</h2>
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
          name="firstname"
          onChange={handleChange}
          placeholder="First Name"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="text"
          value={formData.firstname}
        />
        <input
          name="lastname"
          onChange={handleChange}
          placeholder="Last Name"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="text"
          value={formData.lastname}
        />
        <input
          name="username"
          onChange={handleChange}
          placeholder="Username"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="text"
          value={formData.username}
        />
        <input
          name="password"
          onChange={handleChange}
          placeholder="Password"
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px'
          }}
          type="password"
          value={formData.password}
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
          Register
        </button>
      </form>
      <p
        style={{
          marginTop: '20px',
          textAlign: 'center'
        }}
      >
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
