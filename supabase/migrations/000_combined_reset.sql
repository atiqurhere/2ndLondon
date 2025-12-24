-- ============================================
-- COMPLETE DATABASE RESET SCRIPT
-- ============================================
-- WARNING: This will DELETE ALL DATA and tables
-- Run this BEFORE running migrations 001-011
-- ============================================

-- Drop all triggers FIRST (before tables)
DROP TRIGGER IF EXISTS on_application_status_updated ON applications;
DROP TRIGGER IF EXISTS on_application_created ON applications;
DROP TRIGGER IF EXISTS update_post_reaction_counts_trigger ON post_reactions;
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;

-- Drop all functions
DROP FUNCTION IF EXISTS notify_on_application_status_change() CASCADE;
DROP FUNCTION IF EXISTS notify_on_application() CASCADE;
DROP FUNCTION IF EXISTS update_post_reaction_counts() CASCADE;
DROP FUNCTION IF EXISTS update_comment_count() CASCADE;
DROP FUNCTION IF EXISTS get_post_detail(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_feed_posts(int, int) CASCADE;
DROP FUNCTION IF EXISTS get_user_posts(uuid, int, int) CASCADE;
DROP FUNCTION IF EXISTS get_saved_posts(int, int) CASCADE;
DROP FUNCTION IF EXISTS get_feed(double precision, double precision, text, int, int, boolean) CASCADE;
DROP FUNCTION IF EXISTS get_distance_band(double precision, double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS can_create_moment(uuid) CASCADE;
DROP FUNCTION IF EXISTS can_apply(uuid) CASCADE;

-- Drop all views
DROP VIEW IF EXISTS public_moments CASCADE;
DROP VIEW IF EXISTS post_comment_counts CASCADE;

-- Drop all tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS post_saves CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS post_reaction_counts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_attachments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS moments CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- RESET COMPLETE
-- ============================================
-- Next steps:
-- 1. Run migrations 001-011 in order
-- 2. Create storage buckets if needed:
--    - post_attachments
--    - avatars
-- ============================================
