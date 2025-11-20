import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log("🔑 Verificando API Key do Gemini...");
console.log("API Key existe?", !!API_KEY);
console.log("API Key (primeiros 10 chars):", API_KEY?.substring(0, 10));

if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY não configurada! Usando modo demo.");
  console.error("Configure a API key no arquivo .env");
} else {
  console.log("✅ Google Gemini AI configurado e pronto!");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
console.log("genAI inicializado?", !!genAI);

export interface FaceAnalysisResult {
  faceShape: "oval" | "redondo" | "quadrado" | "coração" | "alongado";
  skinTone: "primavera" | "verão" | "outono" | "inverno";
  confidence: number;
  analysis: string;
}

export interface HairRecommendation {
  condition: string;
  recommendations: string[];
  stylingTips: string[];
}

export interface HairProduct {
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  buyUrl: string;
  price?: string;
}

export interface HairProductRecommendation {
  condition: string;
  products: HairProduct[];
  tips: string[];
}

export interface HaircutRecommendation {
  cutName: string;
  description: string;
  whyItWorks: string;
  imageUrl: string;
  stylingTips: string[];
}

export interface SkinProduct {
  name: string;
  brand: string;
  description: string;
  buyUrl: string;
  price?: string;
}

export interface SkinAnalysisResult {
  skinType: "oleosa" | "seca" | "mista" | "normal" | "sensível";
  concerns: string[];
  recommendations: string[];
}

export interface SkinProductRecommendation {
  skinType: string;
  concerns: string[];
  products: SkinProduct[];
  tips: string[];
}

export interface OutfitRecommendation {
  occasion: string;
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string[];
  };
  makeup: string;
  hair: string;
  reasoning: string;
}

/**
 * Analisa uma imagem de rosto para determinar formato e tom de pele
 */
export async function analyzeFaceImage(imageData: string): Promise<FaceAnalysisResult> {
  if (!genAI) {
    // Modo demo - retorna dados simulados
    console.warn("🔄 Usando modo demo (API não configurada)");
    return simulateFaceAnalysis();
  }

  try {
    console.log("🤖 Iniciando análise com Google Gemini AI...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
      }
    });

    const prompt = `Você é um especialista em análise facial e colorimetria pessoal. Analise esta foto com MÁXIMA PRECISÃO usando critérios objetivos.

📏 FORMATO DO ROSTO - Analise proporções e características:
Escolha APENAS UM entre:

• "oval" → Rosto equilibrado, comprimento 1.5x a largura, mandíbula suave, testa levemente mais larga que o queixo
• "redondo" → Largura ≈ comprimento, bochechas cheias, sem ângulos marcados, contornos arredondados
• "quadrado" → Testa, bochechas e mandíbula com larguras similares, maxilar angular e definido, queixo reto
• "coração" → Testa ampla, maçãs do rosto proeminentes, queixo pontudo/fino, formato de V invertido
• "alongado" → Comprimento >> largura (≥2x), testa alta, queixo alongado, rosto estreito

🎨 TOM DE PELE (Colorimetria) - Analise subtom e contraste:
Escolha APENAS UM entre:

• "primavera" → Subtom QUENTE/dourado + pele clara/média + veias esverdeadas + bronzeia com facilidade
• "verão" → Subtom FRIO/rosado + pele clara/média + veias azuladas + queima fácil ao sol
• "outono" → Subtom QUENTE/dourado + pele média/escura + tom acobreado/âmbar + bronzeia bem
• "inverno" → Subtom FRIO + pele clara OU muito escura + alto contraste cabelo/pele + veias azuis

📊 INSTRUÇÕES:
1. Observe proporções faciais com atenção matemática
2. Analise o subtom da pele (quente vs frio) pela cor das veias e reação ao sol
3. Seja CONSISTENTE - mesma pessoa deve ter sempre o mesmo resultado
4. Confidence: 90-100 se a foto for clara, 70-89 se tiver dúvidas, <70 se a foto for ruim

Responda APENAS com JSON válido:
{
  "faceShape": "formato",
  "skinTone": "tom",
  "confidence": número,
  "analysis": "Justifique sua análise citando características observadas (ex: 'Formato oval devido à mandíbula suave e proporção 1.5:1. Tom primavera pelo subtom dourado visível.')"
}`;

    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1], // Remove o prefixo data:image/...
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log("📊 Resposta da IA recebida");
    
    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log("✅ Análise realizada com sucesso via Gemini AI:", analysis);
      return analysis;
    }

    throw new Error("Formato de resposta inválido");
  } catch (error) {
    console.error("❌ Erro na análise com Gemini, usando fallback:", error);
    return simulateFaceAnalysis();
  }
}

/**
 * Gera recomendações de cuidados com cabelo
 */
