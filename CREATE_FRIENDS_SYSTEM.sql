    -- Create Friends System Tables
    -- This script sets up the complete friends system with friend requests and connections

    -- 1. Create friend_requests table
    CREATE TABLE IF NOT EXISTS friend_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(sender_id, receiver_id)
    );

    -- 2. Create friends table (for accepted connections)
    CREATE TABLE IF NOT EXISTS friends (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, friend_id),
        CHECK (user_id != friend_id)
    );

    -- 3. Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
    CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
    CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

    -- 4. Enable Row Level Security (RLS)
    ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

    -- 5. Create RLS policies for friend_requests
    -- Users can see requests they sent or received
    CREATE POLICY "Users can view their own friend requests" ON friend_requests
        FOR SELECT USING (
            auth.uid() = sender_id OR auth.uid() = receiver_id
        );

    -- Users can insert friend requests
    CREATE POLICY "Users can send friend requests" ON friend_requests
        FOR INSERT WITH CHECK (
            auth.uid() = sender_id AND sender_id != receiver_id
        );

    -- Users can update requests they received (accept/reject)
    CREATE POLICY "Users can respond to friend requests" ON friend_requests
        FOR UPDATE USING (
            auth.uid() = receiver_id
        );

    -- Users can delete their own requests
    CREATE POLICY "Users can cancel their own requests" ON friend_requests
        FOR DELETE USING (
            auth.uid() = sender_id
        );

    -- 6. Create RLS policies for friends
    -- Users can see their friends
    CREATE POLICY "Users can view their friends" ON friends
        FOR SELECT USING (
            auth.uid() = user_id OR auth.uid() = friend_id
        );

    -- Users can add friends (through triggers)
    CREATE POLICY "Users can add friends" ON friends
        FOR INSERT WITH CHECK (
            auth.uid() = user_id OR auth.uid() = friend_id
        );

    -- Users can remove friends
    CREATE POLICY "Users can remove friends" ON friends
        FOR DELETE USING (
            auth.uid() = user_id OR auth.uid() = friend_id
        );

    -- 7. Create function to handle friend request acceptance
    CREATE OR REPLACE FUNCTION handle_friend_request_accepted()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Only proceed if status changed to 'accepted'
        IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
            -- Insert into friends table (both directions for easy querying)
            INSERT INTO friends (user_id, friend_id) VALUES (NEW.sender_id, NEW.receiver_id);
            INSERT INTO friends (user_id, friend_id) VALUES (NEW.receiver_id, NEW.sender_id);
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- 8. Create trigger for friend request acceptance
    CREATE TRIGGER friend_request_accepted_trigger
        AFTER UPDATE ON friend_requests
        FOR EACH ROW
        EXECUTE FUNCTION handle_friend_request_accepted();

    -- 9. Create function to get user's friends with profile info
    CREATE OR REPLACE FUNCTION get_user_friends(user_uuid UUID)
    RETURNS TABLE (
        friend_id UUID,
        display_name TEXT,
        email TEXT,
        expert_subject TEXT,
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            f.friend_id,
            p.display_name,
            p.email,
            p.expert_subject,
            p.photo_url,
            f.created_at
        FROM friends f
        JOIN public_profiles p ON f.friend_id = p.id
        WHERE f.user_id = user_uuid
        ORDER BY f.created_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 10. Create function to get user's friend requests
    CREATE OR REPLACE FUNCTION get_user_friend_requests(user_uuid UUID)
    RETURNS TABLE (
        request_id UUID,
        sender_id UUID,
        receiver_id UUID,
        status TEXT,
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        sender_display_name TEXT,
        sender_email TEXT,
        sender_expert_subject TEXT,
        sender_photo_url TEXT
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            fr.id,
            fr.sender_id,
            fr.receiver_id,
            fr.status,
            fr.message,
            fr.created_at,
            p.display_name,
            p.email,
            p.expert_subject,
            p.photo_url
        FROM friend_requests fr
        JOIN public_profiles p ON fr.sender_id = p.id
        WHERE fr.receiver_id = user_uuid AND fr.status = 'pending'
        ORDER BY fr.created_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 11. Create function to get sent friend requests
    CREATE OR REPLACE FUNCTION get_sent_friend_requests(user_uuid UUID)
    RETURNS TABLE (
        request_id UUID,
        sender_id UUID,
        receiver_id UUID,
        status TEXT,
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        receiver_display_name TEXT,
        receiver_email TEXT,
        receiver_expert_subject TEXT,
        receiver_photo_url TEXT
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            fr.id,
            fr.sender_id,
            fr.receiver_id,
            fr.status,
            fr.message,
            fr.created_at,
            p.display_name,
            p.email,
            p.expert_subject,
            p.photo_url
        FROM friend_requests fr
        JOIN public_profiles p ON fr.receiver_id = p.id
        WHERE fr.sender_id = user_uuid AND fr.status = 'pending'
        ORDER BY fr.created_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 12. Create function to check if users are friends
    CREATE OR REPLACE FUNCTION are_users_friends(user1_uuid UUID, user2_uuid UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM friends 
            WHERE (user_id = user1_uuid AND friend_id = user2_uuid) 
            OR (user_id = user2_uuid AND friend_id = user1_uuid)
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 13. Create function to check if friend request exists
    CREATE OR REPLACE FUNCTION get_friend_request_status(user1_uuid UUID, user2_uuid UUID)
    RETURNS TEXT AS $$
    DECLARE
        request_status TEXT;
    BEGIN
        SELECT status INTO request_status
        FROM friend_requests
        WHERE (sender_id = user1_uuid AND receiver_id = user2_uuid)
        OR (sender_id = user2_uuid AND receiver_id = user1_uuid)
        LIMIT 1;
        
        RETURN COALESCE(request_status, 'none');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant necessary permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT ALL ON friend_requests TO authenticated;
    GRANT ALL ON friends TO authenticated;
    GRANT EXECUTE ON FUNCTION get_user_friends(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_user_friend_requests(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_sent_friend_requests(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION are_users_friends(UUID, UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION get_friend_request_status(UUID, UUID) TO authenticated;

    -- Insert some sample data for testing (optional)
    -- INSERT INTO friend_requests (sender_id, receiver_id, message) VALUES 
    -- ('user-uuid-1', 'user-uuid-2', 'Hey! Would love to connect and study together!'); 