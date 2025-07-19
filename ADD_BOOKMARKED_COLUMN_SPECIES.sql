-- Add bookmarked column to existing species_in_news table
-- Run this SQL in your Supabase SQL Editor if you already have the table

-- Add the bookmarked column if it doesn't exist
ALTER TABLE species_in_news 
ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN DEFAULT FALSE;

-- Update existing records to have bookmarked = false
UPDATE species_in_news 
SET bookmarked = FALSE 
WHERE bookmarked IS NULL;

-- Create index for better performance on bookmarked queries
CREATE INDEX IF NOT EXISTS idx_species_in_news_bookmarked ON species_in_news(bookmarked);

-- Optional: Create a view for bookmarked species only
CREATE OR REPLACE VIEW bookmarked_species AS
SELECT * FROM species_in_news 
WHERE bookmarked = TRUE 
ORDER BY name ASC;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'species_in_news' 
AND column_name = 'bookmarked';

-- Show sample data with bookmarked column
SELECT name, scientific_name, bookmarked 
FROM species_in_news 
LIMIT 5; 