export async function getHairRecommendations(
  condition: string,
  faceShape: string,
  gender?: string,
  hairType?: string
): Promise<HairRecommendation> {
  if (!genAI) {
    return simulateHairRecommendation(condition, faceShape);
  }

  try {
    console.log("💇 Gerando recomendações de cabelo com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.85,
        topK: 30,
      }
    });

    const genderContext = gender === "masculino" 
      ? "para homens, considerando cortes masculinos, produtos específicos e tendências de barbearia"
      : "para mulheres, considerando cortes femininos, produtos específicos e tendências de salão";

    const faceShapeGuidance = {
      oval: "rosto oval é versátil - recomende cortes que mantenham equilíbrio",
      redondo: "rosto redondo precisa de cortes que alonguem - evite volume lateral, prefira altura no topo",
      quadrado: "rosto quadrado precisa suavizar a mandíbula - recomende camadas e ondas",
      coração: "rosto coração (testa larga, queixo fino) - volume embaixo e menos no topo",
      alongado: "rosto alongado precisa de volume lateral - evite cabelos muito longos e lisos"
    };

    const prompt = `Você é um hair stylist expert especializado em análise de formato de rosto ${genderContext}.

DADOS DO CLIENTE:
- Gênero: ${gender}
- Condição do cabelo: ${condition}
- Formato do rosto: ${faceShape} (${faceShapeGuidance[faceShape as keyof typeof faceShapeGuidance] || 'formato único'})
${hairType ? `- Tipo de cabelo: ${hairType}` : ''}

TAREFA:
1. Analise o formato do rosto e dê 3-4 recomendações de CUIDADOS específicas para a condição "${condition}"
2. Dê 3-4 dicas de CORTES e ESTILOS que favoreçam especificamente o formato de rosto "${faceShape}" considerando o gênero "${gender}"

IMPORTANTE:
- Seja específico sobre cortes (ex: "Long bob na altura do queixo", "Degradê baixo com topete", etc)
- Explique POR QUE cada corte favorece esse formato de rosto
- Considere produtos adequados ao gênero

Responda APENAS com JSON válido:
{
  "condition": "nome da condição em português",
  "recommendations": ["cuidado 1", "cuidado 2", "cuidado 3", "cuidado 4"],
  "stylingTips": ["corte/estilo 1 + explicação do porquê favorece", "corte/estilo 2 + explicação", "corte/estilo 3 + explicação"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Formato de resposta inválido");
  } catch (error) {
    console.error("Erro nas recomendações de cabelo:", error);
    return simulateHairRecommendation(condition, faceShape);
  }
}

/**
 * Gera um look completo personalizado
 */
export async function generateOutfit(
  skinTone: string,
  faceShape: string,
  gender: string,
  occasion: string = "casual",
  preferences?: string[],
  closetItems?: any[],
  recentOutfits?: string[]
): Promise<OutfitRecommendation> {
  if (!genAI) {
    return simulateOutfitRecommendation(skinTone, occasion);
  }

  try {
    console.log("👔 Gerando look personalizado com IA...");
    console.log("🧥 Peças disponíveis no closet:", closetItems?.length || 0);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.5,
        topK: 10,
      }
    });
    console.log(`✅ Usando modelo: gemini-2.5-flash`);

    const genderContext = gender === "masculino"
      ? "para homem, com peças masculinas (camisa, calça, sapato social/tênis/sapatos, acessórios masculinos)"
      : "para mulher, com peças femininas (blusa, saia/calça, salto/sapatos/tênis, acessórios femininos)";

    // Formatar peças do closet para o prompt
    let prompt = '';
    
    if (closetItems && closetItems.length > 0) {
      // MODO: Com peças no closet - FORÇAR uso das peças
      const itemsList = closetItems.map((item, idx) => 
        `${idx + 1}. ${item.category} - ${item.color}`
      ).join('\n');
      
      // Criar exemplo JSON com as peças reais
      const firstTop = closetItems.find(i => 
        i.category.toLowerCase().includes('blusa') || 
        i.category.toLowerCase().includes('camisa') ||
        i.category.toLowerCase().includes('camiseta') ||
        i.category.toLowerCase().includes('social') ||
        i.category.toLowerCase().includes('top')
      );
      const firstBottom = closetItems.find(i => 
        i.category.toLowerCase().includes('calça') || 
        i.category.toLowerCase().includes('saia') ||
        i.category.toLowerCase().includes('short') ||
        i.category.toLowerCase().includes('bermuda')
      );
      const firstShoes = closetItems.find(i => 
        i.category.toLowerCase().includes('sapato') || 
        i.category.toLowerCase().includes('tênis') ||
        i.category.toLowerCase().includes('sandália') ||
        i.category.toLowerCase().includes('bota') ||
        i.category.toLowerCase().includes('chinelo')
      );
      
      const exampleTop = firstTop ? `"${firstTop.category} ${firstTop.color}"` : '"PRECISA ADICIONAR: Blusa/Camisa"';
      const exampleBottom = firstBottom ? `"${firstBottom.category} ${firstBottom.color}"` : '"PRECISA ADICIONAR: Calça/Saia"';
      const exampleShoes = firstShoes ? `"${firstShoes.category} ${firstShoes.color}"` : '"PRECISA ADICIONAR: Sapatos"';
      
      // Ajustar acessórios, maquiagem e cabelo baseado no gênero
      const accessories = gender === "masculino" 
        ? '["relógio", "cinto"]'
        : '["brincos", "bolsa"]';
      const makeupExample = gender === "masculino"
        ? '"não aplicável para homens"'
        : '"make natural com batom nude"';
      const hairExample = gender === "masculino"
        ? '"cabelo penteado para o lado com pomada"'
        : '"cabelo solto com ondas"';
      
      // Adicionar contexto de looks recentes para evitar repetição
      const recentLooksWarning = recentOutfits && recentOutfits.length > 0
        ? `\n\n⚠️ EVITE REPETIR: O cliente já usou recentemente estas combinações (escolha peças DIFERENTES):\n${recentOutfits.map((o, i) => `${i + 1}. ${o.replace(/\|/g, ' + ')}`).join('\n')}\n\n🚨 OBRIGATÓRIO: NÃO repita o TOP/CAMISA de nenhum look acima. Escolha uma PEÇA DIFERENTE para o top!`
        : '';
      
      prompt = `Você é um personal stylist profissional especializado em colorimetria e harmonia de looks.

📦 PEÇAS DISPONÍVEIS NO CLOSET:
${itemsList}

👤 PERFIL DO CLIENTE:
- Gênero: ${gender}
- Tom de pele: ${skinTone}
- Formato do rosto: ${faceShape}
- Ocasião: ${occasion}
${recentLooksWarning}

🎨 DIRETRIZES DE STYLING:

1. COMBINAÇÃO DE CORES:
   - Considere o tom de pele ${skinTone} do cliente
   - Use regras de harmonia: complementares, análogas ou monocromáticas
   - Cores neutras (preto, branco, bege, cinza) combinam com tudo
   - Evite mais de 3 cores no mesmo look
   
2. OCASIÃO ${occasion.toUpperCase()}:
   ${occasion === 'casual' ? '- Look confortável e descontraído\n   - Pode misturar texturas e estilos\n   - Jeans, t-shirts, sneakers são bem-vindos' : ''}${occasion === 'formal' ? '- Look elegante e sofisticado\n   - Cores sóbrias e peças estruturadas\n   - Evite peças muito coloridas ou informais\n   - Sapatos fechados obrigatórios' : ''}${occasion === 'festa' ? '- Look impactante e estiloso\n   - Pode ousar nas cores e acessórios\n   - Tecidos com brilho ou textura especial\n   - Sapatos elegantes obrigatórios' : ''}

3. ESTILO E PROPORÇÕES:
   - Balance o look: se o top é largo, o bottom deve ser ajustado (e vice-versa)
   - Combine texturas e tecidos complementares
   - Considere a estação atual (Novembro - Primavera no BR)

4. REGRAS TÉCNICAS:
   - Use APENAS peças da lista acima
   - Se faltar categoria, escreva "PRECISA ADICIONAR: [tipo]"
   ${gender === "masculino" ? '- Cliente é HOMEM: não sugira maquiagem, batom, brincos ou bolsa' : ''}
   ${recentOutfits && recentOutfits.length > 0 ? '- 🚨 CRÍTICO: NÃO repita tops/camisas dos looks recentes!' : ''}

