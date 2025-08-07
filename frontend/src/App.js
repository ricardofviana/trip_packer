import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Items from './pages/Items';
import Luggage from './pages/Luggage';

function App() {
  return (
    <Router>
      <div className="container">
        <h1 className="my-4">Trip Packer</h1>
        <nav className="nav nav-pills mb-4">
          <Link className="nav-link" to="/">Trips</Link>
          <Link className="nav-link" to="/items">Items</Link>
          <Link className="nav-link" to="/luggage">Luggage</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Trips />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          <Route path="/items" element={<Items />} />
          <Route path="/luggage" element={<Luggage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
