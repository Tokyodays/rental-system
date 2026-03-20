-- Create tables for Bike Rental System

-- 1. stores
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. profiles (linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. vehicle_categories
CREATE TABLE vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    name TEXT NOT NULL -- 'car', 'bike', 'bicycle'
);

-- 4. vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    category_id UUID REFERENCES vehicle_categories(id),
    name TEXT NOT NULL,
    plate_number TEXT,
    mileage INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'rented', 'maintenance'
    qr_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    name TEXT NOT NULL,
    passport_number TEXT,
    license_number TEXT,
    passport_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    vehicle_id UUID REFERENCES vehicles(id),
    customer_id UUID REFERENCES customers(id),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' -- 'active', 'cancelled', 'completed'
);

-- 7. rentals
CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    vehicle_id UUID REFERENCES vehicles(id),
    customer_id UUID REFERENCES customers(id),
    start_datetime TIMESTAMPTZ DEFAULT NOW(),
    end_datetime TIMESTAMPTZ,
    start_mileage INTEGER NOT NULL,
    end_mileage INTEGER,
    status TEXT NOT NULL DEFAULT 'ongoing' -- 'ongoing', 'returned'
);

-- Create RLS (Row Level Security) policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Note: Policies need to be more specific based on store_id and user's profile store_id.
-- For simplicity in this free-tier demo, we'll allow authenticated users to access their store's data.

CREATE POLICY "Users can access their own store data" ON stores
    FOR ALL USING (id IN (SELECT store_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access their own profile" ON profiles
    FOR ALL USING (id = auth.uid());

-- Add similar policies for other tables...
