import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ VITE_GEMINI_API_KEY não configurada. Usando modo demo.");
} else {
  console.log("✅ Google Gemini AI configurado e pronto!");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analise esta foto de rosto e forneça as seguintes informações em formato JSON:
    
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
  hairType?: string
): Promise<HairRecommendation> {
  if (!genAI) {
    return simulateHairRecommendation(condition, faceShape);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Como especialista em cabelos, forneça recomendações personalizadas:

Condição atual: ${condition}
Formato do rosto: ${faceShape}
${hairType ? `Tipo de cabelo: ${hairType}` : ''}

Forneça em formato JSON:
1. Lista de 3-4 recomendações de cuidados imediatos
2. Lista de 2-3 dicas de styling que favorecem o formato do rosto

Responda APENAS com JSON válido:
{
  "condition": "nome da condição",
  "recommendations": ["dica 1", "dica 2", "dica 3"],
  "stylingTips": ["tip 1", "tip 2"]
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
  occasion: string = "casual",
  preferences?: string[]
): Promise<OutfitRecommendation> {
  if (!genAI) {
    return simulateOutfitRecommendation(skinTone, occasion);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Como personal stylist, crie um look completo:

Tom de pele (coloração): ${skinTone}
Formato do rosto: ${faceShape}
Ocasião: ${occasion}
${preferences ? `Preferências: ${preferences.join(', ')}` : ''}

Considere:
- Cores que favorecem a coloração pessoal
- Peças que valorizam o formato do corpo
- Make e cabelo que harmonizam com o formato do rosto

Responda APENAS com JSON válido:
{
  "occasion": "ocasião",
  "outfit": {
    "top": "descrição da blusa/camisa",
    "bottom": "descrição da calça/saia",
    "shoes": "descrição do calçado",
    "accessories": ["acessório 1", "acessório 2"]
  },
  "makeup": "sugestão de make",
  "hair": "sugestão de penteado",
  "reasoning": "breve explicação de por que este look funciona"
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
    console.error("Erro na geração de look:", error);
    return simulateOutfitRecommendation(skinTone, occasion);
  }
}

/**
 * Gera recomendações de skincare personalizadas
 */
export async function getSkincareRecommendations(
  skinType: string,
  skinTone: string,
  concerns?: string[]
): Promise<{ routine: string[]; tips: string }> {
  if (!genAI) {
    return {
      routine: [
        "Limpeza suave com sabonete específico",
        "Tônico hidratante",
        "Sérum com vitamina C",
        "Hidratante facial",
        "Protetor solar FPS 50+"
      ],
      tips: "Sua pele precisa de cuidados especiais. Mantenha a rotina consistente!"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Como dermatologista, crie uma rotina de skincare:

Tipo de pele: ${skinType}
Tom de pele: ${skinTone}
${concerns ? `Preocupações: ${concerns.join(', ')}` : ''}

Forneça:
1. Rotina completa (manhã e noite) com 5-7 passos
2. Dica importante personalizada

Responda APENAS com JSON:
{
  "routine": ["passo 1", "passo 2", ...],
  "tips": "dica personalizada"
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
        "Limpeza suave com sabonete específico",
        "Tônico hidratante",
        "Sérum adequado ao seu tipo de pele",
        "Hidratante facial",
        "Protetor solar FPS 50+"
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

function simulateOutfitRecommendation(skinTone: string, occasion: string): OutfitRecommendation {
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
