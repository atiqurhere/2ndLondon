-- COMPLETE DATABASE RESET AND MIGRATION
-- Run this single file to set up everything from scratch

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES (from migration 001)
-- ============================================

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  headline TEXT,
  about TEXT,
  skills TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '[]',
  email TEXT,
  phone TEXT,
  interests TEXT[] DEFAULT '{}',
  home_area TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  trust_level INTEGER NOT NULL DEFAULT 0 CHECK (trust_level >= 0 AND trust_level <= 5),
  rating_avg NUMERIC NOT NULL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_location ON profiles USING GIST(ST_MakePoint(lng, lat));

-- Moments table
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('need', 'offer', 'free', 'swap')),
  title TEXT NOT NULL CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 100),
  description TEXT NOT NULL CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 1000),
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  reward_type TEXT NOT NULL CHECK (reward_type IN ('cash', 'swap', 'free', 'none')),
  reward_amount NUMERIC CHECK (reward_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'GBP',
  approx_area TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_m INTEGER NOT NULL DEFAULT 1500 CHECK (radius_m >= 500 AND radius_m <= 10000),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired', 'cancelled')),
  requires_verified BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_mode BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_moments_location ON moments USING GIST(ST_MakePoint(lng, lat));
CREATE INDEX idx_moments_status_expires ON moments(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_moments_creator ON moments(creator_id);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (LENGTH(message) >= 1 AND LENGTH(message) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(moment_id, applicant_id)
);

CREATE INDEX idx_applications_moment ON applications(moment_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  other_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, other_id),
  CONSTRAINT no_self_conversation CHECK (creator_id != other_id)
);

CREATE INDEX idx_conversations_participants ON conversations(creator_id, other_id);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 1000),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (comment IS NULL OR LENGTH(comment) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewee_id, moment_id)
);

-- Roles table
CREATE TABLE roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- ============================================
-- SOCIAL NETWORK TABLES (from migration 006)
-- ============================================

CREATE TABLE posts (
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

CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_posts_author ON posts(author_id) WHERE is_deleted = FALSE;

CREATE TABLE post_attachments (
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

CREATE INDEX idx_post_attachments_post ON post_attachments(post_id);

CREATE TABLE post_reactions (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like','celebrate','support','love','insightful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON post_reactions(user_id);

CREATE TABLE post_reaction_counts (
    post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    like_count INTEGER NOT NULL DEFAULT 0,
    celebrate_count INTEGER NOT NULL DEFAULT 0,
    support_count INTEGER NOT NULL DEFAULT 0,
    love_count INTEGER NOT NULL DEFAULT 0,
    insightful_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    body TEXT NOT NULL CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 1500),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_author ON comments(author_id);

CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);

CREATE TABLE post_saves (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_post_saves_user ON post_saves(user_id, created_at DESC);

-- ============================================
-- NOTIFICATIONS, BLOCKS, REPORTS (from migration 011)
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    blocked_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_blocks_user_id ON blocks(user_id);
CREATE INDEX idx_blocks_blocked_user_id ON blocks(blocked_user_id);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (category IN ('spam', 'harassment', 'inappropriate', 'scam', 'fake', 'other')),
    CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'))
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Continue in next file due to length...