Responda EXATAMENTE neste formato JSON (use as peças da lista):
{
  "occasion": "${occasion}",
  "outfit": {
    "top": ${exampleTop},
    "bottom": ${exampleBottom},
    "shoes": ${exampleShoes},
    "accessories": ${accessories}
  },
  "makeup": ${makeupExample},
  "hair": ${hairExample},
  "reasoning": "Explique a HARMONIA DE CORES (ex: 'azul marinho + branco = contraste clássico e elegante'), ADEQUAÇÃO À OCASIÃO (ex: 'jeans + blazer = casual-chic perfeito para [ocasião]') e PROPORÇÕES (ex: 'calça slim + camisa ampla = balance de volumes')"
}`;
    } else {
      // MODO: Sem peças - recomendação genérica
      const accessories = gender === "masculino" 
        ? '["relógio", "cinto de couro"]'
        : '["brincos delicados", "bolsa média"]';
      const makeupSuggestion = gender === "masculino"
        ? '"não aplicável"'
        : '"make natural com batom nude"';
      const hairSuggestion = gender === "masculino"
        ? '"cabelo penteado ou undercut"'
        : '"cabelo solto ou preso"';
      
      prompt = `Como personal stylist ${genderContext}, sugira um look completo para comprar:

Gênero: ${gender}
Tom de pele: ${skinTone}
Formato do rosto: ${faceShape}
Ocasião: ${occasion}
${gender === "masculino" ? "\nIMPORTANTE: Cliente é HOMEM - não sugira maquiagem, batom, brincos ou bolsa!" : ""}

Responda APENAS com JSON válido:
{
  "occasion": "${occasion}",
  "outfit": {
    "top": "sugestão de compra específica",
    "bottom": "sugestão de compra específica",
    "shoes": "sugestão de compra específica",
    "accessories": ${accessories}
  },
  "makeup": ${makeupSuggestion},
  "hair": ${hairSuggestion},
  "reasoning": "explicação do look"
}`;
    }

    console.log("📝 Prompt completo enviado para IA:");
    console.log(prompt);
    console.log("---");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 Resposta completa da IA:", text);
    console.log("---");
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("✅ Look gerado:", parsed);
      return parsed;
    }

    throw new Error("Formato de resposta inválido");
  } catch (error) {
    console.error("Erro na geração de look:", error);
    console.log("⚠️ Usando fallback com peças do closet");
    return simulateOutfitRecommendation(skinTone, occasion, gender, closetItems);
  }
}

/**
 * Gera recomendações de skincare personalizadas com produtos específicos
 */
export async function getSkincareRecommendations(
  skinType: string,
  skinTone: string,
  gender: string,
  concerns?: string[]
): Promise<{ routine: string[]; products: string[]; tips: string }> {
  if (!genAI) {
    return {
      routine: [
        "Limpeza suave com sabonete específico",
        "Tônico hidratante",
        "Sérum com vitamina C",
        "Hidratante facial",
        "Protetor solar FPS 50+"
      ],
      products: [
        "Gel de limpeza suave",
        "Tônico facial",
        "Sérum antioxidante",
        "Hidratante oil-free",
        "Protetor solar FPS 50"
      ],
      tips: "Sua pele precisa de cuidados especiais. Mantenha a rotina consistente!"
    };
  }

  try {
    console.log("🧴 Gerando rotina de skincare com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.85,
        topK: 30,
      }
    });

    const genderContext = gender === "masculino"
      ? "para pele masculina, considerando produtos específicos para homens e rotinas práticas"
      : "para pele feminina, considerando produtos específicos e rotinas completas";

    const prompt = `Você é um dermatologista brasileiro especializado ${genderContext}. Crie uma rotina de skincare personalizada:

👤 PERFIL DO CLIENTE:
• Tipo de pele: ${skinType}
• Tom de pele: ${skinTone}
• Gênero: ${gender}
${concerns ? `• Preocupações: ${concerns.join(', ')}` : ''}

📋 ROTINA COMPLETA (6-8 passos):
Divida em MANHÃ e NOITE. Seja ESPECÍFICO sobre:
- Como aplicar cada produto
- Quantidade necessária
- Tempo de absorção entre produtos
- Ordem correta de aplicação

🛍️ PRODUTOS REAIS (6-8 produtos):
Recomende produtos DISPONÍVEIS NO BRASIL de marcas como:
- La Roche-Posay, Vichy, Cerave, Neutrogena, Avène, Adcos, Dermage, Ada Tina, etc.
- Inclua o NOME EXATO do produto (ex: "La Roche-Posay Effaclar Gel de Limpeza")
- Adicione faixa de preço estimada em reais

💡 DICA IMPORTANTE:
Forneça UMA dica crucial e personalizada para o tipo de pele do cliente.

⚠️ REGRAS:
- Produtos devem existir e estar disponíveis no mercado brasileiro
- Adaptação ao clima tropical do Brasil
- Protetor solar FPS 50+ OBRIGATÓRIO na rotina da manhã

Responda APENAS com JSON válido:
{
  "routine": ["MANHÃ 1: Limpeza - Lave o rosto com água morna usando [produto], massageando por 30s", "MANHÃ 2: ...", "NOITE 1: ..."],
  "products": ["La Roche-Posay Effaclar Gel (R$ 80-100)", "Cerave Hidratante Facial (R$ 60-80)", ...],
  "tips": "Dica personalizada crucial para ${skinType}"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Formato de resposta inválido");
  } catch (error) {
    console.error("Erro nas recomendações de skincare:", error);
    return {
      routine: [
        "Limpeza suave com sabonete específico para seu tipo de pele",
        "Tônico hidratante para equilibrar o pH",
        "Sérum adequado às suas necessidades",
        "Hidratante facial leve",
        "Protetor solar FPS 50+ (manhã)",
        "Sérum noturno (noite)"
      ],
      products: [
        "Gel de limpeza facial",
        "Tônico facial",
        "Sérum de vitamina C",
        "Hidratante oil-free",
        "Protetor solar facial",
        "Sérum de ácido hialurônico"
      ],
      tips: "Mantenha a consistência na rotina para melhores resultados!"
    };
  }
}

// Funções de simulação para modo demo

