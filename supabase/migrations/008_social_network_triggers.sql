-- Migration 008: Triggers and Functions for Social Network

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for posts
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for comments
DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REACTION COUNTS MAINTENANCE
-- ============================================

CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Ensure row exists in counts table
        INSERT INTO post_reaction_counts (post_id)
        VALUES (NEW.post_id)
        ON CONFLICT (post_id) DO NOTHING;
        
        -- Increment counts
        UPDATE post_reaction_counts
        SET 
            like_count = like_count + CASE WHEN NEW.reaction_type = 'like' THEN 1 ELSE 0 END,
            celebrate_count = celebrate_count + CASE WHEN NEW.reaction_type = 'celebrate' THEN 1 ELSE 0 END,
            support_count = support_count + CASE WHEN NEW.reaction_type = 'support' THEN 1 ELSE 0 END,
            love_count = love_count + CASE WHEN NEW.reaction_type = 'love' THEN 1 ELSE 0 END,
            insightful_count = insightful_count + CASE WHEN NEW.reaction_type = 'insightful' THEN 1 ELSE 0 END,
            total_count = total_count + 1
        WHERE post_id = NEW.post_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update counts when reaction type changes
        UPDATE post_reaction_counts
        SET 
            like_count = like_count 
                - CASE WHEN OLD.reaction_type = 'like' THEN 1 ELSE 0 END 
                + CASE WHEN NEW.reaction_type = 'like' THEN 1 ELSE 0 END,
            celebrate_count = celebrate_count 
                - CASE WHEN OLD.reaction_type = 'celebrate' THEN 1 ELSE 0 END 
                + CASE WHEN NEW.reaction_type = 'celebrate' THEN 1 ELSE 0 END,
            support_count = support_count 
                - CASE WHEN OLD.reaction_type = 'support' THEN 1 ELSE 0 END 
                + CASE WHEN NEW.reaction_type = 'support' THEN 1 ELSE 0 END,
            love_count = love_count 
                - CASE WHEN OLD.reaction_type = 'love' THEN 1 ELSE 0 END 
                + CASE WHEN NEW.reaction_type = 'love' THEN 1 ELSE 0 END,
            insightful_count = insightful_count 
                - CASE WHEN OLD.reaction_type = 'insightful' THEN 1 ELSE 0 END 
                + CASE WHEN NEW.reaction_type = 'insightful' THEN 1 ELSE 0 END
        WHERE post_id = NEW.post_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement counts
        UPDATE post_reaction_counts
        SET 
            like_count = like_count - CASE WHEN OLD.reaction_type = 'like' THEN 1 ELSE 0 END,
            celebrate_count = celebrate_count - CASE WHEN OLD.reaction_type = 'celebrate' THEN 1 ELSE 0 END,
            support_count = support_count - CASE WHEN OLD.reaction_type = 'support' THEN 1 ELSE 0 END,
            love_count = love_count - CASE WHEN OLD.reaction_type = 'love' THEN 1 ELSE 0 END,
            insightful_count = insightful_count - CASE WHEN OLD.reaction_type = 'insightful' THEN 1 ELSE 0 END,
            total_count = total_count - 1
        WHERE post_id = OLD.post_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_reaction_counts ON post_reactions;
CREATE TRIGGER maintain_reaction_counts
    AFTER INSERT OR UPDATE OR DELETE ON post_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_reaction_counts();

-- ============================================
-- FOLLOW COUNTS MAINTENANCE
-- ============================================

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment following count for follower
        UPDATE profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        -- Increment follower count for following
        UPDATE profiles 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.following_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement following count for follower
        UPDATE profiles 
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
        
        -- Decrement follower count for following
        UPDATE profiles 
        SET follower_count = GREATEST(0, follower_count - 1)
        WHERE id = OLD.following_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_follow_counts ON follows;
CREATE TRIGGER maintain_follow_counts
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- ============================================
-- POST COUNT MAINTENANCE
-- ============================================

