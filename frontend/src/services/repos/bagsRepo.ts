import { api } from "@/services/api";
import type { Bag, BagCreate, BagUpdate, ID } from "@/types";

export const bagsRepo = {
  listBags: () => api.get<Bag[]>("/bags").then(res => res.data),
  getBag: (id: ID) => api.get<Bag>(`/bags/${id}`).then(res => res.data),
  createBag: (data: BagCreate) => api.post<Bag>("/bags", data).then(res => res.data),
  updateBag: (id: ID, data: BagUpdate) => api.put<Bag>(`/bags/${id}`, data).then(res => res.data),
  deleteBag: (id: ID) => api.delete(`/bags/${id}`).then(res => res.data),
};
