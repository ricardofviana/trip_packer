import type { ID } from "@/types";
import { getLuggage, getLuggageItem, createLuggage, updateLuggage, deleteLuggage } from "@/services/api";

export const luggageRepo = {
  listLuggage: getLuggage,
  getLuggage: getLuggageItem,
  createLuggage: (input: Omit<Luggage, "id">) => createLuggage(input),
  updateLuggage: (id: ID, patch: Partial<Omit<Luggage, "id">>) => updateLuggage(id, patch),
  deleteLuggage: (id: ID) => deleteLuggage(id),
};