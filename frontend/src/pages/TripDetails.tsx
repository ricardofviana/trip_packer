import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

function TripDetails() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (tripId) {
      api.get<Trip>(`/trips/${tripId}`).then((response) => {
        setTrip(response.data);
      });
    }
  }, [tripId]);

  if (!trip) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{trip.name}</h2>
      <p className="text-gray-700 mb-2"><span className="font-semibold">Start Date:</span> {trip.start_date}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">End Date:</span> {trip.end_date}</p>
    </div>
  );
}

export default TripDetails;
