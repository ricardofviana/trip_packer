import { Bag, ID, Item, ItemStatus, Trip } from "@/types";

const STORAGE_KEY = "trip-packer-data";

interface DataShape {
  trips: Trip[];
  bags: Bag[];
  items: Item[];
}

const initialData: DataShape = {
  trips: [],
  bags: [],
  items: [],
};

function uid(): ID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function load(): DataShape {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as DataShape;
    return { trips: parsed.trips || [], bags: parsed.bags || [], items: parsed.items || [] };
  } catch {
    return initialData;
  }
}

function save(data: DataShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Trip APIs
export function listTrips(): Trip[] {
  return load().trips.sort((a, b) => a.name.localeCompare(b.name));
}

export function getTrip(id: ID): Trip | undefined {
  return load().trips.find((t) => t.id === id);
}

export function createTrip(input: Omit<Trip, "id">): Trip {
  const data = load();
  const trip: Trip = { id: uid(), ...input };
  data.trips.push(trip);
  save(data);
  return trip;
}

export function updateTrip(id: ID, patch: Partial<Omit<Trip, "id">>): Trip | undefined {
  const data = load();
  const idx = data.trips.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  data.trips[idx] = { ...data.trips[idx], ...patch };
  save(data);
  return data.trips[idx];
}

export function deleteTrip(id: ID) {
  const data = load();
  const bagIds = data.bags.filter((b) => b.trip_id === id).map((b) => b.id);
  data.items = data.items.filter((it) => !bagIds.includes(it.luggage_id));
  data.bags = data.bags.filter((b) => b.trip_id !== id);
  data.trips = data.trips.filter((t) => t.id !== id);
  save(data);
}

// Bag APIs
export function listBags(tripId: ID): Bag[] {
  return load().bags.filter((b) => b.trip_id === tripId);
}

export function createBag(tripId: ID, name: string): Bag {
  const data = load();
  const bag: Bag = { id: uid(), name, trip_id: tripId };
  data.bags.push(bag);
  save(data);
  return bag;
}

export function updateBag(id: ID, patch: Partial<Omit<Bag, "id" | "trip_id">>): Bag | undefined {
  const data = load();
  const idx = data.bags.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  data.bags[idx] = { ...data.bags[idx], ...patch };
  save(data);
  return data.bags[idx];
}

export function deleteBag(id: ID) {
  const data = load();
  data.items = data.items.filter((it) => it.luggage_id !== id);
  data.bags = data.bags.filter((b) => b.id !== id);
  save(data);
}

// Item APIs
export function listItemsByBag(bagId: ID): Item[] {
  return load().items.filter((it) => it.luggage_id === bagId);
}

export function listItemsByTrip(tripId: ID): Item[] {
  const bagIds = listBags(tripId).map((b) => b.id);
  return load().items.filter((it) => bagIds.includes(it.luggage_id));
}

export function createItem(input: Omit<Item, "id">): Item {
  const data = load();
  const item: Item = { id: uid(), ...input };
  data.items.push(item);
  save(data);
  return item;
}

export function updateItem(id: ID, patch: Partial<Omit<Item, "id">>): Item | undefined {
  const data = load();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  data.items[idx] = { ...data.items[idx], ...patch };
  save(data);
  return data.items[idx];
}

export function moveItem(id: ID, newBagId: ID): Item | undefined {
  return updateItem(id, { luggage_id: newBagId });
}

export function deleteItem(id: ID) {
  const data = load();
  data.items = data.items.filter((i) => i.id !== id);
  save(data);
}

// Overview helpers
export function getTripOverview(tripId: ID) {
  const items = listItemsByTrip(tripId);
  const counts: Record<ItemStatus, number> = { UNPACKED: 0, PACKED: 0, TO_BUY: 0 };
  for (const it of items) counts[it.status]++;
  return { total: items.length, ...counts };
}
