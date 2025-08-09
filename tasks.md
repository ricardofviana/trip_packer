# Frontend Task Plan for Trip Packer

This document outlines the frontend development tasks required to support the new backend architecture. The focus is on creating a user-friendly interface for managing trips, bags, and packing lists.

## 1. API Service Layer

**File to Modify:** `src/services/api.ts` (and related files)

- Create new functions to interact with all the new backend endpoints defined in the backend refactoring plan.
  - `bags`: `getBags`, `createBag`, `updateBag`, `deleteBag`.
  - `items`: `getItems`, `createItem`, `updateItem`, `deleteItem`.
  - `tripBags`: `getTripBags`, `addBagToTrip`, `removeBagFromTrip`.
  - `packing`: `getPackingList`, `addItemToPackingList`, `updatePackingListItem`, `removeItemFromPackingList`.
- Update existing API service functions for trips if their responses have changed.

## 2. Type Definitions

**File to Modify:** `src/types.ts`

- Create TypeScript types/interfaces for the new data structures:
  - `Bag`
  - `Item`
  - `TripBag`
  - `PackingItem`
  - `Trip` (update if necessary)

## 3. Page and Component Development

### New Pages:

- **`/items` (Item Templates Page)**
  - **Component:** `ItemsTemplates.tsx`
  - **Functionality:**
    - Display a list of all reusable item templates.
    - A form (e.g., in a modal or on the page) to create and edit items.
    - A button on each item to delete it.
    - Implement search and filtering for items.

- **`/bags` (Bag Templates Page)**
  - **Component:** `LuggageTemplates.tsx` (assuming this will be repurposed)
  - **Functionality:**
    - Display a list of all reusable bag templates.
    - A form to create and edit bags.
    - A button on each bag to delete it.

### Updated Pages:

- **`/trips` (Trips List Page)**
  - **Component:** `Trips.tsx`
  - **Functionality:**
    - No major changes are expected, but ensure the "Create Trip" functionality works with the updated backend.

- **`/trips/{tripId}` (Trip Detail Page)**
  - **Component:** `TripDetail.tsx`
  - **This page will see the most significant changes.** It should be redesigned to manage the packing process for a single trip.
  - **Sub-Component: `TripBagsManager`**
    - Display the list of bags associated with this trip (`TripBags`), showing their name.
    - UI to add a new bag to the trip from the master `Bags` list.
    - UI to remove a bag from the trip.
  - **Sub-Component: `PackingList`**
    - This is the core component for managing items.
    - Display items grouped by the bag they are in, with a separate section for "Unassigned Items".
    - Each item should display its name, quantity, and status (`PACKED`, `UNPACKED`, `TO_BUY`).
    - **Interactivity:**
      - Checkbox or button to toggle `item_status` between `PACKED` and `UNPACKED`.
      - Input to change the `quantity`.
      - A dropdown or drag-and-drop interface to move an item to a different bag or to the "Unassigned" section.
      - A button to add a new item to the trip from the master `Items` list.
      - A button to remove an item from the trip's packing list.

## 4. State Management

- Review the current state management solution (e.g., React Query, Zustand, Redux).
- Implement caching and state invalidation strategies to ensure the UI is always in sync with the backend, especially after mutations (create, update, delete).
  - For example, after adding an item to the packing list, the `getPackingList` query should be refetched or the local cache updated.

## 5. UI/UX Enhancements

- **Toast Notifications:** Use the existing `use-toast` hook to provide feedback for all API actions (e.g., "Item added successfully", "Failed to update bag").
- **Loading States:** Implement loading indicators (spinners, skeletons) for all data-fetching operations.
- **Empty States:** Design and implement informative empty states for when there are no trips, bags, items, or packing list items.
- **Responsive Design:** Ensure all new and updated components are fully responsive and usable on mobile devices.
