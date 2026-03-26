import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Navigation, RefreshCw, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MOCK_PLACES = [
  { id: 1, name: 'Sigiriya Rock Fortress', location: 'Central Province', desc: 'Ancient palace and fortress complex with breathtaking views.', image: 'https://images.unsplash.com/photo-1588598198321-177ee14c1cc3?auto=format&fit=crop&q=80', category: 'Historical', coordinates: { lat: 7.9570, lng: 80.7603 } },
  { id: 2, name: 'Ella Nine Arch Bridge', location: 'Uva Province', desc: 'Iconic railway bridge surrounded by lush green tea plantations.', image: 'https://images.unsplash.com/photo-1546708687-3406211831c4?auto=format&fit=crop&q=80', category: 'Nature', coordinates: { lat: 6.8767, lng: 81.0608 } },
  { id: 3, name: 'Galle Fort', location: 'Southern Province', desc: 'Historic Dutch fort on the coast with charming streets and cafes.', image: 'https://images.unsplash.com/photo-1590520621376-7bc285810221?auto=format&fit=crop&q=80', category: 'Coastal', coordinates: { lat: 6.0258, lng: 80.2176 } },
  { id: 4, name: 'Yala National Park', location: 'Southern Province', desc: 'Wildlife sanctuary famous for its high density of leopards.', image: 'https://images.unsplash.com/photo-1620216659737-56747b01b60d?auto=format&fit=crop&q=80', category: 'Wildlife', coordinates: { lat: 6.3683, lng: 81.5190 } },
  { id: 5, name: 'Temple of the Tooth', location: 'Kandy', desc: 'Sacred Buddhist temple located in the royal palace complex.', image: 'https://images.unsplash.com/photo-1625805727632-6a4a159958ac?auto=format&fit=crop&q=80', category: 'Historical', coordinates: { lat: 7.2936, lng: 80.6413 } },
  { id: 6, name: 'Mirissa Beach', location: 'Southern Province', desc: 'Stunning tropical beach known for whale watching and surfing.', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80', category: 'Coastal', coordinates: { lat: 5.9483, lng: 80.4716 } }
];

// Routing Machine Component wrapper
const RoutingMachine = ({ start, end, onDistanceChange }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: 'var(--primary)', weight: 5, opacity: 0.8 }] },
      createMarker: function() { return null; }
    }).on('routesfound', function(e) {
      if (e.routes && e.routes[0]) {
        const distanceKm = (e.routes[0].summary.totalDistance / 1000).toFixed(1);
        onDistanceChange(distanceKm);
      }
    }).addTo(map);

    return () => {
      try { if (map && routingControl) map.removeControl(routingControl); } catch (err) { console.error(err); }
    };
  }, [map, start, end, onDistanceChange]);
  return null;
};

