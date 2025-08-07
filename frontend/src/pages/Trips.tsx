import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TripCard from '../components/TripCard';

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

interface Message {
  message: string;
}

function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    api.get<Trip[]>('/trips').then((response) => {
      setTrips(response.data);
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    api.post<Trip>('/trips', { name, start_date: startDate, end_date: endDate }).then((response) => {
      setTrips([...trips, response.data]);
      setName('');
      setStartDate('');
      setEndDate('');
      setIsModalOpen(false); // Close modal on successful submission
    });
  };

  const handleEdit = (tripId: number) => {
    console.log(`Edit trip with ID: ${tripId}`);
    // Implement edit logic here (e.g., open an edit modal)
  };

  const handleDelete = (tripId: number) => {
    console.log(`Delete trip with ID: ${tripId}`);
    // Implement delete logic here (e.g., show confirmation, then delete via API)
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Trips</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
        >
          + Add New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg mb-4">No trips yet! Start planning your adventure.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Trip</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                <input
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trips;
