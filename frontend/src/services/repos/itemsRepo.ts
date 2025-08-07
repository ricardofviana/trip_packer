import type { ID } from "@/types";
import {
  listItemTemplates,
  getItemTemplate,
  createItemTemplate,
  updateItemTemplate,
  deleteItemTemplate,
  type ItemTemplate,
} from "@/services/templatesStorage";

// Items templates repo maps to /items endpoints
export type { ItemTemplate } from "@/services/templatesStorage";

export const itemsRepo = {
  listItems: listItemTemplates,
  getItem: getItemTemplate,
  createItem: (input: Omit<ItemTemplate, "id">) => createItemTemplate(input),
  updateItem: (id: ID, patch: Partial<Omit<ItemTemplate, "id">>) => updateItemTemplate(id, patch),
  deleteItem: (id: ID) => deleteItemTemplate(id),
};
