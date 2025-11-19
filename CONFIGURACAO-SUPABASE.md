# 🗄️ Configuração do Supabase

## Passo 1: Executar o Schema SQL

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-setup.sql`
5. Cole no editor SQL e clique em **Run**

Isso criará:
- ✅ 5 tabelas (profiles, skincare_routines, hair_check_ins, outfits, closet_items)
- ✅ Índices para performance
- ✅ Políticas RLS (Row Level Security)
- ✅ Bucket de storage para imagens

## Passo 2: Verificar as Tabelas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver todas as 5 tabelas criadas:
   - `profiles` - Perfis dos usuários
   - `skincare_routines` - Rotinas de skincare
   - `hair_check_ins` - Check-ins de cabelo
   - `outfits` - Looks gerados
   - `closet_items` - Itens do guarda-roupa

## Passo 3: Configurar Storage (Opcional)

Se quiser fazer upload de fotos:

1. No menu lateral, clique em **Storage**
2. O bucket `profile-photos` já deve estar criado
3. Configure políticas de upload se necessário

## Estrutura das Tabelas

### profiles
Armazena informações do perfil do usuário:
- `email` - Email único do usuário
- `name` - Nome
- `face_shape` - Formato do rosto
- `skin_tone` - Tom de pele
- `photo_url` - URL da foto
- `glow_days`, `check_ins`, `looks_created` - Estatísticas

### hair_check_ins
Registra check-ins diários do cabelo:
- `user_email` - Email do usuário
- `condition` - Condição do cabelo
- `recommendations` - Recomendações da IA
- `styling_tips` - Dicas de estilo

### outfits
Armazena looks gerados pela IA:
- `user_email` - Email do usuário
- `occasion` - Ocasião
- `top`, `bottom`, `shoes`, `accessories` - Peças
- `colors` - Paleta de cores
- `is_favorite` - Marcado como favorito

### skincare_routines
Rotinas de skincare personalizadas:
- `user_email` - Email do usuário
- `skin_type` - Tipo de pele
- `concerns` - Preocupações
- `products` - Produtos recomendados
- `routine_steps` - Passos da rotina

### closet_items
Itens do guarda-roupa virtual:
- `user_email` - Email do usuário
- `category` - Categoria da peça
- `color`, `brand` - Detalhes
- `image_url` - Foto da peça
- `season` - Estação

## Como Funciona a Integração

O app agora salva dados reais no Supabase:

1. **Onboarding** → Cria perfil em `profiles`
2. **GlowHair** → Salva check-ins em `hair_check_ins`
3. **LookPerfeito** → Salva outfits em `outfits`
4. **GlowSkin** → Pode salvar rotinas em `skincare_routines`
5. **GlowStyle** → Pode gerenciar `closet_items`

## Testando a Integração

1. Complete o onboarding no app
2. Faça um check-in no GlowHair
3. Gere um look no LookPerfeito
4. Volte ao Supabase Dashboard → Table Editor
5. Verifique se os dados aparecem nas tabelas

## Políticas de Segurança (RLS)

As políticas RLS garantem que:
- ✅ Qualquer um pode criar um perfil
- ✅ Usuários podem ler seus próprios dados
- ✅ Usuários podem atualizar seus próprios dados
- ✅ Apenas o dono pode deletar seus dados

## Troubleshooting

### "relation does not exist"
→ Execute o SQL schema no Supabase

### "null value in column violates not-null constraint"
→ Verifique se o email está sendo passado corretamente

### "permission denied for table"
→ Verifique as políticas RLS no Supabase

### Dados não aparecem
→ Abra o console do navegador (F12) e veja os erros
→ Verifique se as credenciais no `.env` estão corretas

## Próximos Passos

Agora você tem:
- ✅ Database PostgreSQL configurado
- ✅ Tabelas criadas com relacionamentos
- ✅ Políticas de segurança ativas
- ✅ Integração funcionando no app

Você pode:
- 📊 Ver estatísticas reais no Dashboard
- 💾 Dados persistem entre sessões
- 🔄 Sincronização automática
- 🎨 Histórico de looks e check-ins
