import React, { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';

interface LuggageItem {
  id: number;
  name: string;
  type: string;
}

interface Message {
  message: string;
}

function Luggage() {
  const [luggage, setLuggage] = useState<LuggageItem[]>([]);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('BACKPACK');

  useEffect(() => {
    api.get<LuggageItem[]>('/luggage').then((response) => {
      setLuggage(response.data);
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    api.post<LuggageItem>('/luggage', { name, type }).then((response) => {
      setLuggage([...luggage, response.data]);
      setName('');
      setType('BACKPACK');
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Luggage</h2>
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
          <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type</label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Luggage</button>
      </form>
      <ul className="bg-white shadow overflow-hidden sm:rounded-md">
        {luggage.map((item) => (
          <li key={item.id} className="border-b border-gray-200 last:border-b-0 px-4 py-4 sm:px-6">
            <div className="text-lg font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">({item.type})</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Luggage;
