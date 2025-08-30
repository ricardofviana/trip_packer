import { api } from "@/services/api";
import type { ID, Packing, PackingCreate, PackingUpdate } from "@/types";

export const packingRepo = {
  listPacking: (tripId: ID) => api.get<Packing[]>(`/trips/${tripId}/packing-list`).then(res => res.data),
  createPacking: (tripId: ID, data: PackingCreate) => api.post<Packing>(`/trips/${tripId}/packing-list`, data).then(res => res.data),
  updatePacking: (tripId: ID, itemId: ID, bagId: ID, data: PackingUpdate) =>
    api.put<Packing>(`/trips/${tripId}/packing-list/${itemId}/${bagId}`, data).then(res => res.data),
  deletePacking: (tripId: ID, itemId: ID, bagId: ID) => api.delete(`/trips/${tripId}/packing-list/${itemId}/${bagId}`).then(res => res.data),
};