// Component to handle map clicks for setting points
const MapClickHandler = ({ start, setStart, end, setEnd }) => {
  useMapEvents({
    click(e) {
      if (!start) setStart(e.latlng);
      else if (!end) setEnd(e.latlng);
    }
  });
  return null;
};

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Map States
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [distance, setDistance] = useState(0);
  
  // Search States
  const [searchStart, setSearchStart] = useState('');
  const [searchEnd, setSearchEnd] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Driver States
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/drivers');
        setDrivers(res.data);
      } catch (err) {
        console.error("Error fetching drivers:", err);
      }
    };
    if (step === 3 && drivers.length === 0) fetchDrivers();
  }, [step, drivers.length]);

  const togglePlace = (place) => {
    setSelectedPlace(selectedPlace?.id === place.id ? null : place);
  };

  const proceedWithCuratedLocation = () => {
    if (selectedPlace && selectedPlace.coordinates) {
      setEnd(selectedPlace.coordinates);
      setSearchEnd(selectedPlace.name);
    }
    setStep(2);
  };
  
  const proceedWithCustomLocation = () => {
    setSelectedPlace({ id: 'custom', name: 'Custom Mapped Route' });
    setEnd(null);
    setSearchEnd('');
    setStep(2);
  };

  const filteredPlaces = MOCK_PLACES.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Calculate pricing based on exact road distance and vehicle type
  const getRatePerKm = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('ac mini car')) return 75;
    if (t.includes('mini car')) return 65;
    if (t.includes('sedan')) return 85;
    if (t.includes('suv')) return 250;
    if (t.includes('van')) return 140;
    if (t.includes('large bus')) return 265;
    if (t.includes('mini bus')) return 165;
    return 85; // Default fallback (Sedan)
  };

  const calculateTripPrice = (driver) => {
    if (!distance) return 0;
    const baseFare = 200;
    const rate = getRatePerKm(driver.vehicleType);
    return Math.round(baseFare + (parseFloat(distance) * rate));
  };

  const handleSearch = async (query, type) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (res.data && res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const newPoint = { lat: parseFloat(lat), lng: parseFloat(lon) };
        if (type === 'start') setStart(newPoint);
        else setEnd(newPoint);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (err) {
      console.error(err);
      alert('Error searching location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapReset = () => {
    setStart(null);
    setEnd(null);
    setDistance(0);
    setSearchStart('');
    setSearchEnd('');
  };

  const renderStepIndicators = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
      {[1, 2, 3, 4].map(num => (
        <React.Fragment key={num}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: step >= num ? 'var(--primary)' : '#e2e8f0',
            color: step >= num ? '#fff' : '#64748b',
            fontWeight: 'bold', transition: 'all 0.3s'
          }}>
            {num}
          </div>
          {num !== 4 && <div style={{ height: '2px', width: '50px', background: step > num ? 'var(--primary)' : '#e2e8f0' }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <main className="section" style={{ minHeight: '85vh', padding: '40px 0', background: '#f8fafc' }}>
      <div className="container">
        {renderStepIndicators()}

        <AnimatePresence mode="wait">
          {/* STEP 1: DESTINATIONS */}
          {step === 1 && (
            <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Where do you want to go?</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Select a curated destination below for your drop-off, or create a completely custom mapped route!</p>
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
                {/* MOCK DESTINATIONS */}
                {filteredPlaces.map(place => {
                  const isSelected = selectedPlace?.id === place.id;
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'sticky', bottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <button 
                  className="btn btn-outline" onClick={proceedWithCustomLocation}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', marginRight: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MapIcon size={20} /> Or Create New Custom Location
                </button>

                <button 
                  className="btn btn-primary" onClick={proceedWithCuratedLocation} disabled={!selectedPlace || selectedPlace.id === 'custom'}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', opacity: (!selectedPlace || selectedPlace.id === 'custom') ? 0.5 : 1 }}
                >
                  Continue with {selectedPlace?.name || 'Destination'} <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERACTIVE MAP & ROUTING */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginBottom: '24px' }}><ChevronLeft size={18}/> Back</button>
              
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Map Your Route</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Click the map or search to select your exact Pick-Up and Drop-Off locations to calculate total road distance.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Search Pick-Up City/Hotel..." 
                      value={searchStart} 
                      onChange={(e) => setSearchStart(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchStart, 'start')}
                    />
                    <button onClick={() => handleSearch(searchStart, 'start')} disabled={isSearching} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                      <Search size={18} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Search Drop-Off City/Hotel..." 
                      value={searchEnd} 
                      onChange={(e) => setSearchEnd(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--outline)' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchEnd, 'end')}
                    />
                    <button onClick={() => handleSearch(searchEnd, 'end')} disabled={isSearching} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                      <Search size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="card" style={{ padding: '16px', background: start ? '#eff6ff' : '#fff' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>1. PICK-UP POINT</span>
                    <div style={{ fontWeight: 'bold', color: start ? '#0f172a' : '#94a3b8', marginTop: '4px' }}>
                      {start ? `Set (${start.lat.toFixed(3)}, ${start.lng.toFixed(3)})` : 'Click Map to set'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '16px', background: end ? '#fce7f3' : '#fff' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>2. DROP-OFF POINT</span>
                    <div style={{ fontWeight: 'bold', color: end ? '#0f172a' : '#94a3b8', marginTop: '4px' }}>
                      {end ? (searchEnd || `Set (${end.lat.toFixed(3)}, ${end.lng.toFixed(3)})`) : 'Click Map to set'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: distance ? '#f0fdf4' : '#fff' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>REAL DISTANCE</span>
                      <div style={{ fontWeight: 'bold', color: distance ? 'var(--primary-700)' : '#94a3b8', marginTop: '4px', fontSize: '1.2rem' }}>
                        {distance ? `${distance} km` : 'Pending'}
                      </div>
                    </div>
                    {(start || end) && (
                      <button onClick={handleMapReset} className="btn btn-outline" style={{ padding: '8px 12px' }}>
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="card" style={{ padding: '0', overflow: 'hidden', height: '500px', border: '1px solid var(--outline)', borderRadius: '16px' }}>
                  <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler start={start} setStart={setStart} end={end} setEnd={setEnd} />
                    {start && <Marker position={start}><Popup>Pick-Up</Popup></Marker>}
                    {end && <Marker position={end}><Popup>{searchEnd || 'Drop-Off'}</Popup></Marker>}
                    {start && end && <RoutingMachine start={start} end={end} onDistanceChange={setDistance} />}
                  </MapContainer>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <button 
                  className="btn btn-primary" onClick={() => setStep(3)} disabled={!distance || distance == 0}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', opacity: (!distance || distance == 0) ? 0.5 : 1, width: '100%', maxWidth: '300px' }}
                >
                  Choose Ride <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: VEHICLES & DRIVERS */}
          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ marginBottom: '24px' }}><ChevronLeft size={18}/> Back</button>
              
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Choose your ride</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Select a comfortable vehicle from our vetted local drivers.</p>
              </div>

              <div className="grid two-col" style={{ marginBottom: '40px' }}>
                {drivers.map(driver => {
                  const isSelected = selectedDriver?._id === driver._id;
                  const finalTripPrice = calculateTripPrice(driver);

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
                          {finalTripPrice.toLocaleString()} LKR
                        </div>
                        {isSelected && <CheckCircle2 size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fill: 'var(--primary)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>{driver.vehicleType || 'Standard Vehicle'}</h3>
                        <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>Driven by <strong style={{color: 'var(--text)'}}>{driver.name}</strong></p>
                        
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>👥 {driver.vehicleNumber || '1-4'} Seats</span>
                          <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>⭐ 4.9</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <button 
                  className="btn btn-primary" onClick={() => setStep(4)} disabled={!selectedDriver}
                  style={{ padding: '14px 28px', fontSize: '1.1rem', opacity: !selectedDriver ? 0.5 : 1, width: '100%', maxWidth: '300px' }}
                >
                  Review Booking <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 4 && (
            <motion.div key="step4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <button className="btn btn-outline" onClick={() => { setStep(3); setIsConfirmed(false); }} style={{ marginBottom: '24px' }}><ChevronLeft size={18}/> Back</button>

              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--text)' }}>Review & Confirm</h1>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>You're almost there! Review your trip details below.</p>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                  <h3 style={{ borderBottom: '1px solid var(--outline)', paddingBottom: '16px', margin: '0 0 24px 0', fontSize: '1.3rem' }}>Trip Destinations</h3>
                  
                  <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                     <strong style={{ color: '#1e40af' }}>Total Distance: {distance} km mapped route</strong>
                     <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1e3a8a' }}>From ({start?.lat.toFixed(3)}, {start?.lng.toFixed(3)}) to ({end?.lat.toFixed(3)}, {end?.lng.toFixed(3)})</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {selectedPlace && selectedPlace.id !== 'custom' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                        <img src={selectedPlace.image} alt={selectedPlace.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '1.1rem' }}>{selectedPlace.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedPlace.location}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📍</div>
                         <div>
                          <strong style={{ display: 'block', fontSize: '1.1rem' }}>Custom Mapped Location</strong>
                          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Coordinates: {end?.lat.toFixed(3)}, {end?.lng.toFixed(3)}</span>
                        </div>
                      </div>
                    )}
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
                       <span style={{ color: 'var(--primary-700)', fontWeight: 'bold' }}>{calculateTripPrice(selectedDriver).toLocaleString()} LKR</span>
                     </div>
                  </div>
                </div>

                {!isConfirmed ? (
                  <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setIsConfirmed(true)} style={{ padding: '16px 40px', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(22, 163, 74, 0.3)' }}>
                      Confirm
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ marginTop: '32px', padding: '32px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 16px auto' }} />
                    <h2 style={{ color: '#166534', margin: '0 0 8px 0' }}>Booking Confirmed!</h2>
                    <p style={{ color: '#15803d', margin: '0 0 24px 0' }}>Your driver has been notified. Please contact them directly.</p>
                    
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #dcfce3', display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
                      <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', color: '#0f172a' }}>Assigned Driver Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><strong style={{ color: '#64748b' }}>Name:</strong> <span style={{ float: 'right', fontWeight: 'bold', color: '#0f172a' }}>{selectedDriver?.name}</span></div>
                        <div><strong style={{ color: '#64748b' }}>Phone:</strong> <span style={{ float: 'right', fontWeight: 'bold', color: '#0f172a' }}>{selectedDriver?.phone || selectedDriver?.contactNumber || '+94 77 XXXXXXX'}</span></div>
                        <div><strong style={{ color: '#64748b' }}>Rating:</strong> <span style={{ float: 'right', fontWeight: 'bold', color: '#0f172a' }}>⭐ 4.9 / 5.0</span></div>
                        <div><strong style={{ color: '#64748b' }}>Email:</strong> <span style={{ float: 'right', fontWeight: 'bold', color: '#0f172a' }}>{selectedDriver?.email}</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default BookingFlow;
