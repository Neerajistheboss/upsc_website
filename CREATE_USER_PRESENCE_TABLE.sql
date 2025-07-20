-- Create user_presence table for real-time online status
CREATE TABLE IF NOT EXISTS public.user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_online BOOLEAN DEFAULT false NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON public.user_presence(is_online);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON public.user_presence(last_seen);

-- Enable real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- RLS Policies

-- Allow anyone (including anonymous users) to read online users (for community display)
CREATE POLICY "Allow read access to online users" ON public.user_presence
    FOR SELECT
    USING (is_online = true);

-- Allow users to update their own presence
CREATE POLICY "Allow users to update own presence" ON public.user_presence
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert their own presence
CREATE POLICY "Allow users to insert own presence" ON public.user_presence
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own presence
CREATE POLICY "Allow users to delete own presence" ON public.user_presence
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON public.user_presence 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old offline records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_presence 
    WHERE is_online = false 
    AND last_seen < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old records (optional - requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-presence', '0 */6 * * *', 'SELECT cleanup_old_presence();');

-- Function to mark users as offline if they haven't been seen in 1 minute
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
    UPDATE public.user_presence 
    SET is_online = false 
    WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to mark inactive users offline (optional - requires pg_cron extension)
-- SELECT cron.schedule('mark-inactive-offline', '*/1 * * * *', 'SELECT mark_inactive_users_offline();');

-- Grant necessary permissions
GRANT ALL ON public.user_presence TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 