-- Script para limpar peças hardcoded no closet
-- Execute este script no SQL Editor do Supabase

-- Verificar quantas peças existem
SELECT COUNT(*) as total_items FROM closet_items;

-- Ver todas as peças (para confirmar antes de deletar)
SELECT id, profile_id, category, color, created_at FROM closet_items ORDER BY created_at DESC;

-- ATENÇÃO: O comando abaixo irá deletar TODAS as peças do closet
-- Descomente a linha abaixo apenas se tiver certeza que quer limpar tudo
DELETE FROM closet_items;

-- Ou deletar apenas as 12 peças mais antigas (se forem as hardcoded)
-- DELETE FROM closet_items WHERE id IN (
--   SELECT id FROM closet_items ORDER BY created_at ASC LIMIT 12
-- );
