-- Add onboarding_completed flag to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to mark onboarding as completed if they have username and home_area
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE username IS NOT NULL AND home_area IS NOT NULL AND home_area != '';
