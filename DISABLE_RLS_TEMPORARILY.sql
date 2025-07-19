-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor if you're having issues with data not showing up

-- Disable RLS on species_in_news table
ALTER TABLE species_in_news DISABLE ROW LEVEL SECURITY;

-- Verify the table has data
SELECT COUNT(*) FROM species_in_news;

-- Check a few sample records
SELECT name, scientific_name, iucn_status FROM species_in_news LIMIT 5;

-- If you want to re-enable RLS later, run:
-- ALTER TABLE species_in_news ENABLE ROW LEVEL SECURITY; 