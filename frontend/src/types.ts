export type ID = number;

export enum ItemStatus {
  UNPACKED = "Guardar",
  PACKED = "Guardado",
  TO_BUY = "Comprar",
}

export enum LuggageType {
  BACKPACK = "Mochila",
  CARRY_ON = "Bagagem de Bordo",
  CHECKED_MEDIUM = "Bagagem despachada 23kg",
  CHECKED_LARGE = "Bagagem despachada 32kg",
}

export enum ItemCategory {
  CLOTHING = "Roupas",
  ELECTRONICS = "Eletronicos",
  TOILETRIES = "Higiene",
  DOCUMENTS = "Documentos",
  MEDICATION = "Medicamentos",
  ACCESSORIES = "Acessorios",
  OTHER = "Outros",
}

export interface Trip {
  id: ID;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  created_at: string;
  updated_at: string;
}

export interface TripCreate {
  name: string;
  start_date: string;
  end_date: string;
}

export interface TripUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
}

export interface LuggageTemplate {
  id: ID;
  name: string;
  type: LuggageType;
  created_at: string;
  updated_at: string;
}

export interface LuggageCreate {
  name: string;
  type: LuggageType;
}

export interface LuggageUpdate {
  name?: string;
  type?: LuggageType;
}

export interface Bag {
  id: ID;
  name: string;
  type: LuggageType;
  trip_id: ID; // This is a frontend-specific context, not directly from backend LuggageResponse
  created_at: string;
  updated_at: string;
}


export interface ItemTemplate {
  id: ID;
  name: string;
  category: ItemCategory;
  created_at: string;
  updated_at: string;
}

export interface ItemCreate {
  name: string;
  category: ItemCategory;
}

export interface ItemUpdate {
  name?: string;
  category?: ItemCategory;
}

export interface LuggageItemCreate {
  item_id: ID;
  quantity?: number;
}

export interface LuggageItemUpdate {
  quantity?: number;
  luggage_id?: ID;
  name?: string;
}

export interface LuggageItemStatusUpdate {
  is_packed: boolean;
}

export interface Item {
  id: ID; // Corresponds to item_id in LuggageItemResponse
  name: string;
  quantity: number;
  category: ItemCategory;
  is_packed: boolean; // Added for direct status tracking
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}