function simulateFaceAnalysis(): FaceAnalysisResult {
  const shapes: Array<"oval" | "redondo" | "quadrado" | "coração" | "alongado"> = ["oval", "redondo", "quadrado", "coração", "alongado"];
  const tones: Array<"primavera" | "verão" | "outono" | "inverno"> = ["primavera", "verão", "outono", "inverno"];
  
  const faceShape = shapes[Math.floor(Math.random() * shapes.length)];
  const skinTone = tones[Math.floor(Math.random() * tones.length)];
  
  return {
    faceShape,
    skinTone,
    confidence: 85 + Math.floor(Math.random() * 15),
    analysis: `Análise detectou formato ${faceShape} com tom de pele ${skinTone}. Cores ${
      skinTone === "primavera" || skinTone === "outono" ? "quentes" : "frias"
    } são ideais para você.`
  };
}

function simulateHairRecommendation(condition: string, faceShape: string): HairRecommendation {
  const recommendations = {
    frizzy: [
      "Use leave-in anti-frizz após lavar",
      "Evite secador em temperatura máxima",
      "Aplique óleo capilar nas pontas"
    ],
    oily: [
      "Use shampoo a seco entre lavagens",
      "Lave apenas as raízes",
      "Evite produtos muito oleosos"
    ],
    dry: [
      "Aplique máscara hidratante 2x por semana",
      "Use óleo capilar diariamente",
      "Evite lavagens frequentes"
    ],
    perfect: [
      "Mantenha a rotina atual",
      "Proteja dos danos térmicos",
      "Hidrate regularmente"
    ]
  };

  const stylingTips = {
    oval: ["Camadas longas ficam perfeitas", "Qualquer penteado valoriza você"],
    redondo: ["Cortes em V alongam o rosto", "Volume no topo é favorável"],
    quadrado: ["Ondas suavizam os ângulos", "Camadas frontais são ideais"],
    coração: ["Volume abaixo do queixo equilibra", "Bob na altura do queixo é perfeito"],
    alongado: ["Franjas reduzem o comprimento visual", "Volume lateral equilibra"]
  };

  return {
    condition,
    recommendations: recommendations[condition as keyof typeof recommendations] || recommendations.perfect,
    stylingTips: stylingTips[faceShape as keyof typeof stylingTips] || stylingTips.oval
  };
}

function simulateOutfitRecommendation(skinTone: string, occasion: string, gender: string = "feminino", closetItems?: any[]): OutfitRecommendation {
  // Se tem peças no closet, usar elas
  if (closetItems && closetItems.length > 0) {
    console.log("🔍 Buscando peças nas categorias:", closetItems.map(i => i.category));
    
    // Buscar top (parte de cima)
    const top = closetItems.find(i => {
      const cat = (i.category || '').toLowerCase();
      return cat.includes('blusa') || cat.includes('camisa') || cat.includes('camiseta') || 
             cat.includes('top') || cat.includes('regata') || cat.includes('suéter');
    });
    
    // Buscar bottom (parte de baixo)
    const bottom = closetItems.find(i => {
      const cat = (i.category || '').toLowerCase();
      return cat.includes('calça') || cat.includes('saia') || cat.includes('shorts') || 
             cat.includes('bermuda') || cat.includes('legging');
    });
    
    // Buscar sapatos
    const shoes = closetItems.find(i => {
      const cat = (i.category || '').toLowerCase();
      return cat.includes('sapato') || cat.includes('tênis') || cat.includes('sandália') || cat.includes('chinelo') || 
             cat.includes('bota') || cat.includes('chinelo');
    });

    console.log("✅ Peças encontradas:");
    console.log("  Top:", top ? `${top.category} ${top.color}` : "não encontrado");
    console.log("  Bottom:", bottom ? `${bottom.category} ${bottom.color}` : "não encontrado");
    console.log("  Shoes:", shoes ? `${shoes.category} ${shoes.color}` : "não encontrado");

    // Acessórios e maquiagem específicos por gênero
    const accessories = gender === "masculino" 
      ? ["Relógio", "Cinto de couro"]
      : ["Brincos delicados", "Bolsa transversal"];
    const makeup = gender === "masculino"
      ? "Não aplicável"
      : `Base leve, blush ${skinTone === "primavera" || skinTone === "outono" ? "pêssego" : "rosado"}, gloss nude`;

    return {
      occasion,
      outfit: {
        top: top ? `${top.category} ${top.color}` : "ADICIONE: Blusa/Camisa",
        bottom: bottom ? `${bottom.category} ${bottom.color}` : "ADICIONE: Calça/Saia",
        shoes: shoes ? `${shoes.category} ${shoes.color}` : "ADICIONE: Sapatos",
        accessories
      },
      makeup,
      hair: "Ondas naturais soltas",
      reasoning: `✨ Montei seu look com suas peças: ${top ? top.category : 'FALTA TOP'} + ${bottom ? bottom.category : 'FALTA BOTTOM'}. ${!shoes ? 'Adicione sapatos ao closet!' : ''}`
    };
  }
  
  // Fallback genérico se não tiver peças
  const outfitsMasculino = {
    casual: {
      top: "Camiseta básica em cor neutra",
      bottom: "Calça jeans reta",
      shoes: "Tênis branco ou preto",
      accessories: ["Relógio", "Cinto de couro"]
    },
    formal: {
      top: "Camisa social lisa ou listrada",
      bottom: "Calça alfaiataria",
      shoes: "Sapato social marrom ou preto",
      accessories: ["Relógio elegante", "Gravata"]
    },
    festa: {
      top: "Camisa social premium",
      bottom: "Calça social slim fit",
      shoes: "Sapato social bico fino",
      accessories: ["Relógio sofisticado", "Cinto de couro"]
    }
  };

  const outfitsFeminino = {
    casual: {
      top: "Blusa em tom que harmoniza com seu tom de pele",
      bottom: "Calça jeans de modelagem favorável",
      shoes: "Tênis branco ou nude",
      accessories: ["Brincos delicados", "Bolsa transversal"]
    },
    formal: {
      top: "Blazer estruturado",
      bottom: "Calça alfaiataria ou saia midi",
      shoes: "Scarpin clássico",
      accessories: ["Relógio elegante", "Colar fino"]
    },
    festa: {
      top: "Vestido em cor que valoriza seu tom de pele",
      bottom: "Vestido midi ou longo",
      shoes: "Salto fino",
      accessories: ["Clutch elegante", "Brincos statement"]
    }
  };

  const outfits = gender === "masculino" ? outfitsMasculino : outfitsFeminino;
  const selectedOutfit = outfits[occasion as keyof typeof outfits] || outfits.casual;
  
  const makeup = gender === "masculino" 
    ? "Não aplicável"
    : `Base leve, blush ${skinTone === "primavera" || skinTone === "outono" ? "pêssego" : "rosado"}, gloss nude`;
  
  const hair = gender === "masculino"
    ? "Cabelo penteado com gel ou pomada"
    : "Ondas naturais soltas";

  return {
    occasion,
    outfit: selectedOutfit,
    makeup,
    hair,
    reasoning: `Este look valoriza seu tom de pele ${skinTone} e é perfeito para a ocasião.`
  };
}

