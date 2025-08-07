import type { ID, ItemStatus } from "@/types";
import { getItemsInLuggage, addItemToLuggage, updateItemInLuggage, removeItemFromLuggage, updatePackingStatus } from "@/services/api";

export const packingRepo = {
  listLuggageItems: getItemsInLuggage,
  addLuggageItem: addItemToLuggage,
  updateLuggageItem: updateItemInLuggage,
  updateLuggageItemStatus: updatePackingStatus,
  deleteLuggageItem: removeItemFromLuggage,
};