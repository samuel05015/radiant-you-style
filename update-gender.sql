-- Script para atualizar o gênero do perfil
-- Execute este comando no SQL Editor do Supabase

-- Atualizar para masculino (se você for homem)
UPDATE profiles 
SET gender = 'masculino' 
WHERE email = 'seu_email@gmail.com';

-- OU atualizar para feminino (se você for mulher)
-- UPDATE profiles 
-- SET gender = 'feminino' 
-- WHERE email = 'seu_email@gmail.com';

-- Verificar se funcionou
SELECT email, gender FROM profiles;
