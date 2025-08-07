import type { ID } from "@/types";
import { getItems, getItem, createItem, updateItem, deleteItem } from "@/services/api";

export const itemsRepo = {
  listItems: getItems,
  getItem: getItem,
  createItem: (input: Omit<Item, "id">) => createItem(input),
  updateItem: (id: ID, patch: Partial<Omit<Item, "id">>) => updateItem(id, patch),
  deleteItem: (id: ID) => deleteItem(id),
};