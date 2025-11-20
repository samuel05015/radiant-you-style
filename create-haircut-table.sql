-- Criar tabela para salvar recomendações de corte
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS haircut_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  face_shape TEXT NOT NULL,
  cut_name TEXT NOT NULL,
  description TEXT NOT NULL,
  why_it_works TEXT NOT NULL,
  styling_tips TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para buscar por email
CREATE INDEX IF NOT EXISTS idx_haircut_recommendations_email 
ON haircut_recommendations(user_email);

-- Dar permissões
ALTER TABLE haircut_recommendations ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam e criem suas próprias recomendações
CREATE POLICY "Users can view their own haircut recommendations" 
ON haircut_recommendations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own haircut recommendations" 
ON haircut_recommendations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own haircut recommendations" 
ON haircut_recommendations 
FOR DELETE 
USING (true);
