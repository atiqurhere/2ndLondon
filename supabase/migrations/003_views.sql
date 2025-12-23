-- Public view for moments (excludes private location data)
CREATE OR REPLACE VIEW public_moments AS
SELECT
  id,
  creator_id,
  type,
  title,
  description,
  category,
  tags,
  reward_type,
  reward_amount,
  currency,
  approx_area,
  radius_m,
  expires_at,
  status,
  requires_verified,
  quiet_mode,
  created_at
FROM moments;

-- Public view for profiles (excludes private location data)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  display_name,
  avatar_url,
  home_area,
  trust_level,
  rating_avg,
  rating_count,
  is_verified,
  created_at
FROM profiles;

-- Grant access to views
GRANT SELECT ON public_moments TO authenticated, anon;
GRANT SELECT ON public_profiles TO authenticated, anon;
