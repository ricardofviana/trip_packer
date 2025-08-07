import axios from "axios";
import type { Trip, TripCreate, TripUpdate, Luggage, LuggageCreate, LuggageUpdate, Item, ItemCreate, ItemUpdate, LuggageItemCreate, LuggageItemUpdate, LuggageItemStatusUpdate } from "@/types";

const api = axios.create({
  baseURL: "/api",
});

// Trips
export const getTrips = () => api.get<Trip[]>("/trips");
export const getTrip = (id: string) => api.get<Trip>(`/trips/${id}`);
export const createTrip = (data: TripCreate) => api.post<Trip>("/trips", data);
export const updateTrip = (id: string, data: TripUpdate) => api.put<Trip>(`/trips/${id}`, data);
export const deleteTrip = (id: string) => api.delete(`/trips/${id}`);
export const getTripLuggage = (tripId: string) => api.get<Luggage[]>(`/trips/${tripId}/luggage`);
export const addLuggageToTrip = (tripId: string, luggageId: string) => api.post(`/trips/${tripId}/luggage/${luggageId}`);
export const removeLuggageFromTrip = (tripId: string, luggageId: string) => api.delete(`/trips/${tripId}/luggage/${luggageId}`);

// Luggage
export const getLuggage = () => api.get<Luggage[]>("/luggage");
export const getLuggageItem = (id: string) => api.get<Luggage>(`/luggage/${id}`);
export const createLuggage = (data: LuggageCreate) => api.post<Luggage>("/luggage", data);
export const updateLuggage = (id: string, data: LuggageUpdate) => api.put<Luggage>(`/luggage/${id}`, data);
export const deleteLuggage = (id: string) => api.delete(`/luggage/${id}`);

// Items
export const getItems = () => api.get<Item[]>("/items");
export const getItem = (id: string) => api.get<Item>(`/items/${id}`);
export const createItem = (data: ItemCreate) => api.post<Item>("/items", data);
export const updateItem = (id: string, data: ItemUpdate) => api.put<Item>(`/items/${id}`, data);
export const deleteItem = (id: string) => api.delete(`/items/${id}`);

// Packing
export const getItemsInLuggage = (luggageId: string) => api.get<Item[]>(`/packing/luggage/${luggageId}/items`);
export const addItemToLuggage = (luggageId: string, data: LuggageItemCreate) => api.post<Item>(`/packing/luggage/${luggageId}/items`, data);
export const updateItemInLuggage = (luggageId: string, itemId: string, data: LuggageItemUpdate) => api.put<Item>(`/packing/luggage/${luggageId}/items/${itemId}`, data);
export const removeItemFromLuggage = (luggageId: string, itemId: string) => api.delete(`/packing/luggage/${luggageId}/items/${itemId}`);
export const updatePackingStatus = (luggageId: string, itemId: string, data: LuggageItemStatusUpdate) => api.put<Item>(`/packing/luggage/${luggageId}/items/${itemId}/status`, data);
