import { api } from "@/services/api";
import type { BagTemplate, BagTemplateCreate, BagTemplateUpdate, ID } from "@/types";

export const bagTemplatesRepo = {
  listBags: () => api.get<BagTemplate[]>("/bags"),
  getBag: (id: ID) => api.get<BagTemplate>(`/bags/${id}`),
  createBag: (data: BagTemplateCreate) => api.post<BagTemplate>("/bags", data),
  updateBag: (id: ID, data: BagTemplateUpdate) => api.put<BagTemplate>(`/bags/${id}`, data),
  deleteBag: (id: ID) => api.delete(`/bags/${id}`),
};
