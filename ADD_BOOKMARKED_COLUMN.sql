-- Add bookmarked column to existing current_affairs table
-- Run this SQL in your Supabase SQL Editor if you already have the table

ALTER TABLE current_affairs 
ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN DEFAULT FALSE;

-- Update existing records to have bookmarked = false
UPDATE current_affairs 
SET bookmarked = FALSE 
WHERE bookmarked IS NULL;

-- Create index for better performance on bookmarked queries
CREATE INDEX IF NOT EXISTS idx_current_affairs_bookmarked ON current_affairs(bookmarked);

-- Optional: Create a view for bookmarked items only
CREATE OR REPLACE VIEW bookmarked_current_affairs AS
SELECT * FROM current_affairs 
WHERE bookmarked = TRUE 
ORDER BY date DESC, created_at DESC; 