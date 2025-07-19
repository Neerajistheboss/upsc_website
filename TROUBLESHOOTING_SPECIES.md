# Troubleshooting: Species Data Not Showing Up

## Issue
The species data exists in the database table but is not displaying in the frontend.

## Possible Causes & Solutions

### 1. Row Level Security (RLS) Issue
**Most likely cause**: The table has RLS enabled but the user is not authenticated.

**Solution**: Temporarily disable RLS for testing:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE species_in_news DISABLE ROW LEVEL SECURITY;

-- Verify data exists
SELECT COUNT(*) FROM species_in_news;
SELECT name, scientific_name FROM species_in_news LIMIT 5;
```

### 2. Table Name Mismatch
**Check**: Verify the table name in the database matches the code.

**In the code**: `species_in_news`
**In database**: Should be `species_in_news`

**Solution**: If different, update the code or rename the table.

### 3. Supabase Configuration Issue
**Check**: Verify Supabase URL and API key are correct.

**Solution**: Check `src/lib/supabase.ts` file for correct configuration.

### 4. Data Not Actually Inserted
**Check**: Verify the SQL script was executed successfully.

**Solution**: Run this query in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'species_in_news'
);

-- Check if data exists
SELECT COUNT(*) FROM species_in_news;

-- View sample data
SELECT name, scientific_name, iucn_status FROM species_in_news LIMIT 5;
```

### 5. Network/CORS Issue
**Check**: Open browser developer tools and check the Network tab for failed requests.

**Solution**: Check if there are any CORS or network errors in the console.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check for the debug logs we added

### Step 2: Check Network Tab
1. Go to Network tab in developer tools
2. Refresh the page
3. Look for requests to Supabase
4. Check if they're successful (200 status) or failing

### Step 3: Test Supabase Connection
The page now includes a "Supabase Connection Test" component that will show:
- Connection status
- Table access
- Sample data

### Step 4: Verify Database
Run these queries in Supabase SQL Editor:

```sql
-- Check table structure
\d species_in_news

-- Check data
SELECT * FROM species_in_news LIMIT 3;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'species_in_news';
```

## Quick Fixes

### Fix 1: Disable RLS (Temporary)
```sql
ALTER TABLE species_in_news DISABLE ROW LEVEL SECURITY;
```

### Fix 2: Enable RLS with Public Access
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON species_in_news;

-- Create new policy for public read access
CREATE POLICY "Enable public read access" ON species_in_news
    FOR SELECT USING (true);
```

### Fix 3: Re-run Setup Script
If the table doesn't exist or is empty, re-run the complete setup script:

```sql
-- Run the entire SPECIES_IN_NEWS_SETUP.sql file again
```

## Expected Behavior

After fixing the issue, you should see:
1. Debug info showing species count > 0
2. Supabase test showing "Success! Found X records"
3. Species cards displaying on the page
4. No errors in browser console

## Common Error Messages

- **"relation does not exist"**: Table not created
- **"permission denied"**: RLS blocking access
- **"network error"**: Supabase configuration issue
- **"CORS error"**: Cross-origin request blocked

## After Fixing

Once the data is showing up:
1. Remove the debug components
2. Re-enable RLS if you disabled it
3. Set up proper authentication if needed

## Support

If the issue persists after trying these solutions, check:
1. Supabase project settings
2. API keys and URLs
3. Database permissions
4. Network connectivity 