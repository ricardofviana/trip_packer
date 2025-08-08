import type { ID, Item, LuggageItemCreate, LuggageItemUpdate, LuggageItemStatusUpdate } from "@/types";
import { getItemsInLuggage, addItemToLuggage, updateItemInLuggage, removeItemFromLuggage, updatePackingStatus } from "@/services/api";

export const packingRepo = {
  listLuggageItems: getItemsInLuggage as (luggageId: ID) => Promise<{ data: Item[] }>,
  addLuggageItem: addItemToLuggage as (luggageId: ID, data: LuggageItemCreate) => Promise<{ data: Item }>,
  updateLuggageItem: updateItemInLuggage as (luggageId: ID, itemId: ID, data: LuggageItemUpdate) => Promise<{ data: Item }>,
  updateLuggageItemStatus: updatePackingStatus as (luggageId: ID, itemId: ID, data: LuggageItemStatusUpdate) => Promise<{ data: Item }>,
  deleteLuggageItem: removeItemFromLuggage as (luggageId: ID, itemId: ID) => Promise<any>,
};