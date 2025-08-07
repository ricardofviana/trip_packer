import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Items() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CLOTHING');

  useEffect(() => {
    api.get('/items').then((response) => {
      setItems(response.data);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/items', { name, category }).then((response) => {
      setItems([...items, response.data]);
      setName('');
      setCategory('CLOTHING');
    });
  };

  return (
    <div>
      <h2>Items</h2>
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
          <label htmlFor="category" className="form-label">Category</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="CLOTHING">Clothing</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="TOILETRIES">Toiletries</option>
            <option value="DOCUMENTS">Documents</option>
            <option value="MEDICATION">Medication</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Create Item</button>
      </form>
      <ul className="list-group mt-4">
        {items.map((item) => (
          <li key={item.id} className="list-group-item">
            {item.name} ({item.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
