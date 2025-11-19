# 🚀 Como Configurar a IA - Guia Rápido

## ⚡ Configuração em 3 Passos

### 1️⃣ Obter a API Key do Google Gemini (GRÁTIS)

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave que aparecerá (algo como: `AIzaSy...`)

### 2️⃣ Configurar no Projeto

Abra o arquivo `.env` na raiz do projeto e cole sua chave:

```env
VITE_GEMINI_API_KEY=AIzaSy_SUA_CHAVE_AQUI
```

### 3️⃣ Reiniciar

```bash
npm run dev
```

Pronto! A IA já está funcionando! 🎉

---

## 📝 O que a IA faz?

✅ **Onboarding**: Analisa sua selfie e detecta:
   - Formato do rosto (oval, redondo, quadrado, etc)
   - Tom de pele (primavera, verão, outono, inverno)

✅ **Glow Hair**: Gera recomendações personalizadas:
   - Cuidados para seu tipo de cabelo
   - Dicas de styling para seu formato de rosto

✅ **Look Perfeito**: Cria looks completos:
   - Peças que favorecem seu tom de pele
   - Maquiagem e cabelo harmonizados
   - Acessórios que completam o visual

---

## 💡 Modo Demo

**Sem API configurada?** Sem problema!
- O app funciona em modo demonstração
- Usa algoritmos pré-programados
- Todas as funcionalidades disponíveis

**Com API configurada:**
- Análises reais e personalizadas
- Recomendações únicas para você
- Melhor precisão

---

## 🎁 É Grátis?

**SIM!** O plano gratuito do Google Gemini oferece:
- 1.500 requisições por dia
- 60 requisições por minuto
- Perfeito para uso pessoal

---

## ❓ Problemas Comuns

### "A IA não está funcionando"
- Verifique se copiou a chave completa
- Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)
- Confirme que a variável começa com `VITE_`

### "Erro ao analisar imagem"
- Use fotos com boa iluminação
- Certifique-se que o rosto está visível
- Tamanho máximo: 4MB

---

## 📞 Precisa de Ajuda?

Consulte o README.md completo para mais detalhes!
