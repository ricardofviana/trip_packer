export type ID = number;

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
  type: string;
  created_at: string;
  updated_at: string;
}

export interface LuggageCreate {
  name: string;
  type: string;
}

export interface LuggageUpdate {
  name?: string;
  type?: string;
}

export interface Bag {
  id: ID;
  name: string;
  type: string;
  trip_id: ID; // This is a frontend-specific context, not directly from backend LuggageResponse
  created_at: string;
  updated_at: string;
}

export type ItemStatus = "UNPACKED" | "PACKED" | "TO_BUY";

export type LuggageType =
  | "BACKPACK"
  | "CARRY_ON"
  | "CHECKED_MEDIUM"
  | "CHECKED_LARGE";


export type ItemCategory =
  | "CLOTHING"
  | "ELECTRONICS"
  | "TOILETRIES"
  | "DOCUMENTS"
  | "MEDICATION"
  | "ACCESSORIES"
  | "OTHER";

export interface ItemTemplate {
  id: ID;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ItemCreate {
  name: string;
  category: string;
}

export interface ItemUpdate {
  name?: string;
  category?: string;
}

export interface LuggageItemCreate {
  item_id: ID;
  quantity?: number;
  notes?: string;
}

export interface LuggageItemUpdate {
  quantity?: number;
  notes?: string;
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
  category: string;
  notes: string;
  is_packed: boolean;
  created_at: string;
  updated_at: string;
}
