import type { ID, Bag, Item, ItemStatus, Trip } from "@/types";
import { 
  listItemsByBag as _listItemsByBag,
  listItemsByTrip as _listItemsByTrip,
  createItem as _createItem,
  updateItem as _updateItem,
  deleteItem as _deleteItem,
  moveItem as _moveItem,
} from "@/services/tripPacker";

// PackingRepo aligns with REST endpoints under /packing/luggage/{luggage_id}/items
// This is a thin adapter over localStorage-backed tripPacker for now.

export function listLuggageItems(luggageId: ID): Item[] {
  return _listItemsByBag(luggageId);
}

export function listItemsByTrip(tripId: ID): Item[] {
  return _listItemsByTrip(tripId);
}

export function addLuggageItem(
  luggageId: ID,
  input: { name: string; quantity: number; status: ItemStatus }
): Item {
  return _createItem({ ...input, luggage_id: luggageId });
}

export function updateLuggageItem(
  _luggageId: ID,
  itemId: ID,
  patch: Partial<Pick<Item, "name" | "quantity" | "status">>
): Item | undefined {
  return _updateItem(itemId, patch as any);
}

export function updateLuggageItemStatus(
  _luggageId: ID,
  itemId: ID,
  status: ItemStatus
): Item | undefined {
  return _updateItem(itemId, { status });
}

export function deleteLuggageItem(_luggageId: ID, itemId: ID) {
  return _deleteItem(itemId);
}

// Move is implemented as a direct update for now (local adapter). When integrating the API,
// implement as delete in old and create in new luggage with preserved fields.
export function moveLuggageItem(
  itemId: ID,
  _fromLuggageId: ID,
  toLuggageId: ID
): Item | undefined {
  return _moveItem(itemId, toLuggageId);
}
