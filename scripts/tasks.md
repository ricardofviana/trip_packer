# Luggage Management System - Task Breakdown with Definition of Done

## Phase 1: Foundation & Setup (Week 1)

### Epic 1.1: Project Infrastructure

#### Task 1.1.1: Initialize FastAPI Project Structure
**Type:** Task  
**Definition of Done:**
- [ ] Project directory created with standard Python project structure
- [ ] Virtual environment created and activated
- [ ] Git repository initialized with initial commit

#### Task 1.1.2: Install and Configure Core Dependencies
**Type:** Task  
**Definition of Done:**
- [ ] FastAPI installed
- [ ] SQLAlchemy installed
- [ ] Alembic installed
- [ ] pytest installed
- [ ] Basic FastAPI health check endpoint working (/health returns 200 OK)

#### Task 1.1.3: Configure Docker Development Environment
**Type:** Task  
**Definition of Done:**
- [ ] Dockerfile created for FastAPI application
- [ ] docker-compose.yml with app and PostgreSQL services
- [ ] Environment variables properly configured in .env.example
- [ ] Application runs successfully in Docker container
- [ ] PostgreSQL accessible from application container
- [ ] Volume mapping for hot-reload in development

#### Task 1.1.4: Set Up Database Connection and Configuration
**Type:** Task  
**Definition of Done:**
- [ ] Database configuration module created (database.py)
- [ ] SQLAlchemy engine and session configured
- [ ] Database URL constructed from environment variables
- [ ] Connection tested successfully
- [ ] Error handling for database connection failures

---

### Epic 1.2: Core Models Definition

#### Task 1.2.1: Create Trip Model
**Type:** Task  
**Definition of Done:**
- [ ] Trip model created with all required fields (id, name, start_date, end_date, created_at, updated_at)
- [ ] UUID primary key configured
- [ ] Timestamps automatically managed (created_at, updated_at)
- [ ] Model inherits from declarative base
- [ ] Model validates that end_date >= start_date

#### Task 1.2.2: Create Luggage Model
**Type:** Task  
**Definition of Done:**
- [ ] Luggage model created with all fields (id, name, trip_id, created_at, updated_at)
- [ ] Foreign key relationship to Trip model configured
- [ ] Cascade delete configured appropriately
- [ ] Relationship back-reference to Trip configured

#### Task 1.2.3: Create Item Model
**Type:** Task  
**Definition of Done:**
- [ ] Item model created with all fields (id, name, quantity, status, luggage_id, created_at, updated_at)
- [ ] Status field uses Enum (UNPACKED, PACKED, TO_BUY)
- [ ] Foreign key to Luggage model configured
- [ ] Quantity validation (must be > 0)
- [ ] Default status set to UNPACKED
- [ ] Cascade delete configured

#### Task 1.2.4: Create Initial Database Migration
**Type:** Task  
**Definition of Done:**
- [ ] Alembic initialized with proper configuration
- [ ] Initial migration generated for all three models
- [ ] Migration includes proper indexes on foreign keys
- [ ] Migration tested with upgrade command
- [ ] Migration tested with downgrade command

---

## Phase 2: Trip Management API (Week 2)

### Epic 2.1: Trip CRUD Operations

#### Task 2.1.1: User Story - Create a New Trip
**Type:** User Story  
**User Story:** As a user, I want to create a new trip so that I can start planning my packing.  
**Definition of Done:**
- [ ] POST /trips endpoint implemented
- [ ] Request body validated with Pydantic schema (name, start_date, end_date required)
- [ ] Trip saved to database with generated UUID
- [ ] 201 Created status returned with trip data
- [ ] 400 Bad Request for invalid data (e.g., end_date before start_date)
- [ ] Response includes all trip fields including calculated duration
- [ ] Basic test for endpoint

#### Task 2.1.2: User Story - View All My Trips
**Type:** User Story  
**User Story:** As a user, I want to see all my trips so that I can manage them.  
**Definition of Done:**
- [ ] GET /trips endpoint implemented
- [ ] Returns list of all trips sorted by start_date descending
- [ ] Response uses TripResponse schema
- [ ] Empty list returned when no trips exist
- [ ] Basic test with multiple trips

#### Task 2.1.3: User Story - View Trip Details
**Type:** User Story  
**User Story:** As a user, I want to view details of a specific trip including its duration and date breakdown.  
**Definition of Done:**
- [ ] GET /trips/{trip_id} endpoint implemented
- [ ] Returns single trip with calculated fields (duration_days, date_list with day names)
- [ ] 404 Not Found for non-existent trip
- [ ] Response includes nested luggage count
- [ ] Date list formatted as: ["2024-03-01 (Friday)", "2024-03-02 (Saturday)", ...]
- [ ] Test for success and 404 cases

