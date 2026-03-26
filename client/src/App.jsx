import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

import DriversList from './pages/DriversList';
import BookingFlow from './pages/BookingFlow';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drivers" element={<DriversList />} />
            <Route path="/book" element={<BookingFlow />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
