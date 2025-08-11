import { api } from "../api";
import { BagTemplate, BagTemplateCreate, BagTemplateUpdate } from "../../types";

export const bagsRepo = {
  listBags: () => api.get<BagTemplate[]>("/bags"),
  getBag: (bagId: string) => api.get<BagTemplate>(`/bags/${bagId}`),
  createBag: (bag: BagTemplateCreate) => api.post<BagTemplate>("/bags", bag),
  updateBag: (bagId: string, bag: BagTemplateUpdate) => api.put<BagTemplate>(`/bags/${bagId}`, bag),
  deleteBag: (bagId: string) => api.delete<void>(`/bags/${bagId}`),
};
