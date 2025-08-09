# Backend Refactoring Plan for Trip Packer

This document outlines the necessary changes to the backend to align with the new database schema and application logic. The goal is to create a more flexible and robust system for managing trips, bags, items, and packing lists.

## 1. Data Model Changes (SQLAlchemy Models)

The existing data models will be updated to reflect the new ERD. This involves creating new tables and modifying existing ones.

**File to Modify:** `trip_packer/models.py`

### New and Updated Models:

- **`Trip`**: This model remains largely the same but will be related to `TripBag` and `Packing`.

- **`Bag`**: A new model to store reusable bag templates.
  - `id`: Integer, Primary Key
  - `name`: String, Not Nullable
  - `type`: Enum (CHECKED, CARRY_ON, BACKPACK, etc.), Nullable
  - `created_at`, `updated_at`: DateTime

- **`Item`**: A new model to store reusable item templates.
  - `id`: Integer, Primary Key
  - `name`: String, Not Nullable, Unique
  - `category`: String, Nullable
  - `created_at`, `updated_at`: DateTime

- **`TripBag`**: A new association table to link `Trip` and `Bag` entities.
  - `trip_id`: Integer, Foreign Key to `trips.id`, Primary Key
  - `bag_id`: Integer, Foreign Key to `bags.id`, Primary Key
  - `created_at`, `updated_at`: DateTime

- **`Packing`**: A new model representing the packing list for a trip. This is the central table connecting trips, items, and bags.
  - `trip_id`: Integer, Foreign Key to `trips.id`, Primary Key
  - `item_id`: Integer, Foreign Key to `items.id`, Primary Key
  - `bag_id`: Integer, Foreign Key to `bags.id`, **Nullable**. This is a key change from the ERD diagram to allow an item to be on a packing list without being assigned to a bag yet.
  - `item_status`: Enum (UNPACKED, PACKED, TO_BUY), Not Nullable, default: `UNPACKED`
  - `quantity`: Integer, Not Nullable, default: 1
  - `created_at`, `updated_at`: DateTime

## 2. Database Migrations (Alembic)

A new Alembic migration will be generated to apply the schema changes.

- **Action:** Run `alembic revision --autogenerate -m "Implement new ERD models"`
- **Verification:** Manually inspect the generated migration script to ensure it correctly:
  1. Creates `bags`, `items`, `trip_bags`, and `packing` tables.
  2. Drops any old, now-unused tables.
  3. Establishes the correct relationships, constraints, and foreign keys.

## 3. API Layer (FastAPI Routers)

The API endpoints will be created and/or refactored to support the new data models.

### New Routers:

- **`bags.py`**:
  - `POST /bags`: Create a new bag template.
  - `GET /bags`: Get all bag templates.
  - `GET /bags/{bag_id}`: Get a single bag template.
  - `PUT /bags/{bag_id}`: Update a bag template.
  - `DELETE /bags/{bag_id}`: Delete a bag template.

- **`items.py`**:
  - `POST /items`: Create a new item template.
  - `GET /items`: Get all item templates.
  - `GET /items/{item_id}`: Get a single item template.
  - `PUT /items/{item_id}`: Update an item template.
  - `DELETE /items/{item_id}`: Delete an item template.

### Updated Routers:

- **`trips.py`**:
  - **`/trips/{trip_id}/bags`**:
    - `GET`: List all bags associated with a specific trip (from `TripBags`).
    - `POST`: Associate a bag with a trip (creates a `TripBag` entry).
  - **`/trips/{trip_id}/bags/{bag_id}`**:
    - `DELETE`: Remove a bag's association from a trip.

- **`packing.py`**: This will be the new name for the router managing the packing list.
  - **`/trips/{trip_id}/packing-list`**:
    - `GET`: Get the full packing list for a trip, likely with items grouped by bag.
    - `POST`: Add an item to the trip's packing list (creates a `Packing` entry).
  - **`/trips/{trip_id}/packing-list/{item_id}`**:
    - `PUT`: Update a packing list item (change `quantity`, `item_status`, or assign/move to a `bag_id`).
    - `DELETE`: Remove an item from the packing list.

## 4. Schemas (Pydantic)

**File to Modify:** `trip_packer/schemas.py`

New Pydantic schemas will be created for request and response validation for all new and updated models (`Bag`, `Item`, `TripBag`, `Packing`).

## 5. Business Logic / CRUD Operations

The underlying business logic will be implemented to handle the creation, retrieval, and manipulation of the new entities. This involves creating new CRUD functions that interact with the SQLAlchemy models.

## 6. Testing (Pytest)

**Directory to Modify:** `tests/`

All existing tests must be updated, and new tests must be written to ensure full coverage for the new functionality:
- Unit tests for all new models and schemas.
- Integration tests for all new and modified API endpoints.
- Tests for business logic, such as associating items with trips and moving them between bags.
