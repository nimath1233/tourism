import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Reusing the placeholder images from original, or using Unsplash for wow effect
  const slides = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main>
      {/* Hero Slider Section */}
      <section className="slideshow-container" style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
          />
        </AnimatePresence>

        <div className="hero-overlay" style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="container hero-content center" style={{ color: 'white' }}>
            <motion.h1 
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800' }}>
              Find Your Next Adventure
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ fontSize: '1.25rem', marginBottom: '30px', color: '#e2e8f0' }}>
              Book trusted drivers and expert guides, or plan your trip with ease.
            </motion.p>
            <motion.div 
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              className="hero-cta">
              <Link to="/auth" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>Get Started</Link>
              <a href="#services" className="btn btn-outline" style={{ color: 'white', borderColor: 'white', padding: '14px 28px', fontSize: '1.1rem' }}>Our Services</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section alt">
        <div className="container">
          <h2 className="center" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Our Services</h2>
          <div className="grid three-col cards">
            <motion.div whileHover={{ y: -8 }} className="card">
              <h3>Ride with Confidence</h3>
              <p>Book nearby drivers with vehicle details and availability.</p>
            </motion.div>
            <motion.div whileHover={{ y: -8 }} className="card">
              <h3>Explore with Experts</h3>
              <p>Guides with languages and years of experience at your service.</p>
            </motion.div>
            <motion.div whileHover={{ y: -8 }} className="card">
              <h3>Plan Effortlessly</h3>
              <p>Create trips, save favorites, and manage bookings across our platform.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container grid two-col" style={{ alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About TourEase</h2>
            <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6 }}>
              We connect travelers with local drivers and experienced guides to make
              your journey smooth, safe, and memorable. Experience the world like never before
              with our state-of-the-art platform.
            </p>
            <ul className="checklist" style={{ listStyle: 'none', paddingLeft: 0, marginTop: '20px' }}>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>✅ Vetted drivers and guides</li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>✅ Transparent pricing</li>
              <li style={{ padding: '10px 0' }}>✅ 24/7 Premium support</li>
            </ul>
          </div>
          <div className="card image-card" style={{ padding: 0, overflow: 'hidden', height: '400px', borderRadius: '24px' }}>
            <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="About TourEase" />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer" style={{ background: '#0f172a', padding: '40px 0', color: '#cbd5e1' }}>
        <div className="container center">
          <h3 style={{ color: 'white', marginBottom: '10px' }}>TourEase</h3>
          <p style={{ marginBottom: '20px' }}>© {new Date().getFullYear()} All Rights Reserved</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <a href="#about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About</a>
            <a href="#services" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Services</a>
            <Link to="/auth" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
