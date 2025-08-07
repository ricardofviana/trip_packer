import type { ID, Bag } from "@/types";
import { listBags as _listBags, createBag as _createBag, deleteBag as _deleteBag } from "@/services/tripPacker";

// TripLuggageRepo maps to /trips/{trip_id}/luggage endpoints.
// Local adapter over tripPacker for now.

export function listTripLuggage(tripId: ID): Bag[] {
  return _listBags(tripId);
}

export function addTripLuggage(tripId: ID, name: string): Bag {
  return _createBag(tripId, name);
}

export function removeTripLuggage(_tripId: ID, luggageId: ID) {
  return _deleteBag(luggageId);
}
