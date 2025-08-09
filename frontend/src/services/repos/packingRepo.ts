import type { ID, PackingItem, PackingCreate, PackingUpdate } from "@/types";
import { getPackingList, addItemToPackingList, updatePackingListItem, removeItemFromPackingList } from "@/services/api";


export const packingRepo = {
  getPackingList: getPackingList as (tripId: ID) => Promise<{ data: PackingItem[] }>,
  addItemToPackingList: addItemToPackingList as (tripId: ID, data: PackingCreate) => Promise<{ data: PackingItem }>,
  updatePackingListItem: updatePackingListItem as (tripId: ID, itemId: ID, data: PackingUpdate) => Promise<{ data: PackingItem }>,
  removeItemFromPackingList: removeItemFromPackingList as (tripId: ID, itemId: ID) => Promise<any>};