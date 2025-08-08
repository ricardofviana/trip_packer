import type { ID, ItemTemplate } from "@/types";
import { getItems, getItem, createItem, updateItem, deleteItem } from "@/services/api";

export const itemsRepo = {
  listItems: getItems as () => Promise<{ data: ItemTemplate[] }>,
  getItem: getItem as (id: ID) => Promise<{ data: ItemTemplate }>,
  createItem: (input: { name: string; category: string }) => createItem(input),
  updateItem: (id: ID, patch: { name?: string; category?: string }) => updateItem(id, patch),
  deleteItem: (id: ID) => deleteItem(id),
};