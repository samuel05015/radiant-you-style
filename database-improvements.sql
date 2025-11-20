-- ========================================
-- MELHORIAS NO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- 1. Adicionar coluna de favorito em outfits
ALTER TABLE outfits 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. Criar tabela de análises (histórico com fotos)
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'face', 'skin', 'hair'
  photo_url TEXT,
  result_data JSONB NOT NULL, -- Armazena os resultados da análise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_history_profile 
ON analysis_history(profile_id, created_at DESC);

-- 3. Criar tabela de estatísticas de uso
CREATE TABLE IF NOT EXISTS outfit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_usage_outfit 
ON outfit_usage(outfit_id);

CREATE INDEX IF NOT EXISTS idx_outfit_usage_profile 
ON outfit_usage(profile_id, used_at DESC);

-- 4. Criar tabela de planejamento semanal
CREATE TABLE IF NOT EXISTS weekly_planner (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES outfits(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 (Domingo a Sábado)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_planner_profile_date 
ON weekly_planner(profile_id, date DESC);

-- 5. Criar tabela de notificações/lembretes
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'skincare_morning', 'skincare_night', 'haircut', 'create_look'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_time TIME,
  is_active BOOLEAN DEFAULT true,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_profile 
ON reminders(profile_id, is_active);

-- 6. Adicionar campos de cache para modo offline no profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cached_data JSONB,
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE;

-- Políticas de segurança (RLS)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_planner ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para analysis_history
CREATE POLICY "Users can view their own analysis history"
ON analysis_history FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

CREATE POLICY "Users can insert their own analysis"
ON analysis_history FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

CREATE POLICY "Users can delete their own analysis"
ON analysis_history FOR DELETE
USING (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

-- Políticas para outfit_usage
CREATE POLICY "Users can view their outfit usage"
ON outfit_usage FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

CREATE POLICY "Users can insert outfit usage"
ON outfit_usage FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

-- Políticas para weekly_planner
CREATE POLICY "Users can manage their weekly planner"
ON weekly_planner FOR ALL
USING (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

-- Políticas para reminders
CREATE POLICY "Users can manage their reminders"
ON reminders FOR ALL
USING (profile_id IN (SELECT id FROM profiles WHERE email = current_user));

-- Views úteis
CREATE OR REPLACE VIEW outfit_stats AS
SELECT 
  o.id,
  o.profile_id,
  o.occasion,
  COUNT(ou.id) as usage_count,
  MAX(ou.used_at) as last_used
FROM outfits o
LEFT JOIN outfit_usage ou ON o.id = ou.outfit_id
GROUP BY o.id, o.profile_id, o.occasion;

-- ========================================
-- DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir lembretes padrão para novos usuários
-- (Execute apenas se quiser criar lembretes padrão)

/*
INSERT INTO reminders (profile_id, reminder_type, title, message, scheduled_time)
SELECT 
  id as profile_id,
  'skincare_morning' as reminder_type,
  'Skincare Matinal ☀️' as title,
  'Hora de cuidar da sua pele! Não esqueça do protetor solar.' as message,
  '08:00:00' as scheduled_time
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM reminders r 
  WHERE r.profile_id = profiles.id 
  AND r.reminder_type = 'skincare_morning'
);
*/
