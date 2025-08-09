import type { ID, Trip, TripCreate, TripUpdate, LuggageTemplate } from "@/types";
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, getTripLuggage, getTripOverview } from "@/services/api";

export const tripsRepo = {
  listTrips: getTrips as () => Promise<{ data: Trip }>,
  getTrip: getTrip as (id: ID) => Promise<{ data: Trip }>,
  createTrip: createTrip as (data: TripCreate) => Promise<{ data: Trip }>,
  updateTrip: updateTrip as (id: ID, data: TripUpdate) => Promise<{ data: Trip }>,
  deleteTrip: deleteTrip as (id: ID) => Promise<any>,
  getTripLuggage: getTripLuggage as (tripId: ID) => Promise<{ data: LuggageTemplate[] }>,
  getTripOverview: getTripOverview as (tripId: ID) => Promise<{ data: { total: number; PACKED: number; UNPACKED: number; TO_BUY: number } }>,
};