/**
 * Analisa uma imagem de peça de roupa para identificar categoria e cor
 */
export async function analyzeClothingItem(imageData: string): Promise<{category: string, color: string, description: string}> {
  if (!genAI) {
    return {
      category: "Roupa",
      color: "A definir",
      description: "Peça adicionada ao closet"
    };
  }

  try {
    console.log("👕 Analisando peça de roupa com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 20,
      }
    });

    const prompt = `Analise esta peça de roupa e identifique:

1. CATEGORIA: Escolha UMA das opções abaixo (use EXATAMENTE como está escrito):
   - Camisas (camisetas, camisas, regatas, moletons)
   - Camisas Sociais (camisas sociais, camisas de botão)
   - Blusas (blusas femininas, tops, bodies)
   - Calças (calças compridas, leggings)
   - Shorts/Bermudas (shorts, bermudas)
   - Sapatos (sapatos, tênis, sandálias, botas, chinelos, saltos)
   - Vestidos (vestidos, macacões)
   - Casacos (casacos, jaquetas, blazers, suéteres)
   - Acessórios (bolsas, cintos, chapéus, óculos, joias)

2. COR: Identifique a cor predominante (ex: azul, preto, branco, vermelho)

3. DESCRIÇÃO: Uma frase curta descrevendo o estilo da peça

IMPORTANTE: Use a categoria EXATAMENTE como está na lista (Camisas, Camisas Sociais, Blusas, Calças, Shorts/Bermudas, Sapatos, Vestidos, Casacos, Acessórios).

Responda APENAS com JSON válido:
{
  "category": "categoria exata da lista acima",
  "color": "cor predominante",
  "description": "descrição breve e objetiva"
}`;

    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log("📝 Resposta da IA:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("✅ Peça identificada:", parsed);
      return {
        category: parsed.category || "Roupa",
        color: parsed.color || "A definir",
        description: parsed.description || "Peça adicionada"
      };
    }
    
    throw new Error("Resposta inválida da IA");
  } catch (error) {
    console.error("❌ Erro ao analisar peça:", error);
    return {
      category: "Roupa",
      color: "A definir",
      description: "Peça adicionada ao closet"
    };
  }
}

/**
 * Recomenda produtos reais de cabelo baseado na condição
 */
export async function getHairProductRecommendations(
  condition: string,
  gender: string = "feminino"
): Promise<HairProductRecommendation> {
  if (!genAI) {
    return simulateHairProducts(condition, gender);
  }

  try {
    console.log("🛍️ Buscando produtos de cabelo com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
      }
    });

    const conditionMap: { [key: string]: string } = {
      frizzy: "com frizz",
      oily: "oleoso",
      dry: "ressecado",
      perfect: "saudável"
    };

    const prompt = `Você é um hair expert brasileiro especializado em cabelos ${gender === "masculino" ? "masculinos" : "femininos"}.

💇 RECOMENDE 5-6 PRODUTOS REAIS para cabelo ${conditionMap[condition] || condition}:

🛍️ MARCAS DISPONÍVEIS NO BRASIL:
- Salon Line, L'Oréal Professionnel, Elseve, TRESemmé, Pantene, Seda, Dove
- Schwarzkopf, Kerastase, Wella, Aussie, OGX, Truss, Inoar, Skala, Novex

📦 PARA CADA PRODUTO INCLUA:
1. Nome EXATO e COMPLETO (ex: "Salon Line S.O.S Cachos Shampoo")
2. Marca
3. Descrição objetiva dos benefícios (máx 15 palavras)
4. Preço realista no mercado brasileiro

💡 DICAS DE USO (3-4 dicas):
- Como aplicar corretamente
- Frequência de uso recomendada
- Combinações eficazes entre produtos
- Erro comum a evitar

⚠️ IMPORTANTE:
- Produtos DEVEM existir e estar à venda no Brasil
- Use nomes OFICIAIS (não invente variações)
- Adeque ao tipo de cabelo ${conditionMap[condition]}
- Varie categorias: shampoo, condicionador, máscara, leave-in, finalizador

Responda APENAS com JSON válido:
{
  "condition": "${conditionMap[condition]}",
  "products": [
    {
      "name": "Nome completo oficial do produto",
      "brand": "Marca",
      "description": "Benefício principal em 1 frase clara",
      "price": "R$ XX,XX"
    }
  ],
  "tips": ["Aplique shampoo apenas no couro cabeludo, massageando suavemente", "Use condicionador do meio às pontas, nunca na raiz", "Máscara 1-2x por semana para hidratação profunda", "Finalize com produto anti-frizz ainda com cabelo úmido"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("🛍️ Produtos recomendados:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Adicionar URLs e buscar imagens reais dos produtos
      const productsWithUrls = await Promise.all(
        parsed.products.map(async (p: any) => ({
          ...p,
          imageUrl: await getProductImageFromGoogle(p.brand, p.name),
          buyUrl: `https://www.google.com/search?q=${encodeURIComponent(p.brand + ' ' + p.name + ' comprar')}`
        }))
      );
      
      return {
        condition: parsed.condition,
        products: productsWithUrls,
        tips: parsed.tips
      };
    }
    
    throw new Error("Formato inválido");
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    return simulateHairProducts(condition, gender);
  }
}

