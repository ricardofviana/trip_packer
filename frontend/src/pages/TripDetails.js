import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function TripDetails() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    api.get(`/trips/${tripId}`).then((response) => {
      setTrip(response.data);
    });
  }, [tripId]);

  if (!trip) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{trip.name}</h2>
      <p>Start Date: {trip.start_date}</p>
      <p>End Date: {trip.end_date}</p>
    </div>
  );
}

export default TripDetails;
