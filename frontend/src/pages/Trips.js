import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    api.get('/trips').then((response) => {
      setTrips(response.data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/trips', { name, start_date: startDate, end_date: endDate }).then((response) => {
      setTrips([...trips, response.data]);
      setName('');
      setStartDate('');
      setEndDate('');
    });
  };

  return (
    <div>
      <h2>Trips</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Trip</button>
      </form>
      <ul className="list-group mt-4">
        {trips.map((trip) => (
          <li key={trip.id} className="list-group-item">
            <Link to={`/trips/${trip.id}`}>{trip.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Trips;
