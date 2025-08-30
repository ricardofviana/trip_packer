import { api } from "@/services/api";
import type { ID, Trip, TripCreate, TripUpdate, Bag, Item } from "@/types";

export const tripsRepo = {
  listTrips: () => api.get<Trip[]>("/trips").then(res => res.data),
  getTrip: (id: ID) => api.get<Trip>(`/trips/${id}`).then(res => res.data),
  createTrip: (data: TripCreate) => api.post<Trip>("/trips", data).then(res => res.data),
  updateTrip: (id: ID, data: TripUpdate) => api.put<Trip>(`/trips/${id}`, data).then(res => res.data),
  deleteTrip: (id: ID) => api.delete(`/trips/${id}`).then(res => res.data),

  listTripBags: (tripId: ID) => api.get<Bag[]>(`/trips/${tripId}/bags`).then(res => res.data),
  addTripBag: (tripId: ID, bagId: ID) => api.post<Bag>(`/trips/${tripId}/bags/${bagId}`).then(res => res.data),
  removeTripBag: (tripId: ID, bagId: ID) => api.delete(`/trips/${tripId}/bags/${bagId}`).then(res => res.data),

  listTripItems: (tripId: ID) => api.get<Item[]>(`/trips/${tripId}/items`).then(res => res.data),
};