#### Task 2.1.4: User Story - Update Trip Information
**Type:** User Story  
**User Story:** As a user, I want to update my trip details when plans change.  
**Definition of Done:**
- [ ] PUT /trips/{trip_id} endpoint implemented
- [ ] Partial updates supported (PATCH-like behavior)
- [ ] Validation for date changes (end >= start)
- [ ] Updated_at timestamp automatically updated
- [ ] 404 for non-existent trip
- [ ] 400 for invalid date ranges
- [ ] Returns updated trip data

#### Task 2.1.5: User Story - Delete a Trip
**Type:** User Story  
**User Story:** As a user, I want to delete trips I no longer need.  
**Definition of Done:**
- [ ] DELETE /trips/{trip_id} endpoint implemented
- [ ] 204 No Content on successful deletion
- [ ] 404 for non-existent trip
- [ ] Cascade deletes all related luggage and items

---

### Epic 2.2: Trip Business Logic

#### Task 2.2.1: Implement Date Calculation Service
**Type:** Task  
**Definition of Done:**
- [ ] Service class/module created for date calculations
- [ ] Calculate duration in days (inclusive)
- [ ] Generate list of dates between start and end
- [ ] Format dates with day names
- [ ] Unit tests cover basic cases

---

## Phase 3: Luggage Management API (Week 3)

### Epic 3.1: Luggage CRUD Operations

#### Task 3.1.1: User Story - Add Luggage to Trip
**Type:** User Story  
**User Story:** As a user, I want to add luggage containers to my trip to organize my packing.  
**Definition of Done:**
- [ ] POST /trips/{trip_id}/luggage endpoint implemented
- [ ] Validates trip exists before creating luggage
- [ ] Luggage name required and validated (not empty)
- [ ] 404 if trip doesn't exist
- [ ] 201 Created with luggage data
- [ ] Can create multiple luggage items for same trip

#### Task 3.1.2: User Story - List Luggage for Trip
**Type:** User Story  
**User Story:** As a user, I want to see all luggage for a specific trip.  
**Definition of Done:**
- [ ] GET /trips/{trip_id}/luggage endpoint implemented
- [ ] Returns all luggage for the specified trip
- [ ] 404 if trip doesn't exist
- [ ] Empty list if no luggage exists

#### Task 3.1.3: User Story - Update Luggage
**Type:** User Story  
**User Story:** As a user, I want to rename my luggage containers.  
**Definition of Done:**
- [ ] PUT /luggage/{luggage_id} endpoint implemented
- [ ] Can update luggage name
- [ ] 404 for non-existent luggage
- [ ] Returns updated luggage data

#### Task 3.1.4: User Story - Delete Luggage
**Type:** User Story  
**User Story:** As a user, I want to remove luggage I no longer need.  
**Definition of Done:**
- [ ] DELETE /luggage/{luggage_id} endpoint implemented
- [ ] 204 No Content on successful deletion
- [ ] 404 for non-existent luggage
- [ ] Cascade deletes all items in the luggage

---

## Phase 4: Item Management & Core Functionality (Week 4-5)

### Epic 4.1: Item CRUD Operations

#### Task 4.1.1: User Story - Add Item to Luggage
**Type:** User Story  
**User Story:** As a user, I want to add items to my luggage.  
**Definition of Done:**
- [ ] POST /luggage/{luggage_id}/items endpoint implemented
- [ ] Item name and quantity required
- [ ] Default status is UNPACKED
- [ ] 404 if luggage doesn't exist
- [ ] 201 Created with item data

#### Task 4.1.2: User Story - List Items in Luggage
**Type:** User Story  
**User Story:** As a user, I want to see all items in a specific luggage.  
**Definition of Done:**
- [ ] GET /luggage/{luggage_id}/items endpoint implemented
- [ ] Returns all items for the specified luggage
- [ ] 404 if luggage doesn't exist
- [ ] Empty list if no items exist

#### Task 4.1.3: User Story - Update Item Details
**Type:** User Story  
**User Story:** As a user, I want to update item details like name and quantity.  
**Definition of Done:**
- [ ] PUT /items/{item_id} endpoint implemented
- [ ] Can update name and quantity
- [ ] 404 for non-existent item
- [ ] Returns updated item data

