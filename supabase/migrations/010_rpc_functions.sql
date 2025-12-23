-- Migration 010: RPC Functions for Social Network

-- ============================================
-- GET FEED POSTS
-- ============================================

CREATE OR REPLACE FUNCTION get_feed_posts(
    page_size INT DEFAULT 20,
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_headline TEXT,
    content TEXT,
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    link_image_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    like_count INT,
    celebrate_count INT,
    support_count INT,
    love_count INT,
    insightful_count INT,
    total_reactions INT,
    comment_count BIGINT,
    user_reaction TEXT,
    is_saved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.author_id,
        pr.display_name as author_name,
        pr.username as author_username,
        pr.avatar_url as author_avatar,
        pr.headline as author_headline,
        p.content,
        p.link_url,
        p.link_title,
        p.link_description,
        p.link_image_url,
        p.created_at,
        p.updated_at,
        COALESCE(prc.like_count, 0)::INT as like_count,
        COALESCE(prc.celebrate_count, 0)::INT as celebrate_count,
        COALESCE(prc.support_count, 0)::INT as support_count,
        COALESCE(prc.love_count, 0)::INT as love_count,
        COALESCE(prc.insightful_count, 0)::INT as insightful_count,
        COALESCE(prc.total_count, 0)::INT as total_reactions,
        COUNT(DISTINCT c.id) as comment_count,
        pr_user.reaction_type as user_reaction,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = auth.uid()) as is_saved
    FROM posts p
    INNER JOIN profiles pr ON pr.id = p.author_id
    LEFT JOIN post_reaction_counts prc ON prc.post_id = p.id
    LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = FALSE
    LEFT JOIN post_reactions pr_user ON pr_user.post_id = p.id AND pr_user.user_id = auth.uid()
    WHERE p.is_deleted = FALSE
    GROUP BY p.id, pr.id, prc.post_id, pr_user.reaction_type
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET USER POSTS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_posts(
    target_user_id UUID,
    page_size INT DEFAULT 20,
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_headline TEXT,
    content TEXT,
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    link_image_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    like_count INT,
    celebrate_count INT,
    support_count INT,
    love_count INT,
    insightful_count INT,
    total_reactions INT,
    comment_count BIGINT,
    user_reaction TEXT,
    is_saved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.author_id,
        pr.display_name as author_name,
        pr.username as author_username,
        pr.avatar_url as author_avatar,
        pr.headline as author_headline,
        p.content,
        p.link_url,
        p.link_title,
        p.link_description,
        p.link_image_url,
        p.created_at,
        p.updated_at,
        COALESCE(prc.like_count, 0)::INT as like_count,
        COALESCE(prc.celebrate_count, 0)::INT as celebrate_count,
        COALESCE(prc.support_count, 0)::INT as support_count,
        COALESCE(prc.love_count, 0)::INT as love_count,
        COALESCE(prc.insightful_count, 0)::INT as insightful_count,
        COALESCE(prc.total_count, 0)::INT as total_reactions,
        COUNT(DISTINCT c.id) as comment_count,
        pr_user.reaction_type as user_reaction,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = auth.uid()) as is_saved
    FROM posts p
    INNER JOIN profiles pr ON pr.id = p.author_id
    LEFT JOIN post_reaction_counts prc ON prc.post_id = p.id
    LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = FALSE
    LEFT JOIN post_reactions pr_user ON pr_user.post_id = p.id AND pr_user.user_id = auth.uid()
    WHERE p.is_deleted = FALSE AND p.author_id = target_user_id
    GROUP BY p.id, pr.id, prc.post_id, pr_user.reaction_type
    ORDER BY p.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET POST DETAIL
-- ============================================

CREATE OR REPLACE FUNCTION get_post_detail(post_id UUID)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_name TEXT,
    author_username TEXT,
    author_avatar TEXT,
    author_headline TEXT,
    content TEXT,
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    link_image_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    like_count INT,
    celebrate_count INT,
    support_count INT,
    love_count INT,
    insightful_count INT,
    total_reactions INT,
    comment_count BIGINT,
    user_reaction TEXT,
    is_saved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.author_id,
        pr.display_name as author_name,
        pr.username as author_username,
        pr.avatar_url as author_avatar,
        pr.headline as author_headline,
        p.content,
        p.link_url,
        p.link_title,
        p.link_description,
        p.link_image_url,
        p.created_at,
        p.updated_at,
        COALESCE(prc.like_count, 0)::INT as like_count,
        COALESCE(prc.celebrate_count, 0)::INT as celebrate_count,
        COALESCE(prc.support_count, 0)::INT as support_count,
        COALESCE(prc.love_count, 0)::INT as love_count,
        COALESCE(prc.insightful_count, 0)::INT as insightful_count,
        COALESCE(prc.total_count, 0)::INT as total_reactions,
        COUNT(DISTINCT c.id) as comment_count,
        pr_user.reaction_type as user_reaction,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = auth.uid()) as is_saved
    FROM posts p
    INNER JOIN profiles pr ON pr.id = p.author_id
    LEFT JOIN post_reaction_counts prc ON prc.post_id = p.id
    LEFT JOIN comments c ON c.post_id = p.id AND c.is_deleted = FALSE
    LEFT JOIN post_reactions pr_user ON pr_user.post_id = p.id AND pr_user.user_id = auth.uid()
    WHERE p.id = post_id AND p.is_deleted = FALSE
    GROUP BY p.id, pr.id, prc.post_id, pr_user.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CHECK IF FOLLOWING
-- ============================================

CREATE OR REPLACE FUNCTION is_following(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = auth.uid() 
        AND following_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
