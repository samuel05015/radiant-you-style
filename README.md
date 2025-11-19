# Glow UP - App de Beleza Personalizado com IA ✨

Aplicativo de beleza que usa Inteligência Artificial para fornecer recomendações personalizadas de skincare, cabelo e estilo baseadas em análise facial.

## 🚀 Funcionalidades com IA

### 1. Análise Facial Automática
- **Tom de Pele**: Detecta automaticamente sua coloração pessoal (Primavera, Verão, Outono, Inverno)
- **Formato do Rosto**: Identifica entre 5 formatos (Oval, Redondo, Quadrado, Coração, Alongado)
- **Confiança da Análise**: Mostra o nível de certeza da IA

### 2. Recomendações de Cabelo
- Sugestões personalizadas baseadas na condição atual do cabelo
- Dicas de styling que favorecem seu formato de rosto
- Recomendações de cortes ideais

### 3. Gerador de Looks
- Combina tom de pele + formato de rosto + ocasião
- Sugere peças completas (top, bottom, calçado, acessórios)
- Recomenda maquiagem e penteado harmonizados

### 4. Rotina de Skincare
- Personalizada para seu tipo e tom de pele
- Passos específicos para manhã e noite

## ⚙️ Configuração Inicial

### 1. Google Gemini AI (Obrigatório para IA)

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login e clique em "Create API Key"
3. Copie a chave gerada

### 2. Supabase (Obrigatório para Dados Reais)

1. Acesse [Supabase](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em Settings → API
4. Copie a URL e anon key

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# Google Gemini AI
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 4. Configurar Database (Primeira vez)

1. Abra o Supabase Dashboard → SQL Editor
2. Copie o conteúdo de `supabase-setup.sql`
3. Cole e execute no SQL Editor
4. Verifique em Table Editor se as tabelas foram criadas

**📖 Guia detalhado**: Veja `CONFIGURACAO-SUPABASE.md`

### 5. Iniciar o App

```bash
npm install
npm run dev
```

## 🎯 Modo Demo (Sem Configuração)

O app funciona em modo demo mesmo sem APIs:
- ✅ Usa dados simulados para demonstração
- ✅ Todas as telas funcionam
- ❌ Não salva dados reais
- ❌ Análise de imagem limitada

**Para experiência completa**: Configure Gemini AI + Supabase!

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🛠️ Tecnologias

- **React** + **TypeScript** - Framework principal
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Google Gemini AI** - Análise de imagem e geração de conteúdo
## 🛠️ Tecnologias

- **React 18** + **TypeScript** - Framework principal
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Estilização utilitária
- **Shadcn/ui** - Componentes UI acessíveis
- **Google Gemini AI** - Análise de imagem e IA generativa
- **Supabase** - Database PostgreSQL + Storage
- **Zustand** - Gerenciamento de estado leve
- **React Router** - Navegação client-side

## 💾 Database (Supabase)

### Estrutura

O app usa 5 tabelas principais:

1. **profiles** - Dados do usuário e estatísticas
2. **hair_check_ins** - Histórico de check-ins de cabelo
3. **outfits** - Looks gerados com favoritos
4. **skincare_routines** - Rotinas de skincare
5. **closet_items** - Guarda-roupa virtual

### Como Funciona

- **Onboarding** → Cria perfil automático
- **GlowHair** → Salva cada check-in com recomendações
- **LookPerfeito** → Armazena looks gerados
- **Profile** → Mostra estatísticas reais do banco
- **Persistência** → Dados permanecem entre sessões

### Segurança

- Row Level Security (RLS) ativo
- Cada usuário vê apenas seus dados
- Políticas automáticas por email

## 📱 Funcionalidades do App

### Telas Principais

1. **Index** - Página inicial de boas-vindas
2. **Onboarding** - Análise facial com IA para criar perfil
3. **Dashboard** - Visão geral com estatísticas e acessos rápidos
4. **Glow Skin** - Rotina de skincare personalizada
5. **Glow Hair** - Check-in diário + recomendações de cortes
6. **Glow Style** - Closet digital e sugestões de looks
7. **Look Perfeito** - Gerador de looks completos com IA
8. **Profile** - Perfil do usuário e configurações

### Recursos Especiais

- ✨ Análise facial em tempo real
- 🎨 Recomendações de cores baseadas em coloração pessoal
- 💇‍♀️ Sugestões de cortes para cada formato de rosto
- 👗 Geração de looks personalizados
- 📊 Estatísticas de progresso (dias de glow, check-ins, looks criados)
- 🌓 Dark mode suportado
- 📱 Design responsivo e mobile-first

## 🐛 Troubleshooting

### API do Gemini não funciona

1. Verifique se a API key está correta no `.env`
2. Reinicie o servidor (`npm run dev`)
3. Confirme o prefixo `VITE_` na variável
4. Verifique limite de requisições (60/min, 1500/dia)

### Supabase não salva dados

1. Execute o SQL schema (`supabase-setup.sql`)
2. Verifique credenciais no `.env`
3. Abra o console (F12) e veja erros
4. Confirme que as tabelas existem no Supabase

### Análise de imagem falha

- Imagem deve ser < 4MB
- Formatos: JPEG, PNG, WEBP
- Boa iluminação e rosto visível
- Foto frontal funciona melhor

### Dados não persistem

- Verifique se completou o onboarding
- Confirme que tem email no perfil
- Veja se Supabase está configurado
- Check-ins precisam de perfil criado

## 📚 Documentação Adicional

- `CONFIGURACAO-SUPABASE.md` - Setup completo do database
- `CONFIGURACAO-IA.md` - Guia rápido da API Gemini
- `supabase-setup.sql` - Schema do banco de dados
- `.env.example` - Template de variáveis

## 🔒 Segurança

- ✅ API keys em variáveis de ambiente
- ✅ Nunca commite `.env` com dados reais
- ✅ Row Level Security no Supabase
- ✅ Validação de dados no client e server

---

## Project info (Lovable)

**URL**: https://lovable.dev/projects/0cd2076c-4397-40eb-bf5a-0fb4dc9afbe8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0cd2076c-4397-40eb-bf5a-0fb4dc9afbe8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0cd2076c-4397-40eb-bf5a-0fb4dc9afbe8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
