-- Function: Get distance band label
CREATE OR REPLACE FUNCTION get_distance_band(lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION)
RETURNS TEXT AS $$
DECLARE
  distance_m DOUBLE PRECISION;
  distance_mi DOUBLE PRECISION;
BEGIN
  -- Calculate distance in meters using PostGIS
  distance_m := ST_Distance(
    ST_MakePoint(lng1, lat1)::geography,
    ST_MakePoint(lng2, lat2)::geography
  );
  
  -- Convert to miles
  distance_mi := distance_m / 1609.34;
  
  -- Return band label
  IF distance_mi < 1 THEN
    RETURN '< 1 mi';
  ELSIF distance_mi < 2 THEN
    RETURN '1-2 mi';
  ELSIF distance_mi < 3 THEN
    RETURN '2-3 mi';
  ELSE
    RETURN '3+ mi';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check if user can create moment (rate limiting)
CREATE OR REPLACE FUNCTION can_create_moment(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_trust_level INTEGER;
  recent_moments_count INTEGER;
BEGIN
  -- Get user trust level
  SELECT trust_level INTO user_trust_level
  FROM profiles
  WHERE id = check_user_id;
  
  -- Count moments created in last hour
  SELECT COUNT(*) INTO recent_moments_count
  FROM moments
  WHERE creator_id = check_user_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Trust level 0 users: max 3 per hour
  -- Trust level 1+: max 5 per hour
  -- Trust level 3+: max 10 per hour
  IF user_trust_level = 0 AND recent_moments_count >= 3 THEN
    RETURN FALSE;
  ELSIF user_trust_level < 3 AND recent_moments_count >= 5 THEN
    RETURN FALSE;
  ELSIF recent_moments_count >= 10 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can apply (rate limiting)
CREATE OR REPLACE FUNCTION can_apply(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  recent_applications_count INTEGER;
BEGIN
  -- Count applications created in last hour
  SELECT COUNT(*) INTO recent_applications_count
  FROM applications
  WHERE applicant_id = check_user_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Max 10 applications per hour
  IF recent_applications_count >= 10 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get feed with filtering and sorting
CREATE OR REPLACE FUNCTION get_feed(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  mode TEXT,
  feed_limit INTEGER DEFAULT 20,
  feed_offset INTEGER DEFAULT 0,
  verified_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  reward_type TEXT,
  reward_amount NUMERIC,
  approx_area TEXT,
  minutes_remaining INTEGER,
  distance_band TEXT,
  tags TEXT[],
  requires_verified BOOLEAN,
  quiet_mode BOOLEAN,
  creator_trust_level INTEGER,
  creator_is_verified BOOLEAN,
  category TEXT,
  description TEXT,
  creator_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.reward_type,
    m.reward_amount,
    m.approx_area,
    EXTRACT(EPOCH FROM (m.expires_at - NOW()))::INTEGER / 60 AS minutes_remaining,
    get_distance_band(user_lat, user_lng, m.lat, m.lng) AS distance_band,
    m.tags,
    m.requires_verified,
    m.quiet_mode,
    p.trust_level AS creator_trust_level,
    p.is_verified AS creator_is_verified,
    m.category,
    m.description,
    m.creator_id
  FROM moments m
  JOIN profiles p ON p.id = m.creator_id
  WHERE
    m.status = 'active'
    AND m.expires_at > NOW()
    -- Location filter: within moment radius or user's search radius (5km default)
    AND (
      user_lat IS NULL
      OR user_lng IS NULL
      OR ST_DWithin(
        ST_MakePoint(m.lng, m.lat)::geography,
        ST_MakePoint(user_lng, user_lat)::geography,
        GREATEST(m.radius_m, 5000)
      )
    )
    -- Mode-specific filters
    AND (
      (mode = 'free' AND m.reward_type = 'free')
      OR (mode = 'swaps' AND (m.type = 'swap' OR m.reward_type = 'swap'))
      OR (mode = 'verified' AND (m.requires_verified = TRUE OR p.is_verified = TRUE))
      OR (mode NOT IN ('free', 'swaps', 'verified'))
    )
    -- Verified filter
    AND (verified_only = FALSE OR p.is_verified = TRUE)
  ORDER BY
    CASE
      WHEN mode = 'ending_soon' THEN m.expires_at
      ELSE NULL
    END ASC,
    CASE
      WHEN mode = 'nearby' AND user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        ST_Distance(
          ST_MakePoint(m.lng, m.lat)::geography,
          ST_MakePoint(user_lng, user_lat)::geography
        )
      ELSE NULL
    END ASC,
    m.created_at DESC
  LIMIT feed_limit
  OFFSET feed_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_distance_band TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_create_moment TO authenticated;
GRANT EXECUTE ON FUNCTION can_apply TO authenticated;
GRANT EXECUTE ON FUNCTION get_feed TO authenticated, anon;
