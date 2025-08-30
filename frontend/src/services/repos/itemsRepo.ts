import { api } from "@/services/api";
import type { ID, Item, ItemCreate, ItemUpdate } from "@/types";

export const itemsRepo = {
  listItems: () => api.get<Item[]>("/items").then(res => res.data),
  getItem: (id: ID) => api.get<Item>(`/items/${id}`).then(res => res.data),
  createItem: (data: ItemCreate) => api.post<Item>("/items", data).then(res => res.data),
  updateItem: (id: ID, data: ItemUpdate) => api.put<Item>(`/items/${id}`, data).then(res => res.data),
  deleteItem: (id: ID) => api.delete(`/items/${id}`).then(res => res.data),
};
