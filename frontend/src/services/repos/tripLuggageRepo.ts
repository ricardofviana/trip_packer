import type { ID, Bag } from "@/types";
import { getTripLuggage, addLuggageToTrip, removeLuggageFromTrip } from "@/services/api";

// TripLuggageRepo maps to /trips/{trip_id}/luggage endpoints.

export const tripLuggageRepo = {
  listTripLuggage: getTripLuggage,
  addTripLuggage: addLuggageToTrip,
  removeTripLuggage: removeLuggageFromTrip,
};