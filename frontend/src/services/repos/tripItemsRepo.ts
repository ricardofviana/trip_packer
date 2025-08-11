import type { ID, TripItem, TripItemCreate, TripItemUpdate } from "@/types";
import { getTripItems, addTripItem, updateTripItem, removeTripItem } from "@/services/api";


export const tripItemsRepo = {
  getTripItems: getTripItems as (tripId: ID) => Promise<{ data: TripItem[] }>,
  addTripItem: addTripItem as (tripId: ID, data: TripItemCreate) => Promise<{ data: TripItem }>,
  updateTripItem: updateTripItem as (tripId: ID, itemId: ID, data: TripItemUpdate) => Promise<{ data: TripItem }>,
  removeTripItem: removeTripItem as (tripId: ID, itemId: ID) => Promise<{ data: TripItem }>
}