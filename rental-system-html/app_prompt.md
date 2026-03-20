Create a full-stack web application for a mobility rental management SaaS using Nuxt.js and Supabase. The application must be production-ready but optimized for free-tier usage only.

【Tech Stack Requirements】

* Framework: Nuxt.js (latest version, composition API)
* Styling: Tailwind CSS
* Backend: Supabase
* Authentication: Supabase Auth (email/password login)
* Database: Supabase PostgreSQL
* Storage: Supabase Storage (for customer passport images)
* Deployment must be compatible with free-tier environments
* No offline support required
* Language: English only (prepare structure for future i18n support)

---

【Core Concept】
This system is a multi-category mobility rental management tool supporting cars, bikes, and bicycles.
Each vehicle has a unique QR code.
Scanning a QR code triggers rental or return transactions.

---

【Database Schema Requirements】

Tables:

1. stores

* id (uuid, pk)
* name
* created_at

2. profiles

* id (uuid, pk, linked to auth.users)
* store_id (fk)
* created_at

3. vehicle_categories

* id (uuid, pk)
* store_id (fk)
* name (car, bike, bicycle)

4. vehicles

* id (uuid, pk)
* store_id (fk)
* category_id (fk)
* name
* plate_number (nullable)
* mileage (integer)
* status (available, reserved, rented, maintenance)
* qr_code (string, unique)

5. customers

* id (uuid, pk)
* store_id (fk)
* name
* passport_number
* license_number
* passport_image_url
* created_at

6. reservations

* id (uuid, pk)
* store_id (fk)
* vehicle_id (fk)
* customer_id (fk)
* start_datetime
* end_datetime
* status (active, cancelled, completed)

7. rentals

* id (uuid, pk)
* store_id (fk)
* vehicle_id (fk)
* customer_id (fk)
* start_datetime
* end_datetime
* start_mileage
* end_mileage
* status (ongoing, returned)

---

【Authentication Flow】

* Use Supabase Auth (email/password)
* After login, fetch profile and store_id
* Protect all routes except login
* Use middleware for auth guard

---

【Main Features】

1. Dashboard

* Show counts of vehicles by status
* Show today's rentals and returns
* Provide quick access to QR scanner

2. QR Scanner

* Use device camera
* Scan QR code to identify vehicle
* Fetch vehicle by qr_code
* Auto-navigate based on vehicle status:

  * available → rental screen
  * rented → return screen
  * reserved → reservation info

3. Rental Flow

* Select or confirm customer
* Input start mileage
* Create rental record
* Update vehicle status to rented

4. Return Flow

* Input end mileage
* Calculate mileage difference
* Update rental record
* Update vehicle status to available or maintenance

5. Vehicle Management

* List vehicles with filters (category, status)
* Create/edit vehicles
* Generate QR code per vehicle

6. Customer Management

* CRUD customers
* Upload passport image to Supabase Storage

7. Reservation Management

* Create reservation
* Link customer and vehicle
* Manage status

---

【UI Requirements】

* Tablet-friendly responsive design
* Sidebar navigation (dashboard, scanner, vehicles, customers, reservations)
* Topbar with user menu
* Use card-based layout
* Use status badges with colors:

  * available: green
  * reserved: blue
  * rented: red
  * maintenance: orange

---

【Constraints】

* Must work entirely within Supabase free tier
* Avoid heavy real-time subscriptions unless necessary
* Optimize queries (use indexes where needed)
* No external paid services
* Keep architecture simple and maintainable

---

【Code Structure】

* Use composables for Supabase logic
* Separate API logic from UI components
* Use reusable components (Table, Modal, Form)
* Use TypeScript

---

【Future-ready】

* Prepare for i18n (do not hardcode strings deeply)
* Prepare for multi-store expansion

---

Generate the full project structure, database setup, and core UI pages based on the above requirements.

---