CREATE OR REPLACE FUNCTION update_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET post_count = post_count + 1 
        WHERE id = NEW.author_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET post_count = GREATEST(0, post_count - 1)
        WHERE id = OLD.author_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- If post is soft deleted, decrement count
        IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
            UPDATE profiles 
            SET post_count = GREATEST(0, post_count - 1)
            WHERE id = NEW.author_id;
        -- If post is undeleted, increment count
        ELSIF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
            UPDATE profiles 
            SET post_count = post_count + 1 
            WHERE id = NEW.author_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_post_count ON posts;
CREATE TRIGGER maintain_post_count
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_count();

-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================
-- DISABLED: notifications table doesn't have post_id, comment_id columns
-- These can be re-enabled later if notifications schema is updated

-- -- Notify on new reaction
-- CREATE OR REPLACE FUNCTION notify_on_reaction()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     post_author_id UUID;
--     actor_name TEXT;
-- BEGIN
--     -- Get post author
--     SELECT author_id INTO post_author_id 
--     FROM posts 
--     WHERE id = NEW.post_id;
--     
--     -- Don't notify self-reactions
--     IF post_author_id != NEW.user_id THEN
--         -- Get actor name
--         SELECT display_name INTO actor_name 
--         FROM profiles 
--         WHERE id = NEW.user_id;
--         
--         -- Create notification
--         INSERT INTO notifications (user_id, type, actor_id, post_id, title, body, link)
--         VALUES (
--             post_author_id,
--             'reaction',
--             NEW.user_id,
--             NEW.post_id,
--             'New Reaction',
--             actor_name || ' reacted to your post',
--             '/app/post/' || NEW.post_id
--         );
--     END IF;
--     
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- DROP TRIGGER IF EXISTS notify_reaction ON post_reactions;
-- CREATE TRIGGER notify_reaction
--     AFTER INSERT ON post_reactions
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_on_reaction();

-- -- Notify on new comment
-- CREATE OR REPLACE FUNCTION notify_on_comment()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     post_author_id UUID;
--     actor_name TEXT;
-- BEGIN
--     -- Get post author
--     SELECT author_id INTO post_author_id 
--     FROM posts 
--     WHERE id = NEW.post_id;
--     
--     -- Don't notify self-comments
--     IF post_author_id != NEW.author_id THEN
--         -- Get actor name
--         SELECT display_name INTO actor_name 
--         FROM profiles 
--         WHERE id = NEW.author_id;
--         
--         -- Create notification
--         INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, title, body, link)
--         VALUES (
--             post_author_id,
--             'comment',
--             NEW.author_id,
--             NEW.post_id,
--             NEW.id,
--             'New Comment',
--             actor_name || ' commented on your post',
--             '/app/post/' || NEW.post_id
--         );
--     END IF;
--     
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- DROP TRIGGER IF EXISTS notify_comment ON comments;
-- CREATE TRIGGER notify_comment
--     AFTER INSERT ON comments
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_on_comment();

-- -- Notify on new follow
-- CREATE OR REPLACE FUNCTION notify_on_follow()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     follower_name TEXT;
-- BEGIN
--     -- Get follower name
--     SELECT display_name INTO follower_name 
--     FROM profiles 
--     WHERE id = NEW.follower_id;
--     
--     -- Create notification
--     INSERT INTO notifications (user_id, type, actor_id, title, body, link)
--     VALUES (
--         NEW.following_id,
--         'follow',
--         NEW.follower_id,
--         'New Follower',
--         follower_name || ' started following you',
--         '/app/profile/' || NEW.follower_id
--     );
--     
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- DROP TRIGGER IF EXISTS notify_follow ON follows;
-- CREATE TRIGGER notify_follow
--     AFTER INSERT ON follows
--     FOR EACH ROW
--     EXECUTE FUNCTION notify_on_follow();
