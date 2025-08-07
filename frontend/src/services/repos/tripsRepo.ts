import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, getTripLuggage } from "@/services/api";

export const tripsRepo = {
  listTrips: getTrips,
  getTrip: getTrip,
  createTrip: createTrip,
  updateTrip: updateTrip,
  deleteTrip: deleteTrip,
  getTripLuggage: getTripLuggage,
};