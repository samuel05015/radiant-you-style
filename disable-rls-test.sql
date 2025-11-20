-- ========================================
-- DESABILITAR RLS TEMPORARIAMENTE (PARA TESTE)
-- ========================================

-- Opção 1: Desabilitar RLS completamente (APENAS PARA TESTE)
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_planner DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_usage DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reminders', 'weekly_planner', 'analysis_history', 'outfit_usage');
