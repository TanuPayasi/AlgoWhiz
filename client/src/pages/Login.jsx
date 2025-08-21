import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setCredentials(c => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" value={credentials.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={credentials.password} onChange={handleChange} required />
          <button type="submit" disabled={loading} className="btn">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p style={{ marginTop: 12 }}>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}

export default Login;