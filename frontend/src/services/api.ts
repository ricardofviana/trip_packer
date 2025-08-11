import type { ID, Trip, TripCreate, TripUpdate, BagTemplate, BagTemplateCreate, BagTemplateUpdate, PackingItem, PackingCreate, PackingUpdate, TripDetail as TripDetailType, TripItem, TripItemCreate, TripItemUpdate } from "@/types";

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// Trips
export const getTrips = () => api.get<Trip[]>("/trips");
export const getTrip = (id: ID) => api.get<TripDetailType>(`/trips/${id}`); // This will return TripDetailResponse
export const createTrip = (data: TripCreate) => api.post<Trip>("/trips", data);
export const updateTrip = (id: ID, data: TripUpdate) => api.put<Trip>(`/trips/${id}`, data);
export const deleteTrip = (id: ID) => api.delete(`/trips/${id}`);

// Trip Bags
export const getTripBags = (tripId: ID) => api.get<BagTemplate[]>(`/trips/${tripId}/bags`);
export const addBagToTrip = (tripId: ID, bagId: ID) => api.post<BagTemplate>(`/trips/${tripId}/bags/${bagId}`);
export const removeBagFromTrip = (tripId: ID, bagId: ID) => api.delete(`/trips/${tripId}/bags/${bagId}`);

// Bag Templates
export const getBagTemplates = () => api.get<BagTemplate[]>("/bags");
export const getBagTemplate = (id: ID) => api.get<BagTemplate>(`/bags/${id}`);
export const createBagTemplate = (data: BagTemplateCreate) => api.post<BagTemplate>("/bags", data);
export const updateBagTemplate = (id: ID, data: BagTemplateUpdate) => api.put<BagTemplate>(`/bags/${id}`, data);
export const deleteBagTemplate = (id: ID) => api.delete(`/bags/${id}`);

// Item Templates (assuming these remain largely the same)
export const getItems = () => api.get<ItemTemplate[]>("/items");
export const getItem = (id: ID) => api.get<ItemTemplate>(`/items/${id}`);
export const createItem = (data: ItemCreate) => api.post<ItemTemplate>("/items", data);
export const updateItem = (id: ID, data: ItemUpdate) => api.put<ItemTemplate>(`/items/${id}`, data);
export const deleteItem = (id: ID) => api.delete(`/items/${id}`);

// Trip Items
export const getTripItems = (tripId: ID) => api.get<TripItem[]>(`/trips/${tripId}/trip-items`);
export const addTripItem = (tripId: ID, data: TripItemCreate) => api.post<TripItem>(`/trips/${tripId}/trip-items`, data);
export const updateTripItem = (tripId: ID, itemId: ID, data: TripItemUpdate) => api.put<TripItem>(`/trips/${tripId}/trip-items/${itemId}`, data);
export const removeTripItem = (tripId: ID, itemId: ID) => api.delete(`/trips/${tripId}/trip-items/${itemId}`);

// Packing List
export const getPackingList = (tripId: ID) => api.get<PackingItem[]>(`/trips/${tripId}/packing-list`);
export const addItemToPackingList = (tripId: ID, data: PackingCreate) => api.post<PackingItem>(`/trips/${tripId}/packing-list`, data);
export const updatePackingListItem = (tripId: ID, itemId: ID, data: PackingUpdate) => api.put<PackingItem>(`/trips/${tripId}/packing-list/${itemId}`, data);
export const removeItemFromPackingList = (tripId: ID, itemId: ID) => api.delete(`/trips/${tripId}/packing-list/${itemId}`);

