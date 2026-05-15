-- Create custom types
CREATE TYPE listing_condition AS ENUM ('new', 'used', 'refurbished');

-- Create listings table
CREATE TABLE listings (
    id TEXT PRIMARY KEY,
    -- seller_id UUID REFERENCES auth.users(id), -- Uncomment when Auth is ready
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    price NUMERIC,
    currency TEXT DEFAULT 'USD',
    hours_used INTEGER,
    horsepower INTEGER,
    condition listing_condition NOT NULL,
    location TEXT,
    country TEXT,
    description TEXT NOT NULL,
    transmission TEXT,
    drive_type TEXT,
    details JSONB,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create inquiries table
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) setup
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to listings
CREATE POLICY "Public listings are viewable by everyone."
ON listings FOR SELECT
USING (true);

-- Allow public to insert inquiries
CREATE POLICY "Public can insert inquiries."
ON inquiries FOR INSERT
WITH CHECK (true);

-- (Sellers can manage their own listings policy will go here later)
