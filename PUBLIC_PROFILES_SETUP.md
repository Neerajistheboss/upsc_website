# Public Profiles Setup

This guide will help you set up the public profiles feature for the UPSC community.

## Database Setup

### 1. Create the public_profiles table

Run the SQL script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of CREATE_PUBLIC_PROFILES_TABLE.sql
```

Or execute the following commands in your Supabase SQL editor:

```sql
-- Create public_profiles table
CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  about TEXT,
  expert_subject TEXT,
  target_year TEXT,
  preparing_since TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public_profiles
  FOR DELETE USING (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_public_profiles_expert_subject ON public_profiles(expert_subject);
CREATE INDEX IF NOT EXISTS idx_public_profiles_created_at ON public_profiles(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_public_profiles_updated_at 
  BEFORE UPDATE ON public_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Verify the setup

After running the SQL, you should see:

1. A new `public_profiles` table in your database
2. Row Level Security enabled
3. Policies created for read/write access
4. Indexes for performance
5. Trigger for automatic timestamp updates

## How It Works

### Profile Sync
- When users update their profile and set it to public, it automatically syncs to the `public_profiles` table
- When users make their profile private, it's removed from the `public_profiles` table
- New Google OAuth users are automatically added to public profiles

### Community Features
- The community page fetches profiles from the `public_profiles` table
- Users can search and filter public profiles
- Only public profiles are visible in the community

### Privacy
- Users control their own profile visibility
- Private profiles are not shown in the community
- Users can toggle their profile between public and private

## Testing

1. Create a new account or sign in with Google
2. Go to your profile page
3. Fill in your profile details
4. Make sure "Public Account" is enabled
5. Save your profile
6. Go to the Community page to see your profile

## Troubleshooting

### "User not allowed" error
- Make sure you've run the SQL script to create the table
- Check that Row Level Security policies are in place
- Verify that the `public_profiles` table exists

### Profiles not showing up
- Check that the user has set their profile to public
- Verify that the profile data was synced to the `public_profiles` table
- Check the browser console for any errors

### Permission errors
- Ensure the RLS policies are correctly configured
- Check that users are authenticated when updating profiles 