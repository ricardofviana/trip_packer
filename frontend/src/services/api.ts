import axios from "axios";
import type { ID, Trip, TripCreate, TripUpdate, LuggageTemplate, LuggageCreate, LuggageUpdate, ItemTemplate, Item, ItemCreate, ItemUpdate, LuggageItemCreate, LuggageItemUpdate, LuggageItemStatusUpdate } from "@/types";

const api = axios.create({
  baseURL: "/api",
});

// Trips
export const getTrips = () => api.get<Trip[]>("/trips");
export const getTrip = (id: ID) => api.get<Trip>(`/trips/${id}`);
export const createTrip = (data: TripCreate) => api.post<Trip>("/trips", data);
export const updateTrip = (id: ID, data: TripUpdate) => api.put<Trip>(`/trips/${id}`, data);
export const deleteTrip = (id: ID) => api.delete(`/trips/${id}`);
export const getTripLuggage = (tripId: ID) => api.get<LuggageTemplate[]>(`/trips/${tripId}/bag`);
export const addLuggageToTrip = (tripId: ID, luggageId: ID) => api.post(`/trips/${tripId}/bag/${luggageId}`);
export const removeLuggageFromTrip = (tripId: ID, luggageId: ID) => api.delete(`/trips/${tripId}/bag/${luggageId}`);
export const getTripOverview = (tripId: ID) => api.get<{ total: number; PACKED: number; UNPACKED: number; TO_BUY: number }>(`/trips/${tripId}/overview`);

// Bag
export const getLuggage = () => api.get<LuggageTemplate[]>("/bag");
export const getLuggageItem = (id: ID) => api.get<LuggageTemplate>(`/bag/${id}`);
export const createLuggage = (data: LuggageCreate) => api.post<LuggageTemplate>("/bag", data);
export const updateLuggage = (id: ID, data: LuggageUpdate) => api.put<LuggageTemplate>(`/bag/${id}`, data);
export const deleteLuggage = (id: ID) => api.delete(`/bag/${id}`);

// Items
export const getItems = () => api.get<ItemTemplate[]>("/items");
export const getItem = (id: ID) => api.get<ItemTemplate>(`/items/${id}`);
export const createItem = (data: ItemCreate) => api.post<ItemTemplate>("/items", data);
export const updateItem = (id: ID, data: ItemUpdate) => api.put<ItemTemplate>(`/items/${id}`, data);
export const deleteItem = (id: ID) => api.delete(`/items/${id}`);

// Packing
export const getItemsInLuggage = (luggageId: ID) => api.get<Item[]>(`/packing/bag/${luggageId}/items`);
export const addItemToLuggage = (luggageId: ID, data: LuggageItemCreate) => api.post<Item>(`/packing/bag/${luggageId}/items`, data);
export const updateItemInLuggage = (luggageId: ID, itemId: ID, data: LuggageItemUpdate) => api.put<Item>(`/packing/bag/${luggageId}/items/${itemId}`, data);
export const removeItemFromLuggage = (luggageId: ID, itemId: ID) => api.delete(`/packing/bag/${luggageId}/items/${itemId}`);
export const updatePackingStatus = (luggageId: ID, itemId: ID, data: LuggageItemStatusUpdate) => api.put<Item>(`/packing/bag/${luggageId}/items/${itemId}/status`, data);