// Função para buscar imagem real do produto usando URLs diretas do Unsplash
async function getProductImageFromGoogle(brand: string, productName: string): Promise<string> {
  // Usar URLs diretas do Unsplash com IDs específicos de fotos de produtos reais
  const productImages: { [key: string]: string } = {
    // Shampoos
    "shampoo_gold": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    "shampoo_blue": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    "shampoo_green": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    "shampoo_white": "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
    // Condicionadores
    "conditioner": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    // Tratamentos
    "mask": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    "ampoule": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    "oil": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    "serum": "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
    // Sprays
    "spray": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
    "dry_shampoo": "https://images.unsplash.com/photo-1583241800698-fa9a5c169903?w=400&h=400&fit=crop",
    // Default
    "default": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop"
  };

  // Mapear produto para tipo de imagem
  const lowerProduct = productName.toLowerCase();
  if (lowerProduct.includes('shampoo') && !lowerProduct.includes('seco')) {
    if (lowerProduct.includes('detox') || lowerProduct.includes('antifrizz')) return productImages.shampoo_gold;
    if (lowerProduct.includes('micelar')) return productImages.shampoo_blue;
    return productImages.shampoo_white;
  }
  if (lowerProduct.includes('condicionador')) return productImages.conditioner;
  if (lowerProduct.includes('máscara')) return productImages.mask;
  if (lowerProduct.includes('ampola')) return productImages.ampoule;
  if (lowerProduct.includes('óleo')) return productImages.oil;
  if (lowerProduct.includes('sérum')) return productImages.serum;
  if (lowerProduct.includes('leave-in')) return productImages.spray;
  if (lowerProduct.includes('seco')) return productImages.dry_shampoo;
  
  return productImages.default;
}

// Função auxiliar não usada mais, mantida para compatibilidade
function getProductImage(brand: string): string {
  return "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop";
}

// Fallback com produtos genéricos
function simulateHairProducts(condition: string, gender: string): HairProductRecommendation {
  const productsByCondition: { [key: string]: any } = {
    frizzy: {
      condition: "com frizz",
      products: [
        {
          name: "Shampoo Antifrizz",
          brand: "L'Oréal Elseve",
          description: "Controla o frizz e suaviza os fios",
          price: "R$ 18,90",
          imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=L%27Or%C3%A9al+Elseve+Antifrizz+comprar"
        },
        {
          name: "Condicionador Liso Intenso",
          brand: "Pantene",
          description: "Hidrata e disciplina cabelos rebeldes",
          price: "R$ 16,50",
          imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Pantene+Liso+Intenso+comprar"
        },
        {
          name: "Leave-in Antifrizz",
          brand: "TRESemmé",
          description: "Proteção térmica e controle de frizz",
          price: "R$ 22,90",
          imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=TRESemm%C3%A9+Leave-in+Antifrizz+comprar"
        }
      ],
      tips: [
        "Aplique o leave-in com o cabelo úmido",
        "Evite água muito quente no banho",
        "Finalize com óleo capilar nas pontas"
      ]
    },
    oily: {
      condition: "oleoso",
      products: [
        {
          name: "Shampoo Detox",
          brand: "L'Oréal Elseve",
          description: "Remove oleosidade e resíduos",
          price: "R$ 19,90",
          imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=L%27Or%C3%A9al+Detox+comprar"
        },
        {
          name: "Shampoo Micelar",
          brand: "Pantene",
          description: "Limpa profundamente sem ressecar",
          price: "R$ 17,90",
          imageUrl: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Pantene+Micelar+comprar"
        },
        {
          name: "Shampoo a Seco",
          brand: "Batiste",
          description: "Absorve oleosidade entre lavagens",
          price: "R$ 29,90",
          imageUrl: "https://images.unsplash.com/photo-1583241800698-fa9a5c169903?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Batiste+Shampoo+Seco+comprar"
        }
      ],
      tips: [
        "Lave o cabelo dia sim, dia não",
        "Aplique condicionador apenas no comprimento",
        "Use shampoo a seco para emergências"
      ]
    },
    dry: {
      condition: "ressecado",
      products: [
        {
          name: "Máscara Reparação Total 5",
          brand: "L'Oréal Elseve",
          description: "Hidratação profunda para cabelos danificados",
          price: "R$ 24,90",
          imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=L%27Or%C3%A9al+Repara%C3%A7%C3%A3o+Total+5+comprar"
        },
        {
          name: "Ampola Hidratação",
          brand: "Elseve",
          description: "Tratamento intensivo semanal",
          price: "R$ 8,90",
          imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Elseve+Ampola+Hidrata%C3%A7%C3%A3o+comprar"
        },
        {
          name: "Óleo de Argan",
          brand: "Salon Line",
          description: "Nutrição e brilho intenso",
          price: "R$ 15,90",
          imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Salon+Line+%C3%93leo+Argan+comprar"
        }
      ],
      tips: [
        "Faça hidratação profunda 1x por semana",
        "Use ampola intensiva quinzenalmente",
        "Finalize sempre com óleo nas pontas"
      ]
    },
    perfect: {
      condition: "saudável",
      products: [
        {
          name: "Shampoo Manutenção",
          brand: "Pantene",
          description: "Mantém a saúde dos fios",
          price: "R$ 16,90",
          imageUrl: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=Pantene+comprar"
        },
        {
          name: "Máscara Nutritiva",
          brand: "L'Oréal",
          description: "Nutrição semanal preventiva",
          price: "R$ 22,90",
          imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=L%27Or%C3%A9al+M%C3%A1scara+comprar"
        },
        {
          name: "Sérum Protetor",
          brand: "TRESemmé",
          description: "Proteção térmica diária",
          price: "R$ 19,90",
          imageUrl: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
          buyUrl: "https://www.google.com/search?q=TRESemm%C3%A9+S%C3%A9rum+comprar"
        }
      ],
      tips: [
        "Continue com a rotina de cuidados",
        "Hidratação leve 1x por semana",
        "Corte as pontas a cada 3 meses"
      ]
    }
  };

  return productsByCondition[condition] || productsByCondition.perfect;
}

/**
 * Recomenda corte de cabelo baseado no formato de rosto, condição do cabelo e gênero
 */
