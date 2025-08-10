import type { ID, BagTemplate } from "@/types";
import { getTripBags, addBagToTrip, removeBagFromTrip } from "@/services/api";

// TripLuggageRepo maps to /trips/{trip_id}/bag endpoints.

export const tripLuggageRepo = {
  listTripLuggage: getTripBags as (tripId: ID) => Promise<{ data: BagTemplate[] }>,
  addTripLuggage: addBagToTrip as (tripId: ID, bagId: ID) => Promise<{ data: BagTemplate }>,
  removeTripLuggage: removeBagFromTrip as (tripId: ID, bagId: ID) => Promise<void>,
};