#### Task 4.1.4: User Story - Delete Item
**Type:** User Story  
**User Story:** As a user, I want to remove items from my luggage.  
**Definition of Done:**
- [ ] DELETE /items/{item_id} endpoint implemented
- [ ] 204 No Content on successful deletion
- [ ] 404 for non-existent item

---

### Epic 4.2: Item Status Management

#### Task 4.2.1: User Story - Update Item Packing Status
**Type:** User Story  
**User Story:** As a user, I want to update the status of items as I pack them.  
**Definition of Done:**
- [ ] PATCH /items/{item_id}/status endpoint implemented
- [ ] Status enum validated (UNPACKED, PACKED, TO_BUY)
- [ ] 404 for non-existent item
- [ ] 400 for invalid status value
- [ ] Returns updated item

#### Task 4.2.2: User Story - Move Item Between Luggage
**Type:** User Story  
**User Story:** As a user, I want to move items between luggage containers within the same trip.  
**Definition of Done:**
- [ ] PATCH /items/{item_id}/move endpoint implemented
- [ ] Request body contains target_luggage_id
- [ ] Validates item and target luggage exist
- [ ] Validates target luggage belongs to same trip as source
- [ ] 400 Bad Request if moving to luggage in different trip
- [ ] Returns updated item with new luggage_id

---

## Phase 5: Trip Overview & Filtering (Week 6)

### Epic 5.1: Trip Overview Features

#### Task 5.1.1: User Story - View Complete Trip Packing Status
**Type:** User Story  
**User Story:** As a user, I want to see a complete overview of my trip's packing status at a glance.  
**Definition of Done:**
- [ ] GET /trips/{trip_id}/overview endpoint implemented
- [ ] Response includes trip details with nested luggage and items
- [ ] Status summary included (counts by status type)
- [ ] Packing percentage calculated (packed items / total items)
- [ ] Items to buy highlighted separately

#### Task 5.1.2: User Story - Filter Items by Status
**Type:** User Story  
**User Story:** As a user, I want to filter items by their packing status.  
**Definition of Done:**
- [ ] GET /trips/{trip_id}/items?status=UNPACKED endpoint implemented
- [ ] Supports filtering by any status (UNPACKED, PACKED, TO_BUY)
- [ ] Returns all items across all luggage for the trip with specified status
- [ ] 404 if trip doesn't exist

---

## Phase 6: Testing & Documentation (Week 7)

### Epic 6.1: Testing

#### Task 6.1.1: Create Unit Tests for Models
**Type:** Task  
**Definition of Done:**
- [ ] Test Trip model validation
- [ ] Test Luggage model relationships
- [ ] Test Item model with status enum
- [ ] Test cascade deletions

#### Task 6.1.2: Create Integration Tests for API
**Type:** Task  
**Definition of Done:**
- [ ] Test all Trip endpoints
- [ ] Test all Luggage endpoints
- [ ] Test all Item endpoints
- [ ] Test complex workflows (create trip → add luggage → add items → update status)

---

### Epic 6.2: Documentation

#### Task 6.2.1: Create API Documentation
**Type:** Task  
**Definition of Done:**
- [ ] FastAPI auto-documentation reviewed and working
- [ ] README updated with API usage examples
- [ ] Setup instructions clear and complete

---

## Phase 7: User Interface Development (Week 8)

### Epic 7.1: Basic UI Setup

#### Task 7.1.1: Set Up Frontend Structure
**Type:** Task  
**Definition of Done:**
- [ ] Decide on approach (vanilla JS or simple framework)
- [ ] Create static files directory in FastAPI
- [ ] Set up basic HTML template
- [ ] Configure FastAPI to serve static files

#### Task 7.1.2: Create Trip Management UI
**Type:** Task  
**Definition of Done:**
- [ ] List all trips on home page
- [ ] Form to create new trip
- [ ] Button to delete trips
- [ ] Click trip to view details

#### Task 7.1.3: Create Luggage Management UI
**Type:** Task  
**Definition of Done:**
- [ ] Show luggage for selected trip
- [ ] Form to add new luggage
- [ ] Button to delete luggage
- [ ] Click luggage to view items

#### Task 7.1.4: Create Item Management UI
**Type:** Task  
**Definition of Done:**
- [ ] Show items for selected luggage
- [ ] Form to add new items
- [ ] Buttons to update item status
- [ ] Button to delete items
- [ ] Visual indication of item status (colors/icons)

#### Task 7.1.5: Create Trip Overview Page
**Type:** Task  
**Definition of Done:**
- [ ] Display complete trip overview
- [ ] Show packing progress
- [ ] List items by status
- [ ] Basic responsive design for mobile use
