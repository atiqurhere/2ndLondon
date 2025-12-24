-- Cleanup script for migration 011
-- Run this FIRST if you get "already exists" errors

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_reports_status;
DROP INDEX IF EXISTS idx_reports_created_at;
DROP INDEX IF EXISTS idx_reports_reporter_id;
DROP INDEX IF EXISTS idx_blocks_blocked_user_id;
DROP INDEX IF EXISTS idx_blocks_user_id;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_application_status_updated ON applications;
DROP TRIGGER IF EXISTS on_application_created ON applications;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS notify_on_application_status_change();
DROP FUNCTION IF EXISTS notify_on_application();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own blocks" ON blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON blocks;
DROP POLICY IF EXISTS "Users can view own blocks" ON blocks;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Drop existing tables if they exist (this will cascade delete all data)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Now run the full migration 011_notifications_blocks_reports.sql
