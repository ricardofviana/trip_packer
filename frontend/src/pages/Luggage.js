import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Luggage() {
  const [luggage, setLuggage] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('BACKPACK');

  useEffect(() => {
    api.get('/luggage').then((response) => {
      setLuggage(response.data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/luggage', { name, type }).then((response) => {
      setLuggage([...luggage, response.data]);
      setName('');
      setType('BACKPACK');
    });
  };

  return (
    <div>
      <h2>Luggage</h2>
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
          <label htmlFor="type" className="form-label">Type</label>
          <select
            className="form-select"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="BACKPACK">Backpack</option>
            <option value="CARRY_ON">Carry-on</option>
            <option value="CHECKED_MEDIUM">Checked Medium</option>
            <option value="CHECKED_LARGE">Checked Large</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create Luggage</button>
      </form>
      <ul className="list-group mt-4">
        {luggage.map((item) => (
          <li key={item.id} className="list-group-item">
            {item.name} ({item.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Luggage;
