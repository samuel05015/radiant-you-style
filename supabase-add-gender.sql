-- Script para adicionar o campo gender à tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna gender à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino', 'feminino'));

-- Criar índice para melhorar performance em queries por gênero
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);

-- Comentário explicativo
COMMENT ON COLUMN profiles.gender IS 'Gênero do usuário: masculino ou feminino';
