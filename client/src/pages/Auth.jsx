import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [role, setRole] = useState('user');
  const [mode, setMode] = useState('login'); // login | register
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    vehicleType: '', vehicleNumber: '', availability: 'available',
    languages: '', experience: ''
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (mode === 'register') {
        await axios.post('http://localhost:5000/api/auth/register', { ...formData, role });
        alert('Registration successful! Please login.');
        setMode('login');
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <main className="auth" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="auth-card" 
          style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
        >
          <div className="tabs" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '24px' }}>
            {['user', 'driver', 'guide'].map(r => (
              <button 
                key={r}
                className={`tab ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: role === r ? 'white' : 'transparent', cursor: 'pointer', fontWeight: role === r ? '600' : '400', boxShadow: role === r ? '0 4px 6px rgba(0,0,0,0.05)' : 'none', color: role === r ? '#0f172a' : '#64748b' }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="toggle" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                className={`toggle-btn ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0', background: mode === m ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' : 'transparent', color: mode === m ? 'white' : '#0f172a', fontWeight: '600' }}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div style={{ color: '#ef4444', padding: '10px', background: '#fef2f2', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}
            
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="form-section">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-section">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>

            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="form-section">
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" placeholder="+1 234 567 8900" value={formData.phone} onChange={handleChange} required />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-section">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required />
            </div>

            <AnimatePresence>
              {mode === 'register' && role === 'driver' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-section">
                    <label htmlFor="vehicleType">Vehicle Type</label>
                    <input type="text" id="vehicleType" placeholder="SUV, Sedan, etc." value={formData.vehicleType} onChange={handleChange} required />
                  </div>
                  <div className="form-section">
                    <label htmlFor="vehicleNumber">Vehicle Number</label>
                    <input type="text" id="vehicleNumber" placeholder="ABC-1234" value={formData.vehicleNumber} onChange={handleChange} required />
                  </div>
                </motion.div>
              )}
              {mode === 'register' && role === 'guide' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-section">
                    <label htmlFor="languages">Languages Spoken</label>
                    <input type="text" id="languages" placeholder="English, Spanish" value={formData.languages} onChange={handleChange} required />
                  </div>
                  <div className="form-section">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input type="number" id="experience" placeholder="e.g. 5" value={formData.experience} onChange={handleChange} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '14px', fontSize: '1rem' }}>
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
};

export default Auth;
