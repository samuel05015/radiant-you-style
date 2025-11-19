-- Execute este script no SQL Editor do Supabase

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  face_shape TEXT,
  skin_tone TEXT,
  photo_url TEXT,
  analysis_confidence INTEGER,
  glow_days INTEGER DEFAULT 0,
  check_ins INTEGER DEFAULT 0,
  looks_created INTEGER DEFAULT 0
);

-- Tabela de rotinas de skincare
CREATE TABLE IF NOT EXISTS skincare_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  date DATE NOT NULL,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(profile_id, date)
);

-- Tabela de check-ins de cabelo
CREATE TABLE IF NOT EXISTS hair_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  date DATE NOT NULL,
  condition TEXT NOT NULL,
  recommendations TEXT[] DEFAULT '{}',
  styling_tips TEXT[] DEFAULT '{}'
);

-- Tabela de outfits/looks
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  occasion TEXT NOT NULL,
  top TEXT NOT NULL,
  bottom TEXT NOT NULL,
  shoes TEXT NOT NULL,
  accessories TEXT[] DEFAULT '{}',
  makeup TEXT NOT NULL,
  hair TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  favorite BOOLEAN DEFAULT false
);

-- Tabela de itens do closet
CREATE TABLE IF NOT EXISTS closet_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_skincare_routines_profile_id ON skincare_routines(profile_id);
CREATE INDEX IF NOT EXISTS idx_skincare_routines_date ON skincare_routines(date);
CREATE INDEX IF NOT EXISTS idx_hair_check_ins_profile_id ON hair_check_ins(profile_id);
CREATE INDEX IF NOT EXISTS idx_hair_check_ins_date ON hair_check_ins(date);
CREATE INDEX IF NOT EXISTS idx_outfits_profile_id ON outfits(profile_id);
CREATE INDEX IF NOT EXISTS idx_outfits_favorite ON outfits(favorite);
CREATE INDEX IF NOT EXISTS idx_closet_items_profile_id ON closet_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_closet_items_category ON closet_items(category);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skincare_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE closet_items ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura/escrita pública (pode ajustar conforme necessário)
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON skincare_routines FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON skincare_routines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON skincare_routines FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON hair_check_ins FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON hair_check_ins FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON outfits FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON outfits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON outfits FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON closet_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON closet_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON closet_items FOR DELETE USING (true);

-- Storage bucket para imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para upload de imagens
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
