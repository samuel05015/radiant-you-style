# 🚀 Guia Rápido - Conectar ao Supabase

## ✅ O que já está pronto

- ✅ Supabase instalado (`@supabase/supabase-js`)
- ✅ Credenciais configuradas no `.env`
- ✅ Cliente Supabase criado em `src/lib/supabase.ts`
- ✅ Camada de database em `src/lib/database.ts`
- ✅ Schema SQL em `supabase-setup.sql`
- ✅ Páginas integradas (GlowHair, LookPerfeito, Onboarding)
- ✅ User store sincronizando com database

## 📋 O que você precisa fazer AGORA

### Passo 1: Executar SQL no Supabase (2 minutos)

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Menu lateral → **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase-setup.sql` deste projeto
6. Copie TODO o conteúdo
7. Cole no editor SQL do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde aparecer "Success. No rows returned"

### Passo 2: Verificar se deu certo (1 minuto)

1. Menu lateral → **Table Editor**
2. Você deve ver 5 tabelas:
   - ✅ profiles
   - ✅ skincare_routines
   - ✅ hair_check_ins
   - ✅ outfits
   - ✅ closet_items

3. Menu lateral → **Storage**
4. Você deve ver o bucket:
   - ✅ profile-photos

### Passo 3: Testar o app (2 minutos)

1. Abra o app (se não estiver rodando: `npm run dev`)
2. Complete o Onboarding
3. Faça um check-in no GlowHair
4. Gere um look no LookPerfeito
5. Volte ao Dashboard

### Passo 4: Confirmar que salvou (1 minuto)

1. Volte ao Supabase → **Table Editor**
2. Clique na tabela **profiles**
3. Você deve ver seu perfil criado
4. Clique em **hair_check_ins**
5. Deve ver seu check-in
6. Clique em **outfits**
7. Deve ver o look gerado

## 🎉 Pronto!

Se todos os passos acima funcionaram, você agora tem:

- ✅ Database PostgreSQL configurado
- ✅ Dados sendo salvos automaticamente
- ✅ Histórico persistindo entre sessões
- ✅ Estatísticas reais no perfil
- ✅ Backup na nuvem

## 🔥 O que mudou no app

### Antes (sem Supabase)
- Dados salvos apenas no navegador (localStorage)
- Perdidos ao limpar cache
- Não sincronizam entre dispositivos
- Sem histórico completo

### Agora (com Supabase)
- ✅ Dados na nuvem (PostgreSQL)
- ✅ Persistem mesmo limpando cache
- ✅ Podem sincronizar em múltiplos dispositivos
- ✅ Histórico completo de check-ins
- ✅ Todos os looks gerados salvos
- ✅ Estatísticas reais e precisas

## 🎯 Próximos passos (opcional)

Você pode adicionar:

1. **Histórico de Check-ins**
   - Lista dos últimos 10 check-ins
   - Gráfico de evolução do cabelo

2. **Looks Favoritos**
   - Marcar/desmarcar favoritos
   - Galeria de looks salvos

3. **Closet Digital**
   - Upload de fotos das peças
   - Organizar por categoria/cor

4. **Rotinas de Skincare**
   - Salvar rotina personalizada
   - Acompanhar produtos

Tudo isso já tem funções prontas em `src/lib/database.ts`!

## ❓ Problemas?

### "relation does not exist"
→ Execute o SQL no Supabase (Passo 1)

### "null value in column violates not-null constraint"
→ Complete o onboarding primeiro (cria o perfil)

### Não aparece no banco
→ Abra console (F12) e veja erros
→ Verifique se `.env` tem as credenciais corretas

### Ainda com dúvida?
→ Leia `CONFIGURACAO-SUPABASE.md` (guia completo)
