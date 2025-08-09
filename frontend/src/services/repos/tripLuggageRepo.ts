import type { ID, LuggageTemplate } from "@/types";
import { getTripLuggage, addLuggageToTrip, removeLuggageFromTrip } from "@/services/api";

// TripLuggageRepo maps to /trips/{trip_id}/bag endpoints.

export const tripLuggageRepo = {
  listTripLuggage: getTripLuggage as (tripId: ID) => Promise<{ data: LuggageTemplate[] }>,
  addTripLuggage: addLuggageToTrip as (tripId: ID, luggageId: ID) => Promise<any>,
  removeTripLuggage: removeLuggageFromTrip as (tripId: ID, luggageId: ID) => Promise<any>,
};