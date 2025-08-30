import { api } from "@/services/api";
import type { ID, TripItem, TripItemCreate, TripItemUpdate } from "@/types";

export const tripItemsRepo = {
  listTripItems: (tripId: ID) => api.get<TripItem[]>(`/trips/${tripId}/trip-items`).then(res => res.data),
  addTripItem: (tripId: ID, data: TripItemCreate) => api.post<TripItem>(`/trips/${tripId}/trip-items`, data).then(res => res.data),
  updateTripItem: (tripId: ID, itemId: ID, data: TripItemUpdate) =>
    api.put<TripItem>(`/trips/${tripId}/trip-items/${itemId}`, data).then(res => res.data),
  removeTripItem: (tripId: ID, itemId: ID) => api.delete(`/trips/${tripId}/trip-items/${itemId}`).then(res => res.data),
};
