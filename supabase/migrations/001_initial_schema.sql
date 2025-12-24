-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  home_area TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  trust_level INTEGER NOT NULL DEFAULT 0 CHECK (trust_level >= 0 AND trust_level <= 5),
  rating_avg NUMERIC NOT NULL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (LENGTH(message) >= 1 AND LENGTH(message) <= 240),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_application UNIQUE (moment_id, applicant_id)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  other_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_conversation UNIQUE (moment_id, creator_id, other_id),
  CONSTRAINT different_participants CHECK (creator_id != other_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note TEXT CHECK (note IS NULL OR LENGTH(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_review UNIQUE (moment_id, from_id, to_id),
  CONSTRAINT different_users CHECK (from_id != to_id)
);

-- Reports table
-- Roles table
CREATE TABLE roles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Create spatial indexes for location queries
CREATE INDEX idx_profiles_location ON profiles USING GIST(ST_MakePoint(lng, lat));
CREATE INDEX idx_moments_location ON moments USING GIST(ST_MakePoint(lng, lat));

-- Create indexes for common queries
CREATE INDEX idx_moments_status_expires ON moments(status, expires_at) WHERE status = 'active';
CREATE INDEX idx_moments_creator ON moments(creator_id);
CREATE INDEX idx_applications_moment ON applications(moment_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_conversations_participants ON conversations(creator_id, other_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
