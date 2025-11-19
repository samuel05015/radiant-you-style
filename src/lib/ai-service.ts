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

    const prompt = `Analise esta foto de rosto com PRECISÃO e CONSISTÊNCIA. Forneça as seguintes informações em formato JSON:
    
1. Formato do rosto: escolha entre "oval", "redondo", "quadrado", "coração", ou "alongado"
   - Oval: rosto equilibrado, ligeiramente mais longo que largo
   - Redondo: largura e comprimento similares, contornos suaves
   - Quadrado: mandíbula definida, testa e maxilar de larguras similares
   - Coração: testa larga, queixo pontudo
   - Alongado: rosto notavelmente mais longo que largo

2. Tom de pele (coloração pessoal): escolha entre "primavera", "verão", "outono", ou "inverno"
   - Primavera: tons quentes, pele clara a média com subtom dourado
   - Verão: tons frios, pele clara a média com subtom rosado
   - Outono: tons quentes, pele média a escura com subtom dourado/acobreado
   - Inverno: tons frios, pele clara ou escura com alto contraste

3. Nível de confiança da análise (0-100)

4. Breve análise explicando as características observadas

Responda APENAS com um JSON válido no formato:
{
  "faceShape": "formato",
  "skinTone": "tom",
  "confidence": número,
  "analysis": "texto explicativo"
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
  closetItems?: any[]
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
      ? "para homem, com peças masculinas (camisa, calça, sapato social/tênis, acessórios masculinos)"
      : "para mulher, com peças femininas (blusa, saia/calça, salto/tênis, acessórios femininos)";

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
        i.category.toLowerCase().includes('top')
      );
      const firstBottom = closetItems.find(i => 
        i.category.toLowerCase().includes('calça') || 
        i.category.toLowerCase().includes('saia') ||
        i.category.toLowerCase().includes('short')
      );
      const firstShoes = closetItems.find(i => 
        i.category.toLowerCase().includes('sapato') || 
        i.category.toLowerCase().includes('tênis') ||
        i.category.toLowerCase().includes('sandália') ||
        i.category.toLowerCase().includes('bota')
      );
      
      const exampleTop = firstTop ? `"${firstTop.category} ${firstTop.color}"` : '"PRECISA ADICIONAR: Blusa/Camisa"';
      const exampleBottom = firstBottom ? `"${firstBottom.category} ${firstBottom.color}"` : '"PRECISA ADICIONAR: Calça/Saia"';
      const exampleShoes = firstShoes ? `"${firstShoes.category} ${firstShoes.color}"` : '"PRECISA ADICIONAR: Sapato/Tênis"';
      
      prompt = `Você é um personal stylist. Monte um look usando APENAS estas peças do closet:

${itemsList}

Cliente: ${gender}, tom ${skinTone}, rosto ${faceShape}

REGRA: Escolha peças da lista acima. Se não tiver alguma categoria, escreva "PRECISA ADICIONAR: [tipo]".

Responda EXATAMENTE neste formato JSON (use as peças da lista):
{
  "occasion": "casual",
  "outfit": {
    "top": ${exampleTop},
    "bottom": ${exampleBottom},
    "shoes": ${exampleShoes},
    "accessories": ["brincos", "bolsa"]
  },
  "makeup": "make natural com batom nude",
  "hair": "cabelo solto com ondas",
  "reasoning": "Usei [peça X] + [peça Y] porque combinam em cor e estilo"
}`;
    } else {
      // MODO: Sem peças - recomendação genérica
      prompt = `Como personal stylist ${genderContext}, sugira um look completo para comprar:

Gênero: ${gender}
Tom de pele: ${skinTone}
Formato do rosto: ${faceShape}
Ocasião: ${occasion}

Responda APENAS com JSON válido:
{
  "occasion": "${occasion}",
  "outfit": {
    "top": "sugestão de compra específica",
    "bottom": "sugestão de compra específica",
    "shoes": "sugestão de compra específica",
    "accessories": ["acessório 1", "acessório 2"]
  },
  "makeup": "sugestão de make",
  "hair": "sugestão de penteado",
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
    return simulateOutfitRecommendation(skinTone, occasion, closetItems);
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

    const prompt = `Como dermatologista especializado ${genderContext}, crie uma rotina de skincare:

Tipo de pele: ${skinType}
Tom de pele: ${skinTone}
Gênero: ${gender}
${concerns ? `Preocupações: ${concerns.join(', ')}` : ''}

Forneça:
1. Rotina completa (manhã e noite) com 5-7 passos DETALHADOS
2. Lista de 5-7 produtos ESPECÍFICOS com nomes reais de marcas
3. Dica importante personalizada

Responda APENAS com JSON válido:
{
  "routine": ["passo 1 detalhado", "passo 2 detalhado", ...],
  "products": ["produto 1 com marca", "produto 2 com marca", ...],
  "tips": "dica personalizada importante"
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

function simulateOutfitRecommendation(skinTone: string, occasion: string, closetItems?: any[]): OutfitRecommendation {
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
      return cat.includes('sapato') || cat.includes('tênis') || cat.includes('sandália') || 
             cat.includes('bota') || cat.includes('chinelo');
    });

    console.log("✅ Peças encontradas:");
    console.log("  Top:", top ? `${top.category} ${top.color}` : "não encontrado");
    console.log("  Bottom:", bottom ? `${bottom.category} ${bottom.color}` : "não encontrado");
    console.log("  Shoes:", shoes ? `${shoes.category} ${shoes.color}` : "não encontrado");

    return {
      occasion,
      outfit: {
        top: top ? `${top.category} ${top.color}` : "ADICIONE: Blusa/Camisa",
        bottom: bottom ? `${bottom.category} ${bottom.color}` : "ADICIONE: Calça/Saia",
        shoes: shoes ? `${shoes.category} ${shoes.color}` : "ADICIONE: Sapato/Tênis",
        accessories: ["Brincos delicados", "Bolsa transversal"]
      },
      makeup: `Base leve, blush ${skinTone === "primavera" || skinTone === "outono" ? "pêssego" : "rosado"}, gloss nude`,
      hair: "Ondas naturais soltas",
      reasoning: `✨ Montei seu look com suas peças: ${top ? top.category : 'FALTA TOP'} + ${bottom ? bottom.category : 'FALTA BOTTOM'}. ${!shoes ? 'Adicione sapatos ao closet!' : ''}`
    };
  }
  
  // Fallback genérico se não tiver peças
  const outfits = {
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

  const selectedOutfit = outfits[occasion as keyof typeof outfits] || outfits.casual;

  return {
    occasion,
    outfit: selectedOutfit,
    makeup: `Base leve, blush ${skinTone === "primavera" || skinTone === "outono" ? "pêssego" : "rosado"}, gloss nude`,
    hair: "Ondas naturais soltas",
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

1. CATEGORIA: Escolha UMA das opções abaixo:
   - Camiseta
   - Camisa
   - Blusa
   - Regata
   - Moletom
   - Jaqueta
   - Calça
   - Shorts
   - Saia
   - Vestido
   - Sapato
   - Tênis
   - Sandália
   - Bota

2. COR: Identifique a cor predominante (ex: azul, preto, branco, vermelho)

3. DESCRIÇÃO: Uma frase curta descrevendo o estilo da peça

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
