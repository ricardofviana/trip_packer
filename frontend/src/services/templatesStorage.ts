import type { ID } from "@/types";

export interface ItemTemplate {
  id: ID;
  name: string;
  default_quantity: number;
  notes?: string;
}

export interface LuggageTemplate {
  id: ID;
  name: string;
}

const STORAGE_KEY = "trip-packer-templates";

interface TemplatesData {
  itemTemplates: ItemTemplate[];
  luggageTemplates: LuggageTemplate[];
}

const initialData: TemplatesData = { itemTemplates: [], luggageTemplates: [] };

function uid(): ID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function load(): TemplatesData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as TemplatesData;
    return {
      itemTemplates: parsed.itemTemplates || [],
      luggageTemplates: parsed.luggageTemplates || [],
    };
  } catch {
    return initialData;
  }
}

function save(data: TemplatesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Item Templates
export function listItemTemplates(): ItemTemplate[] {
  return load().itemTemplates.sort((a, b) => a.name.localeCompare(b.name));
}

export function getItemTemplate(id: ID): ItemTemplate | undefined {
  return load().itemTemplates.find((t) => t.id === id);
}

export function createItemTemplate(input: Omit<ItemTemplate, "id">): ItemTemplate {
  const data = load();
  const item: ItemTemplate = { id: uid(), ...input };
  data.itemTemplates.push(item);
  save(data);
  return item;
}

export function updateItemTemplate(id: ID, patch: Partial<Omit<ItemTemplate, "id">>): ItemTemplate | undefined {
  const data = load();
  const idx = data.itemTemplates.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  data.itemTemplates[idx] = { ...data.itemTemplates[idx], ...patch };
  save(data);
  return data.itemTemplates[idx];
}

export function deleteItemTemplate(id: ID) {
  const data = load();
  data.itemTemplates = data.itemTemplates.filter((t) => t.id !== id);
  save(data);
}

// Luggage Templates
export function listLuggageTemplates(): LuggageTemplate[] {
  return load().luggageTemplates.sort((a, b) => a.name.localeCompare(b.name));
}

export function getLuggageTemplate(id: ID): LuggageTemplate | undefined {
  return load().luggageTemplates.find((t) => t.id === id);
}

export function createLuggageTemplate(input: Omit<LuggageTemplate, "id">): LuggageTemplate {
  const data = load();
  const lug: LuggageTemplate = { id: uid(), ...input };
  data.luggageTemplates.push(lug);
  save(data);
  return lug;
}

export function updateLuggageTemplate(id: ID, patch: Partial<Omit<LuggageTemplate, "id">>): LuggageTemplate | undefined {
  const data = load();
  const idx = data.luggageTemplates.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  data.luggageTemplates[idx] = { ...data.luggageTemplates[idx], ...patch };
  save(data);
  return data.luggageTemplates[idx];
}

export function deleteLuggageTemplate(id: ID) {
  const data = load();
  data.luggageTemplates = data.luggageTemplates.filter((t) => t.id !== id);
  save(data);
}
