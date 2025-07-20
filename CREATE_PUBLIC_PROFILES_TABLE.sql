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