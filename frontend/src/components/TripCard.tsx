import React from 'react';
import { Link } from 'react-router-dom';

interface TripCardProps {
  trip: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
  };
  onEdit: (tripId: number) => void;
  onDelete: (tripId: number) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{trip.name}</h3>
        <p className="text-gray-600 text-sm mb-1">{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
        <p className="text-gray-600 text-sm mb-4">{diffDays} Days</p>
        {/* Progress Bar/Ring - Placeholder for now */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Link
          to={`/trips/${trip.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300"
        >
          View Trip
        </Link>
        <button
          onClick={() => onEdit(trip.id)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(trip.id)}
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TripCard;
