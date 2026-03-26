import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const getRatePerKm = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('ac mini car')) return 75;
  if (t.includes('mini car')) return 65;
  if (t.includes('sedan')) return 85;
  if (t.includes('suv')) return 250;
  if (t.includes('van')) return 140;
  if (t.includes('large bus')) return 265;
  if (t.includes('mini bus')) return 165;
  return 85;
};

const DriversList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/drivers');
        setDrivers(res.data);
      } catch (err) {
        console.error("Error fetching drivers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>Loading...</div>;

  return (
    <main className="section" style={{ minHeight: '80vh', padding: '60px 0', background: '#f8fafc' }}>
      <div className="container">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-1px', color: '#0f172a', margin: '0 0 12px 0' }}>Available Drivers</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Explore vetted local drivers for your journey. Browse premium vehicles and book instantly for an unforgettable experience.
          </p>
        </motion.div>

        <div className="grid three-col">
          {drivers.map((driver, idx) => (
            <motion.div 
              key={driver._id} 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: idx * 0.1 }}
              className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {/* Image Header */}
              <div style={{ width: '100%', height: '220px', background: '#e2e8f0', position: 'relative' }}>
                {driver.vehicleImages && driver.vehicleImages.length > 0 ? (
                  <img src={`http://localhost:5000${driver.vehicleImages[0]}`} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                    <span style={{ fontSize: '4rem', filter: 'grayscale(1) opacity(0.5)' }}>🚗</span>
                  </div>
                )}
                
                <div style={{ 
                  position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.95)', 
                  padding: '6px 14px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700', 
                  color: driver.availability === 'available' ? 'var(--primary-700)' : '#dc2626', 
                  backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px' 
                }}>
                  {driver.availability === 'available' ? 'Available' : 'Busy'}
                </div>
              </div>

              {/* Content Body */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: 'var(--text)', fontWeight: '700' }}>
                    {driver.vehicleType || 'Standard Vehicle'}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                    Driven by <strong style={{ color: '#0f172a', fontWeight: '600' }}>{driver.name}</strong>
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', flex: 1 }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                    <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '4px' }}>Rate</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary-700)' }}>{getRatePerKm(driver.vehicleType)} LKR/km</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                    <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '4px' }}>Capacity</span>
                    <strong style={{ fontSize: '1rem', color: '#334155' }}>{driver.vehicleNumber || 'Unspecified'}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                    <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '4px' }}>Contact</span>
                    <strong style={{ fontSize: '1rem', color: '#334155' }}>{driver.phone}</strong>
                  </div>
                </div>

                {/* Footer Images if > 1 */}
                {driver.vehicleImages && driver.vehicleImages.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '20px', borderTop: '1px solid var(--outline)', marginBottom: '20px' }}>
                    {driver.vehicleImages.slice(1).map((img, i) => (
                      <img key={i} src={`http://localhost:5000${img}`} alt="Vehicle detail" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--outline)', cursor: 'pointer', transition: 'transform 0.2s' }} />
                    ))}
                  </div>
                )}
                
                <button className="btn btn-primary btn-block" style={{ marginTop: 'auto', padding: '14px', fontSize: '1rem' }} onClick={() => alert('Booking flow coming soon!')}>
                  Request Booking
                </button>
              </div>
            </motion.div>
          ))}
          {drivers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', border: '1px solid var(--outline)' }}>
              <span style={{ fontSize: '3rem', filter: 'grayscale(1) opacity(0.3)' }}>🚗</span>
              <h3 style={{ margin: '20px 0 10px 0', fontSize: '1.5rem', color: '#334155' }}>No Drivers Found</h3>
              <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>Currently there are no vetted drivers available in your area. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DriversList;
