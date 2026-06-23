-- Memento Supabase Veritabanı Kurulum Betiği

-- 1. profiles tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Opsiyonel Auth entegrasyonu için
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. memory_cards tablosu
CREATE TABLE IF NOT EXISTS memory_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('visual', 'audio')) NOT NULL,
  correct_label TEXT NOT NULL,
  hint TEXT,
  relation TEXT,
  note TEXT,
  is_video BOOLEAN DEFAULT false,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. routines tablosu
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('medication','meal','exercise','appointment','hygiene','social','other')),
  time TEXT NOT NULL,
  days INTEGER[] NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  icon TEXT,
  color TEXT,
  image_uri TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. routine_completions tablosu
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  date TEXT NOT NULL
);

-- 5. safety_profiles tablosu
CREATE TABLE IF NOT EXISTS safety_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  emergency_contact TEXT,
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  home_address TEXT,
  home_name TEXT,
  is_monitoring_enabled BOOLEAN DEFAULT false,
  reminder_interval_minutes INTEGER DEFAULT 15
);

-- 6. game_sessions tablosu
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_cards INTEGER,
  correct_answers INTEGER,
  total_attempts INTEGER,
  duration_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Güvenlik Kuralları (RLS - Row Level Security)
-- Şimdilik geliştirme aşamasında olduğumuz için herkesin okuyup yazmasına izin veriyoruz.
-- Canlıya çıkmadan önce bu kurallar Auth bağlantılı olarak güncellenmelidir.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON profiles FOR ALL USING (true);

ALTER TABLE memory_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON memory_cards FOR ALL USING (true);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON routines FOR ALL USING (true);

ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON routine_completions FOR ALL USING (true);

ALTER TABLE safety_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON safety_profiles FOR ALL USING (true);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON game_sessions FOR ALL USING (true);

-- Storage (Depolama) Kurulumu
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true) ON CONFLICT DO NOTHING;

-- Storage için güvenlik kuralları
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'memories' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'memories' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'memories' );
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'memories' );
