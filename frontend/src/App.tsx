import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Items from './pages/Items';
import Luggage from './pages/Luggage';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Trip Packer</h1>
        <nav className="flex justify-center space-x-4 mb-8">
          <Link to="/" className="text-blue-500 hover:text-blue-700">Trips</Link>
          <Link to="/items" className="text-blue-500 hover:text-blue-700">Items</Link>
          <Link to="/luggage" className="text-blue-500 hover:text-blue-700">Luggage</Link>
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
