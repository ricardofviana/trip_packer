export type ID = number;

export enum ItemStatus {
  UNPACKED = "UNPACKED",
  PACKED = "PACKED",
  TO_BUY = "TO_BUY",
}

export enum BagType {
  CHECKED = "CHECKED",
  CARRY_ON = "CARRY_ON",
  BACKPACK = "BACKPACK",
  DUFFEL = "DUFFEL",
  TOTE = "TOTE",
  OTHER = "OTHER",
}

export enum ItemCategory {
  CLOTHING = "CLOTHING",
  ELECTRONICS = "ELECTRONICS",
  TOILETRIES = "TOILETRIES",
  DOCUMENTS = "DOCUMENTS",
  MEDICATION = "MEDICATION",
  ACCESSORIES = "ACCESSORIES",
  OTHER = "OTHER",
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

export interface BagTemplate {
  id: ID;
  name: string;
  type: BagType;
  created_at: string;
  updated_at: string;
}

export interface BagTemplateCreate {
  name: string;
  type: BagType;
}

export interface BagTemplateUpdate {
  name?: string;
  type?: BagType;
}

export interface TripBag {
  trip_id: ID;
  bag_id: ID;
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

export interface TripItem {
  trip_id: ID;
  item_id: ID;
  quantity: number;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
  // Nested objects for detailed response
  item: ItemTemplate;
}

export interface TripItemCreate {
  item_id: ID;
  quantity?: number;
  status?: ItemStatus;
}

export interface TripItemUpdate {
  quantity?: number;
  status?: ItemStatus;
}

export interface TripDetail extends Trip {
  bags: BagTemplate[]; // Bags associated with this trip
  trip_items: TripItem[]; // Trip items for this trip
}