export async function getHaircutRecommendation(
  faceShape: string,
  hairCondition: string,
  gender: string = "feminino"
): Promise<HaircutRecommendation> {
  if (!genAI) {
    return simulateHaircutRecommendation(faceShape, hairCondition, gender);
  }

  try {
    console.log("✂️ Buscando recomendação de corte com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        topK: 40,
      }
    });

    const genderText = gender === "masculino" ? "masculino" : "feminino";
    const conditionMap: { [key: string]: string } = {
      frizzy: "com frizz",
      oily: "oleoso",
      dry: "ressecado",
      perfect: "saudável"
    };

    const prompt = `Você é um hair stylist profissional. Recomende UM corte de cabelo ideal para:
- Formato de rosto: ${faceShape}
- Condição do cabelo: ${conditionMap[hairCondition] || hairCondition}
- Gênero: ${genderText}

IMPORTANTE:
- Seja específico com o nome do corte (ex: "Long Bob em Camadas", "Fade com Topete", "Pixie Texturizado")
- Explique POR QUE esse corte funciona para esse formato de rosto
- Dê dicas práticas de finalização
- Use termos brasileiros e populares

Responda APENAS com JSON válido:
{
  "cutName": "Nome do corte",
  "description": "Descrição de como é o corte em 1-2 frases",
  "whyItWorks": "Por que funciona para rosto ${faceShape} em 1-2 frases",
  "stylingTips": ["dica 1", "dica 2", "dica 3"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✂️ Corte recomendado:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Adicionar URL de imagem baseada no tipo de corte e gênero
      return {
        ...parsed,
        imageUrl: getHaircutImage(parsed.cutName, gender)
      };
    }
    
    throw new Error("Formato inválido");
  } catch (error) {
    console.error("❌ Erro ao buscar corte:", error);
    return simulateHaircutRecommendation(faceShape, hairCondition, gender);
  }
}

// Função para obter imagem de corte de cabelo
function getHaircutImage(cutName: string, gender: string): string {
  const isMale = gender === "masculino";
  const cutLower = cutName.toLowerCase();
  
  // URLs de imagens reais do Unsplash - cortes de cabelo profissionais
  if (isMale) {
    if (cutLower.includes('fade') || cutLower.includes('degradê')) {
      return "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop";
    }
    if (cutLower.includes('pompadour') || cutLower.includes('topete')) {
      return "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop";
    }
    if (cutLower.includes('undercut')) {
      return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop";
    }
    // Masculino genérico
    return "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop";
  } else {
    if (cutLower.includes('bob') || cutLower.includes('chanel')) {
      return "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop";
    }
    if (cutLower.includes('pixie') || cutLower.includes('joãozinho')) {
      return "https://images.unsplash.com/photo-1560264280-88b68371db39?w=600&h=600&fit=crop";
    }
    if (cutLower.includes('longo') || cutLower.includes('camadas')) {
      return "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=600&fit=crop";
    }
    if (cutLower.includes('shag') || cutLower.includes('repicado')) {
      return "https://images.unsplash.com/photo-1549236177-db20b8be05e8?w=600&h=600&fit=crop";
    }
    // Feminino genérico
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop";
  }
}

// Fallback com cortes genéricos
function simulateHaircutRecommendation(
  faceShape: string,
  hairCondition: string,
  gender: string
): HaircutRecommendation {
  const isMale = gender === "masculino";
  
  const maleRecommendations: { [key: string]: HaircutRecommendation } = {
    oval: {
      cutName: "Fade com Topete Texturizado",
      description: "Laterais bem degradê (fade) com volume e textura no topo, podendo variar o comprimento.",
      whyItWorks: "O rosto oval é versátil e permite diversos estilos. O contraste entre laterais curtas e topo volumoso valoriza suas proporções.",
      imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
      stylingTips: [
        "Use pomada ou cera modeladora para texturizar",
        "Seque com secador apontando para cima",
        "Apare as laterais a cada 2-3 semanas"
      ]
    },
    redondo: {
      cutName: "Undercut com Franja Lateral",
      description: "Corte com laterais bem curtas e topo mais longo puxado para o lado, criando assimetria.",
      whyItWorks: "Alonga visualmente o rosto redondo através da altura no topo e da franja diagonal.",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop",
      stylingTips: [
        "Crie volume no topo com secador",
        "Use pomada matte para efeito natural",
        "Penteie para o lado, nunca para frente"
      ]
    },
    quadrado: {
      cutName: "Pompadour Moderno",
      description: "Laterais curtas com topo volumoso penteado para trás ou para o lado, suavizando os ângulos.",
      whyItWorks: "O volume no topo suaviza a mandíbula marcada e equilibra as proporções do rosto quadrado.",
      imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop",
      stylingTips: [
        "Use pomada de fixação forte",
        "Seque com escova para criar altura",
        "Finalize com spray fixador"
      ]
    },
    default: {
      cutName: "Corte Social Moderno",
      description: "Laterais e nuca curtas com topo médio, versátil para diferentes finalizações.",
      whyItWorks: "É um corte clássico e versátil que funciona bem para a maioria dos formatos de rosto.",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop",
      stylingTips: [
        "Adapte a finalização ao seu estilo",
        "Mantenha as laterais sempre aparadas",
        "Use produtos leves no dia a dia"
      ]
    }
  };

  const femaleRecommendations: { [key: string]: HaircutRecommendation } = {
    oval: {
      cutName: "Long Bob em Camadas",
      description: "Corte na altura dos ombros com camadas suaves que criam movimento e leveza.",
      whyItWorks: "Valoriza o formato oval equilibrado, criando movimento sem esconder os contornos naturais.",
      imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop",
      stylingTips: [
        "Finalize com escova ou babyliss para movimento",
        "Use leave-in para proteger e dar brilho",
        "Corte as pontas a cada 2-3 meses"
      ]
    },
    redondo: {
      cutName: "Corte Longo com Franja Lateral",
      description: "Cabelo longo com corte em V e franja comprida diagonal, criando linhas verticais.",
      whyItWorks: "As linhas longas e a franja lateral alongam visualmente o rosto redondo.",
      imageUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&h=600&fit=crop",
      stylingTips: [
        "Mantenha a franja sempre na diagonal",
        "Evite volume nas laterais",
        "Finalize com as pontas para dentro"
      ]
    },
    quadrado: {
      cutName: "Shag com Camadas Repicadas",
      description: "Corte repicado com muito movimento e camadas em todo o comprimento, suavizando ângulos.",
      whyItWorks: "As camadas suaves quebram a rigidez da mandíbula quadrada e adicionam feminilidade.",
      imageUrl: "https://images.unsplash.com/photo-1549236177-db20b8be05e8?w=600&h=600&fit=crop",
      stylingTips: [
        "Finalize com difusor para textura natural",
        "Use mousse para definir as camadas",
        "Evite alisar completamente"
      ]
    },
    default: {
      cutName: "Corte em Camadas Médio",
      description: "Cabelo na altura dos ombros com camadas suaves que criam movimento.",
      whyItWorks: "É um corte versátil e moderno que funciona bem para diversos formatos de rosto.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
      stylingTips: [
        "Varie a finalização conforme a ocasião",
        "Hidrate regularmente para manter o brilho",
        "Use protetor térmico sempre"
      ]
    }
  };

  const recommendations = isMale ? maleRecommendations : femaleRecommendations;
  return recommendations[faceShape] || recommendations.default;
}

/**
 * Analisa o estado atual da pele do usuário
 */
export async function analyzeSkinCondition(skinCondition: string): Promise<SkinAnalysisResult> {
  if (!genAI) {
    return simulateSkinAnalysis(skinCondition);
  }

  try {
    console.log("🔬 Analisando condição da pele com IA...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        topK: 40,
      }
    });

    const prompt = `Baseado na seguinte descrição da pele: "${skinCondition}"

