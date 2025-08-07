import React, { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';

interface Item {
  id: number;
  name: string;
  category: string;
}

interface Message {
  message: string;
}

function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('CLOTHING');

  useEffect(() => {
    api.get<Item[]>('/items').then((response) => {
      setItems(response.data);
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    api.post<Item>('/items', { name, category }).then((response) => {
      setItems([...items, response.data]);
      setName('');
      setCategory('CLOTHING');
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Items</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Item</button>
      </form>
      <ul className="bg-white shadow overflow-hidden sm:rounded-md">
        {items.map((item) => (
          <li key={item.id} className="border-b border-gray-200 last:border-b-0 px-4 py-4 sm:px-6">
            <div className="text-lg font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">({item.category})</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
