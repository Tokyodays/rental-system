-- 1. Add image_urls array column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 2. Create a bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- Allow authenticated users to upload files to the bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload vehicle photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload vehicle photos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'vehicle-photos');

-- Allow authenticated users to update files in the bucket
DROP POLICY IF EXISTS "Allow authenticated users to update vehicle photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to update vehicle photos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'vehicle-photos');

-- Allow authenticated users to delete files in the bucket
DROP POLICY IF EXISTS "Allow authenticated users to delete vehicle photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete vehicle photos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'vehicle-photos');

-- Allow public access to read files from the bucket
DROP POLICY IF EXISTS "Allow public to view vehicle photos" ON storage.objects;
CREATE POLICY "Allow public to view vehicle photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'vehicle-photos');
