import type { ID, LuggageTemplate, LuggageCreate, LuggageUpdate } from "@/types";
import { getLuggage, getLuggageItem, createLuggage, updateLuggage, deleteLuggage } from "@/services/api";

export const luggageRepo = {
  listLuggage: getLuggage as () => Promise<{ data: LuggageTemplate[] }>,
  getLuggage: getLuggageItem as (id: ID) => Promise<{ data: LuggageTemplate }>,
  createLuggage: (input: LuggageCreate) => createLuggage(input),
  updateLuggage: (id: ID, patch: LuggageUpdate) => updateLuggage(id, patch),
  deleteLuggage: (id: ID) => deleteLuggage(id),
};