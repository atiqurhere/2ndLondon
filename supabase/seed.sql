-- Sample users (passwords will be set via Supabase Auth)
-- Note: In production, users sign up via the app
-- This seed creates sample profiles assuming auth.users already exist

-- Insert sample profiles (you'll need to create auth users first via Supabase Dashboard)
-- For demo purposes, we'll create placeholder data

-- Sample moments
INSERT INTO moments (creator_id, type, title, description, category, tags, reward_type, reward_amount, approx_area, lat, lng, expires_at, requires_verified, quiet_mode) VALUES
-- These would use real user IDs from your auth.users table
-- Example structure:
-- ('user-uuid-1', 'offer', 'Help moving furniture', 'Need help moving a sofa from Stratford to Hackney. Should take about 2 hours.', 'Moving & Transport', ARRAY['moving', 'help', 'transport'], 'cash', 25.00, 'Near Stratford', 51.5434, -0.0022, NOW() + INTERVAL '4 hours', false, true),
-- ('user-uuid-2', 'free', 'Free houseplants', 'Moving house and have several healthy houseplants to give away. Collection only.', 'Home & Garden', ARRAY['free', 'plants', 'garden'], 'free', NULL, 'Near Camden', 51.5390, -0.1426, NOW() + INTERVAL '8 hours', false, true),
-- ('user-uuid-3', 'swap', 'Guitar lessons for web design help', 'Experienced guitarist offering lessons in exchange for help building a simple website.', 'Skills & Learning', ARRAY['swap', 'music', 'web'], 'swap', NULL, 'Near Shoreditch', 51.5255, -0.0780, NOW() + INTERVAL '12 hours', false, true);

-- Note: To properly seed the database:
-- 1. Create test users via Supabase Auth Dashboard or API
-- 2. Get their UUIDs from auth.users
-- 3. Replace the creator_id values above with real UUIDs
-- 4. Run this migration

-- For now, this file serves as a template
SELECT 'Seed template created. Add real user UUIDs to populate sample data.' AS message;
