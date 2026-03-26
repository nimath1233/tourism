import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const MOCK_PLACES = [
  { id: 1, name: 'Sigiriya Rock Fortress', location: 'Central Province', desc: 'Ancient palace and fortress complex with breathtaking views.', image: 'https://images.unsplash.com/photo-1588598198321-177ee14c1cc3?auto=format&fit=crop&q=80', category: 'Historical' },
  { id: 2, name: 'Ella Nine Arch Bridge', location: 'Uva Province', desc: 'Iconic railway bridge surrounded by lush green tea plantations.', image: 'https://images.unsplash.com/photo-1546708687-3406211831c4?auto=format&fit=crop&q=80', category: 'Nature' },
  { id: 3, name: 'Galle Fort', location: 'Southern Province', desc: 'Historic Dutch fort on the coast with charming streets and cafes.', image: 'https://images.unsplash.com/photo-1590520621376-7bc285810221?auto=format&fit=crop&q=80', category: 'Coastal' },
  { id: 4, name: 'Yala National Park', location: 'Southern Province', desc: 'Wildlife sanctuary famous for its high density of leopards.', image: 'https://images.unsplash.com/photo-1620216659737-56747b01b60d?auto=format&fit=crop&q=80', category: 'Wildlife' },
  { id: 5, name: 'Temple of the Tooth', location: 'Kandy', desc: 'Sacred Buddhist temple located in the royal palace complex.', image: 'https://images.unsplash.com/photo-1625805727632-6a4a159958ac?auto=format&fit=crop&q=80', category: 'Historical' },
  { id: 6, name: 'Mirissa Beach', location: 'Southern Province', desc: 'Stunning tropical beach known for whale watching and surfing.', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80', category: 'Coastal' }
];

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/drivers');
        setDrivers(res.data);
      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };
    if (step === 2 && drivers.length === 0) fetchDrivers();
  }, [step, drivers.length]);

  const togglePlace = (place) => {
    if (selectedPlaces.find(p => p.id === place.id)) {
      setSelectedPlaces(selectedPlaces.filter(p => p.id !== place.id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const filteredPlaces = MOCK_PLACES.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const getPricePerDay = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('van')) return '$60';
    if (t.includes('bus')) return '$120';
    if (t.includes('bike')) return '$15';
    return '$45'; // Default car/suv
  };

  const renderStepIndicators = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
      {[1, 2, 3].map(num => (
        <React.Fragment key={num}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: step >= num ? 'var(--primary)' : '#e2e8f0',
            color: step >= num ? '#fff' : '#64748b',
            fontWeight: 'bold', transition: 'all 0.3s'
          }}>
            {num}
          </div>
          {num !== 3 && <div style={{ height: '2px', width: '50px', background: step > num ? 'var(--primary)' : '#e2e8f0' }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <main className="section" style={{ minHeight: '85vh', padding: '40px 0', background: '#f8fafc' }}>
      <div className="container">
        {renderStepIndicators()}

        <AnimatePresence mode="wait">
          {/* STEP 1: PLACES */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Where do you want to go?</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Select beautifully curated destinations to build your itinerary.</p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                  <Search size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: '#94a3b8' }} />
                  <input 
                    type="text" placeholder="Search destinations..." 
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--outline)', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['All', 'Historical', 'Nature', 'Coastal', 'Wildlife'].map(cat => (
                    <button 
                      key={cat} onClick={() => setCategoryFilter(cat)}
                      style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                               background: categoryFilter === cat ? 'var(--text)' : '#e2e8f0', 
                               color: categoryFilter === cat ? '#fff' : '#475569', fontWeight: '600', transition: 'all 0.2s' }}
                    >{cat}</button>
                  ))}
                </div>
              </div>

              <div className="grid three-col" style={{ marginBottom: '40px' }}>
                {filteredPlaces.map(place => {
                  const isSelected = selectedPlaces.find(p => p.id === place.id);
                  return (
                    <motion.div key={place.id} whileHover={{ y: -5 }} onClick={() => togglePlace(place)}
                      className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline)' }}
                    >
                      <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                        <img src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8))' }} />
                        <h3 style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{place.name}</h3>
                        {isSelected && <CheckCircle2 size={28} style={{ position: 'absolute', top: '16px', right: '16px', color: '#fff', fill: 'var(--primary)' }} />}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>
                          <MapPin size={16} /> {place.location}
                        </div>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>{place.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <button 
                  className="btn btn-primary" onClick={() => setStep(2)} disabled={selectedPlaces.length === 0}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', opacity: selectedPlaces.length === 0 ? 0.5 : 1, width: '100%', maxWidth: '300px' }}
                >
                  Continue ({selectedPlaces.length} selected) <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: VEHICLES */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginBottom: '24px' }}><ChevronLeft size={18}/> Back</button>
              
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Choose your ride</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Select a comfortable vehicle from our vetted local drivers.</p>
              </div>

              <div className="grid two-col" style={{ marginBottom: '40px' }}>
                {drivers.map(driver => {
                  const isSelected = selectedDriver?._id === driver._id;
                  const price = getPricePerDay(driver.vehicleType);
                  return (
                    <motion.div key={driver._id} whileHover={{ y: -5 }} onClick={() => setSelectedDriver(driver)}
                      className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline)' }}
                    >
                      <div style={{ width: '100%', height: '200px', background: '#e2e8f0', position: 'relative' }}>
                        {driver.vehicleImages && driver.vehicleImages.length > 0 ? (
                          <img src={`http://localhost:5000${driver.vehicleImages[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Vehicle" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                        )}
                        <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#fff', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                          {price} <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>/ day</span>
                        </div>
                        {isSelected && <CheckCircle2 size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fill: 'var(--primary)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>{driver.vehicleType || 'Standard Vehicle'}</h3>
                        <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>Driven by <strong style={{color: 'var(--text)'}}>{driver.name}</strong></p>
                        
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>👥 {driver.vehicleNumber || '1-4'} Seats</span>
                          <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>⭐ 4.9 (12 reviews)</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <button 
                  className="btn btn-primary" onClick={() => setStep(3)} disabled={!selectedDriver}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', opacity: !selectedDriver ? 0.5 : 1, width: '100%', maxWidth: '300px' }}
                >
                  Review Booking <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUMMARY */}
          {step === 3 && (
            <motion.div key="step3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ marginBottom: '24px' }}><ChevronLeft size={18}/> Back</button>

              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Review & Confirm</h1>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>You're almost there! Review your trip details below.</p>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                  <h3 style={{ borderBottom: '1px solid var(--outline)', paddingBottom: '16px', margin: '0 0 24px 0', fontSize: '1.3rem' }}>Trip Destinations</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {selectedPlaces.map((place, i) => (
                      <div key={place.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{i + 1}</div>
                        <img src={place.image} alt={place.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '1.1rem' }}>{place.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{place.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ borderBottom: '1px solid var(--outline)', paddingBottom: '16px', margin: '0 0 24px 0', fontSize: '1.3rem' }}>Vehicle & Driver</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--outline)' }}>
                     {selectedDriver?.vehicleImages?.length > 0 ? (
                        <img src={`http://localhost:5000${selectedDriver.vehicleImages[0]}`} style={{ width: '100px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} alt="Vehicle" />
                     ) : (
                        <div style={{ width: '100px', height: '80px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚗</div>
                     )}
                     <div>
                       <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>{selectedDriver?.vehicleType || 'Standard Vehicle'}</strong>
                       <span style={{ display: 'block', color: '#64748b', fontSize: '0.95rem', marginBottom: '4px' }}>Driver: {selectedDriver?.name}</span>
                       <span style={{ color: 'var(--primary-700)', fontWeight: 'bold' }}>{getPricePerDay(selectedDriver?.vehicleType)} / day</span>
                     </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={() => alert('Booking Confirmed! (Mock)')} style={{ padding: '16px 40px', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(22, 163, 74, 0.3)' }}>
                    Confirm & Pay
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default BookingFlow;
