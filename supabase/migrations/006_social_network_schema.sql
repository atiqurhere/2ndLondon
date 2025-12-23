-- Migration 006: Social Network Features
-- Adds LinkedIn-style posts, reactions, comments, and follows

-- ============================================
-- PROFILE EXTENSIONS
-- ============================================

-- Add social profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add social stats
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS post_count INTEGER NOT NULL DEFAULT 0;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 3000),
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    link_image_url TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id) WHERE is_deleted = FALSE;

-- ============================================
-- POST ATTACHMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS post_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES profiles(id),
    bucket_id TEXT NOT NULL DEFAULT 'post_attachments',
    object_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for post attachments
CREATE INDEX IF NOT EXISTS idx_post_attachments_post ON post_attachments(post_id);

-- ============================================
-- POST REACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS post_reactions (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like','celebrate','support','love','insightful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Indexes for reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);

-- ============================================
-- POST REACTION COUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS post_reaction_counts (
    post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    like_count INTEGER NOT NULL DEFAULT 0,
    celebrate_count INTEGER NOT NULL DEFAULT 0,
    support_count INTEGER NOT NULL DEFAULT 0,
    love_count INTEGER NOT NULL DEFAULT 0,
    insightful_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    body TEXT NOT NULL CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 1500),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- ============================================
-- POST SAVES/BOOKMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS post_saves (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- Index for saved posts
CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id, created_at DESC);

-- ============================================
-- COMMENT COUNTS VIEW
-- ============================================

CREATE OR REPLACE VIEW post_comment_counts AS
SELECT 
    post_id,
    COUNT(*) as comment_count
FROM comments
WHERE is_deleted = FALSE
GROUP BY post_id;
