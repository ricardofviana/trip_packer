import type { ID } from "@/types";
import {
  listLuggageTemplates,
  getLuggageTemplate,
  createLuggageTemplate,
  updateLuggageTemplate,
  deleteLuggageTemplate,
  type LuggageTemplate,
} from "@/services/templatesStorage";

// Luggage templates repo maps to /luggage endpoints
export type { LuggageTemplate } from "@/services/templatesStorage";

export const luggageRepo = {
  listLuggage: listLuggageTemplates,
  getLuggage: getLuggageTemplate,
  createLuggage: (input: Omit<LuggageTemplate, "id">) => createLuggageTemplate(input),
  updateLuggage: (id: ID, patch: Partial<Omit<LuggageTemplate, "id">>) => updateLuggageTemplate(id, patch),
  deleteLuggage: (id: ID) => deleteLuggageTemplate(id),
};
