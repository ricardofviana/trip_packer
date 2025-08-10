import type { ID, ItemTemplate, ItemCategory } from "@/types";
import { getItems, getItem, createItem, updateItem, deleteItem } from "@/services/api";

export const itemsRepo = {
  listItems: getItems as () => Promise<{ data: ItemTemplate[] }>,
  getItem: getItem as (id: ID) => Promise<{ data: ItemTemplate }>,
  createItem: createItem as (input: { name: string; category: ItemCategory }) => Promise<{ data: ItemTemplate }>,
  updateItem: updateItem as (id: ID, patch: { name?: string; category?: ItemCategory }) => Promise<{ data: ItemTemplate }>,
  deleteItem: deleteItem as (id: ID) => Promise<{ data: ItemTemplate }>
};