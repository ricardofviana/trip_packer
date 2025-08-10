import type { ID, Trip, TripCreate, TripUpdate, BagTemplate } from "@/types";
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, addBagToTrip, removeBagFromTrip } from "@/services/api";

export const tripsRepo = {
  listTrips: getTrips as () => Promise<{ data: Trip }>,
  getTrip: getTrip as (id: ID) => Promise<{ data: Trip }>,
  createTrip: createTrip as (data: TripCreate) => Promise<{ data: Trip }>,
  updateTrip: updateTrip as (id: ID, data: TripUpdate) => Promise<{ data: Trip }>,
  deleteTrip: deleteTrip as (id: ID) => Promise<{ data: Trip }>,
  addBagToTrip: addBagToTrip as (tripId: ID, bagId: ID) => Promise<{ data: BagTemplate }>,
  removeBagFromTrip: removeBagFromTrip as (tripId: ID, bagId: ID) => Promise<{ data: BagTemplate }>
};