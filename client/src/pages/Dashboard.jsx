import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [driverForm, setDriverForm] = useState({ vehicleType: 'Sedan', vehicleNumber: '', availability: 'available' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        if (res.data.role === 'driver') {
            setDriverForm({
                vehicleType: res.data.vehicleType || 'Sedan',
                vehicleNumber: res.data.vehicleNumber || '',
                availability: res.data.availability || 'available'
            });
        }
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/driver/update', driverForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      alert('Failed to update details');
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete('http://localhost:5000/api/users/driver/image', {
        headers: { Authorization: `Bearer ${token}` },
        data: { imageUrl }
      });
      setProfile(res.data);
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }
    setUploading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.put('http://localhost:5000/api/users/driver/update', formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setProfile(res.data);
    } catch (err) {
        alert('Failed to upload images');
    } finally {
        setUploading(false);
    }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <main className="section" style={{ minHeight: '80vh', padding: '60px 0' }}>
      <div className="container">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}
        >
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Welcome, {profile?.name}</h1>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </motion.div>

        <div className="grid two-col cards">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="card" style={{ padding: '30px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Your Information</h3>
                {profile?.role === 'driver' && !editMode && (
                    <button onClick={() => setEditMode(true)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Edit Details</button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#64748b' }}>Email</strong>
                <span>{profile?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#64748b' }}>Phone</strong>
                <span>{profile?.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#64748b' }}>Role</strong>
                <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--primary-700)' }}>{profile?.role}</span>
              </div>
              
              {profile?.role === 'driver' && (
                <>
                  {!editMode ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b' }}>Vehicle Type</strong>
                            <span>{profile?.vehicleType || 'Not specified'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b' }}>Vehicle Limit</strong>
                            <span>{profile?.vehicleNumber || 'Not specified'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#64748b' }}>Availability</strong>
                            <span style={{ textTransform: 'capitalize' }}>{profile?.availability}</span>
                        </div>
                      </>
                  ) : (
                      <form onSubmit={handleUpdateDetails} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Vehicle Type</label>
                              <select value={driverForm.vehicleType} onChange={(e) => setDriverForm({...driverForm, vehicleType: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--outline)' }}>
                                  <option value="Mini Car">Mini Car (65 LKR/km)</option>
                                  <option value="AC Mini Car">AC Mini Car (75 LKR/km)</option>
                                  <option value="Sedan">Sedan (85 LKR/km)</option>
                                  <option value="SUV">SUV (250 LKR/km)</option>
                                  <option value="Van">Van (140 LKR/km)</option>
                                  <option value="Mini Bus">Mini Bus (165 LKR/km)</option>
                                  <option value="Large Bus">Large Bus (265 LKR/km)</option>
                              </select>

                              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Vehicle Capacity/Limit</label>
                              <input type="text" value={driverForm.vehicleNumber} onChange={(e) => setDriverForm({...driverForm, vehicleNumber: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--outline)' }} />

                              <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Availability Status</label>
                              <select value={driverForm.availability} onChange={(e) => setDriverForm({...driverForm, availability: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--outline)' }}>
                                  <option value="available">Available</option>
                                  <option value="busy">Busy</option>
                              </select>
                              
                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>Save Changes</button>
                                <button type="button" onClick={() => setEditMode(false)} className="btn btn-outline" style={{ flex: 1, padding: '8px' }}>Cancel</button>
                              </div>
                          </div>
                      </form>
                  )}

                  <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                    <strong style={{ display: 'block', marginBottom: '12px', color: '#1e293b' }}>Manage Vehicle Images</strong>
                    
                    {profile?.vehicleImages && profile.vehicleImages.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '16px' }}>
                            {profile.vehicleImages.map((img, i) => (
                                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                                    <img src={`http://localhost:5000${img}`} alt="Vehicle" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button 
                                        onClick={() => handleDeleteImage(img)}
                                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                                        title="Delete Image"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>Upload New Image</strong>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'block', fontSize: '0.9rem' }} />
                    {uploading && <span style={{ display: 'block', marginTop: '8px', color: 'var(--primary)', fontWeight: '500', fontSize: '0.9rem' }}>Uploading...</span>}
                  </div>
                </>
              )}

              {profile?.role === 'guide' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#64748b' }}>Languages</strong>
                    <span>{profile?.languages}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#64748b' }}>Experience</strong>
                    <span>{profile?.experience} Years</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="card" style={{ padding: '30px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', color: 'white' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>Quick Actions</h3>
            <p style={{ color: '#d1fae5', marginBottom: '30px', fontSize: '1.1rem', lineHeight: 1.6 }}>
              You are now viewing your fully integrated MERN stack dashboard. Your data is fetched securely from MongoDB via Node.js backend.
            </p>
            <button className="btn" onClick={() => navigate('/drivers')} style={{ background: 'white', color: 'var(--primary-700)', padding: '12px 24px', fontWeight: 'bold' }}>
              🚗 Browse Drivers & Vehicles
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
