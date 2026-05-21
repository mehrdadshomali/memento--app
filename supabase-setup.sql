-- MemoBridge Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  diagnosis TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video', 'audio')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  days TEXT[] NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (encrypted)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  accuracy DECIMAL(10, 2)
);

-- Caregivers table (for multi-user access)
CREATE TABLE IF NOT EXISTS caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT,
  permissions TEXT[] DEFAULT ARRAY['view'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Memories
CREATE POLICY "Users can view own memories"
  ON memories FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR profile_id IN (
      SELECT profile_id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own memories"
  ON memories FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own memories"
  ON memories FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own memories"
  ON memories FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Routines
CREATE POLICY "Users can view own routines"
  ON routines FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR profile_id IN (
      SELECT profile_id FROM caregivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own routines"
  ON routines FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Locations (Most Sensitive)
CREATE POLICY "Only authorized caregivers can view locations"
  ON locations FOR SELECT
  USING (
    profile_id IN (
      SELECT profile_id FROM caregivers 
      WHERE user_id = auth.uid() 
      AND 'location' = ANY(permissions)
    )
  );

CREATE POLICY "Users can insert own locations"
  ON locations FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Caregivers
CREATE POLICY "Users can view their caregiver relationships"
  ON caregivers FOR SELECT
  USING (
    user_id = auth.uid()
    OR profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Profile owners can manage caregivers"
  ON caregivers FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_memories_profile_id ON memories(profile_id);
CREATE INDEX idx_routines_profile_id ON routines(profile_id);
CREATE INDEX idx_locations_profile_id ON locations(profile_id);
CREATE INDEX idx_locations_timestamp ON locations(timestamp DESC);
CREATE INDEX idx_caregivers_user_id ON caregivers(user_id);
CREATE INDEX idx_caregivers_profile_id ON caregivers(profile_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for media (photos, videos, audio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false);

-- Storage policies
CREATE POLICY "Users can upload own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM caregivers c
        JOIN profiles p ON c.profile_id = p.id
        WHERE c.user_id = auth.uid()
        AND p.user_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