Analise e forneça em JSON:
{
  "skinType": "oleosa|seca|mista|normal|sensível",
  "concerns": ["preocupação1", "preocupação2"],
  "recommendations": ["recomendação1", "recomendação2", "recomendação3"]
}

Seja específico e objetivo nas recomendações.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📋 Resposta da análise de pele:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        skinType: parsed.skinType || "normal",
        concerns: parsed.concerns || [],
        recommendations: parsed.recommendations || []
      };
    }
    
    throw new Error("Resposta inválida da IA");
  } catch (error) {
    console.error("❌ Erro ao analisar pele:", error);
    return simulateSkinAnalysis(skinCondition);
  }
}

function simulateSkinAnalysis(condition: string): SkinAnalysisResult {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes("oleosa") || lowerCondition.includes("brilho")) {
    return {
      skinType: "oleosa",
      concerns: ["Excesso de oleosidade", "Poros dilatados", "Tendência a acne"],
      recommendations: [
        "Use produtos oil-free e matificantes",
        "Lave o rosto 2x ao dia com sabonete específico",
        "Use tônicos com ácido salicílico"
      ]
    };
  }
  
  if (lowerCondition.includes("seca") || lowerCondition.includes("ressecada")) {
    return {
      skinType: "seca",
      concerns: ["Ressecamento", "Descamação", "Linhas finas"],
      recommendations: [
        "Hidrate intensamente 2x ao dia",
        "Use produtos com ácido hialurônico",
        "Evite água muito quente no rosto"
      ]
    };
  }
  
  return {
    skinType: "normal",
    concerns: ["Manutenção da saúde da pele"],
    recommendations: [
      "Mantenha rotina básica de limpeza e hidratação",
      "Use protetor solar diariamente",
      "Hidrate bem e beba água"
    ]
  };
}

/**
 * Recomenda produtos para skincare baseado no tipo de pele
 */
export async function getSkinProductRecommendations(skinType: string, concerns: string[]): Promise<SkinProductRecommendation> {
  if (!genAI) {
    return simulateSkinProducts(skinType, concerns);
  }

  try {
    console.log("💄 Buscando recomendações de produtos para pele...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
      }
    });

    const prompt = `Para pele ${skinType} com as seguintes preocupações: ${concerns.join(", ")}

Recomende 3-4 produtos de skincare disponíveis no Brasil (marcas como Neutrogena, Cetaphil, La Roche-Posay, Vichy, The Ordinary, CeraVe).

Responda em JSON:
{
  "products": [
    {
      "name": "Nome do Produto",
      "brand": "Marca",
      "description": "Descrição curta do produto e benefícios",
      "buyUrl": "https://www.example.com",
      "price": "R$ XX,XX"
    }
  ],
  "tips": ["dica1", "dica2", "dica3"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("📦 Resposta de produtos:", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        skinType,
        concerns,
        products: parsed.products || [],
        tips: parsed.tips || []
      };
    }
    
    throw new Error("Resposta inválida da IA");
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    return simulateSkinProducts(skinType, concerns);
  }
}

function simulateSkinProducts(skinType: string, concerns: string[]): SkinProductRecommendation {
  const products: SkinProduct[] = [];
  
  if (skinType === "oleosa") {
    products.push(
      {
        name: "Effaclar Gel de Limpeza",
        brand: "La Roche-Posay",
        description: "Gel de limpeza para pele oleosa que remove impurezas sem ressecar",
        buyUrl: "https://www.laroche-posay.com.br",
        price: "R$ 89,90"
      },
      {
        name: "Normaderm Phytosolution",
        brand: "Vichy",
        description: "Hidratante intensivo para pele oleosa com ácido salicílico",
        buyUrl: "https://www.vichy.com.br",
        price: "R$ 119,90"
      },
      {
        name: "Niacinamide 10% + Zinc 1%",
        brand: "The Ordinary",
        description: "Sérum que reduz oleosidade e minimiza poros",
        buyUrl: "https://www.sephora.com.br",
        price: "R$ 79,90"
      }
    );
  } else if (skinType === "seca") {
    products.push(
      {
        name: "Toleriane Dermo-Limpador",
        brand: "La Roche-Posay",
        description: "Limpador suave que hidrata enquanto limpa",
        buyUrl: "https://www.laroche-posay.com.br",
        price: "R$ 94,90"
      },
      {
        name: "Hyalu B5 Sérum",
        brand: "La Roche-Posay",
        description: "Sérum com ácido hialurônico para hidratação profunda",
        buyUrl: "https://www.laroche-posay.com.br",
        price: "R$ 189,90"
      },
      {
        name: "Natural Moisturizing Factors + HA",
        brand: "The Ordinary",
        description: "Creme hidratante com fatores naturais de hidratação",
        buyUrl: "https://www.sephora.com.br",
        price: "R$ 59,90"
      }
    );
  } else {
    products.push(
      {
        name: "Sabonete Facial Suave",
        brand: "Neutrogena",
        description: "Limpeza eficaz para todos os tipos de pele",
        buyUrl: "https://www.neutrogena.com.br",
        price: "R$ 34,90"
      },
      {
        name: "Hydra Genius Aloe Water",
        brand: "L'Oréal Paris",
        description: "Hidratante leve com extrato de aloe vera",
        buyUrl: "https://www.lorealparis.com.br",
        price: "R$ 49,90"
      },
      {
        name: "Protetor Solar FPS 50",
        brand: "Cetaphil",
        description: "Proteção solar diária para todos os tipos de pele",
        buyUrl: "https://www.cetaphil.com.br",
        price: "R$ 79,90"
      }
    );
  }

  return {
    skinType,
    concerns,
    products,
    tips: [
      "Mantenha uma rotina consistente de skincare",
      "Use protetor solar todos os dias, mesmo em dias nublados",
      "Beba pelo menos 2 litros de água por dia",
      "Durma bem - sua pele se regenera durante o sono"
    ]
  };
}
