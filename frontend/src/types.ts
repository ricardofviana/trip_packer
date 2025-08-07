export type ID = string;

export interface Trip {
  id: ID;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
}

export interface Bag {
  id: ID;
  name: string;
  trip_id: ID;
}

export type ItemStatus = "UNPACKED" | "PACKED" | "TO_BUY";

export interface Item {
  id: ID;
  name: string;
  quantity: number;
  status: ItemStatus;
  luggage_id: ID; // bag id
}
