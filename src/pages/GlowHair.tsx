import { useState } from "react";
import { Scissors, Sparkles, Wind, Droplets, Sun, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { getHairRecommendations, HairRecommendation } from "@/lib/ai-service";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { saveHairCheckIn } from "@/lib/database";

const GlowHair = () => {
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateStats = useUserStore((state) => state.updateStats);
  
  const [activeTab, setActiveTab] = useState("hair");
  const [hairCondition, setHairCondition] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<HairRecommendation | null>(null);

  // Formato do rosto do usuário (detectado pela IA no onboarding)
  const userFaceShape = profile?.faceShape || "oval";

  const conditions = [
    { id: "frizzy", label: "Com frizz", icon: Wind },
    { id: "oily", label: "Oleoso", icon: Droplets },
    { id: "dry", label: "Ressecado", icon: Sun },
    { id: "perfect", label: "Perfeito!", icon: Sparkles },
  ];

  // Recomendações de cortes baseadas no formato do rosto
  const haircutRecommendations = {
    oval: {
      shape: "Oval",
      description: "Você tem sorte! O rosto oval é versátil e combina com quase todos os cortes.",
      cuts: [
        {
          name: "Long Bob (Lob)",
          description: "Corte na altura dos ombros, moderno e elegante",
          tips: "Fica lindo com ondas naturais ou liso"
        },
        {
          name: "Camadas Longas",
          description: "Corte em camadas que começam na altura do queixo",
          tips: "Adiciona movimento e volume natural"
        },
        {
          name: "Franja Lateral",
          description: "Franja desfiada e lateral para suavizar",
          tips: "Perfeita para variar o visual sem mudanças drásticas"
        },
        {
          name: "Pixie Alongado",
          description: "Corte curto estiloso e prático",
          tips: "Ótimo para quem quer praticidade com estilo"
        }
      ],
      avoid: "Evite cortes muito retos que tiram a leveza natural do rosto oval"
    },
    redondo: {
      shape: "Redondo",
      description: "Cortes que alongam e criam ângulos são perfeitos para você!",
      cuts: [
        {
          name: "Long Bob com Camadas",
          description: "Corte abaixo do queixo com camadas frontais",
          tips: "Alonga o rosto e cria uma ilusão de formato oval"
        },
        {
          name: "Corte em V",
          description: "Cabelo longo com formato em V nas pontas",
          tips: "Cria linhas verticais que alongam o rosto"
        },
        {
          name: "Franja Lateral Longa",
          description: "Franja comprida e diagonal",
          tips: "Quebra a redondeza e adiciona assimetria favorável"
        },
        {
          name: "Pixie com Volume no Topo",
          description: "Corte curto com altura no topo da cabeça",
          tips: "O volume superior alonga visualmente o rosto"
        }
      ],
      avoid: "Evite franjas retas e cortes na altura do queixo que acentuam a redondeza"
    },
    quadrado: {
      shape: "Quadrado",
      description: "Cortes que suavizam a mandíbula e adicionam movimento são ideais!",
      cuts: [
        {
          name: "Ondas Longas",
          description: "Cabelo longo com ondas macias",
          tips: "Suaviza os ângulos da mandíbula"
        },
        {
          name: "Bob Assimétrico",
          description: "Corte bob mais longo na frente",
          tips: "Cria linhas diagonais que suavizam o formato quadrado"
        },
        {
          name: "Camadas na Altura da Bochecha",
          description: "Camadas que começam na linha dos olhos",
          tips: "Adicionam movimento e quebram a rigidez do formato"
        },
        {
          name: "Franja Desfiada",
          description: "Franja leve e texturizada",
          tips: "Suaviza a testa e balanceia as proporções"
        }
      ],
      avoid: "Evite cortes retos na altura do maxilar e muito volume nas laterais"
    },
    coração: {
      shape: "Coração",
      description: "Cortes que equilibram a testa larga com o queixo delicado!",
      cuts: [
        {
          name: "Bob na Altura do Queixo",
          description: "Corte médio que termina no queixo",
          tips: "Adiciona volume na parte inferior do rosto"
        },
        {
          name: "Camadas Abaixo do Queixo",
          description: "Camadas que começam após a linha da mandíbula",
          tips: "Balanceia a largura da testa"
        },
        {
          name: "Franja Lateral Suave",
          description: "Franja que cobre parte da testa",
          tips: "Reduz visualmente a largura da testa"
        },
        {
          name: "Ondas Volumosas",
          description: "Cachos ou ondas da altura do queixo para baixo",
          tips: "Cria equilíbrio entre testa e queixo"
        }
      ],
      avoid: "Evite muito volume no topo e cortes muito curtos que expõem o queixo"
    },
    alongado: {
      shape: "Alongado",
      description: "Cortes que adicionam largura e volume lateral são perfeitos!",
      cuts: [
        {
          name: "Bob Texturizado",
          description: "Corte médio com muito volume",
          tips: "Adiciona largura e quebra o comprimento do rosto"
        },
        {
          name: "Ondas na Altura dos Ombros",
          description: "Cabelo médio com ondas volumosas",
          tips: "Cria volume lateral que equilibra as proporções"
        },
        {
          name: "Franja Reta na Sobrancelha",
          description: "Franja pesada que cobre a testa",
          tips: "Reduz visualmente o comprimento do rosto"
        },
        {
          name: "Camadas Médias com Volume",
          description: "Camadas na altura das bochechas",
          tips: "Adiciona largura na região central do rosto"
        }
      ],
      avoid: "Evite cabelos muito longos e lisos que acentuam o comprimento do rosto"
    }
  };

  const currentFaceShape = haircutRecommendations[userFaceShape as keyof typeof haircutRecommendations];

  const handleSubmit = async () => {
    if (!hairCondition || !profile?.email) return;
    
    setIsLoadingRecommendation(true);
    
    try {
      const result = await getHairRecommendations(
        hairCondition,
        userFaceShape,
        profile?.gender || "feminino"
      );
      
      setAiRecommendation(result);
      setShowRecommendation(true);
      
      // Salvar check-in no Supabase
      try {
        await saveHairCheckIn({
          user_email: profile.email,
          condition: hairCondition,
          recommendations: result.recommendations.join(', '),
          styling_tips: result.stylingTips?.join(', ') || null,
        });
      } catch (dbError) {
        console.error("Erro ao salvar check-in:", dbError);
        // Continua mesmo se falhar salvar no banco
      }
      
      // Atualizar estatísticas
      updateStats({ checkIns: (profile.stats.checkIns || 0) + 1 });
      
      toast({
        title: "Recomendações prontas! ✨",
        description: "Confira suas dicas personalizadas abaixo",
      });
      
    } catch (error) {
      console.error("Erro ao obter recomendações:", error);
      toast({
        title: "Erro ao gerar recomendações",
        description: "Vamos usar recomendações padrão.",
        variant: "destructive",
      });
      
      // Usar recomendação padrão
      setAiRecommendation(getDefaultRecommendation());
      setShowRecommendation(true);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const getDefaultRecommendation = (): HairRecommendation => {
    const recommendations: Record<string, string[]> = {
      frizzy: [
        "Use leave-in anti-frizz",
        "Evite secador no calor máximo",
        "Aplique óleo nas pontas"
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

    return {
      condition: hairCondition,
      recommendations: recommendations[hairCondition] || recommendations.perfect,
      stylingTips: [`Cortes que favorecem rosto ${userFaceShape}`]
    };
  };

  const recommendation = aiRecommendation || getDefaultRecommendation();

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center shadow-soft">
              <Scissors className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Glow Hair</h1>
              <p className="text-sm text-muted-foreground">Cuidado com o cabelo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Tabs de navegação */}
        <Tabs defaultValue="checkin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="checkin">Check-in Diário</TabsTrigger>
            <TabsTrigger value="cortes">Cortes para Você</TabsTrigger>
          </TabsList>

          {/* Tab: Check-in Diário */}
          <TabsContent value="checkin" className="space-y-6">
            {/* Check-in */}
            {!showRecommendation ? (
              <Card className="p-6 shadow-medium border-secondary/20 bg-card/50 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold">Como está seu cabelo hoje?</h2>
                    <p className="text-sm text-muted-foreground">
                      Nossa IA vai recomendar cuidados e cortes ideais para seu rosto <strong>{userFaceShape}</strong> {profile?.gender === "masculino" ? "👨" : "👩"}
                    </p>
                  </div>

                  <RadioGroup value={hairCondition} onValueChange={setHairCondition}>
                    <div className="space-y-3">
                      {conditions.map((condition) => {
                        const ConditionIcon = condition.icon;
                        return (
                          <Label
                            key={condition.id}
                            htmlFor={condition.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              hairCondition === condition.id
                                ? "border-secondary bg-secondary/10 shadow-soft"
                                : "border-border hover:border-secondary/50 hover:bg-secondary/5"
                            }`}
                          >
                            <RadioGroupItem value={condition.id} id={condition.id} />
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                              <ConditionIcon className="w-5 h-5 text-secondary-foreground" />
                            </div>
                            <span className="flex-1 font-medium">{condition.label}</span>
                          </Label>
                        );
                      })}
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={handleSubmit}
                    disabled={!hairCondition || isLoadingRecommendation}
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity shadow-medium"
                    size="lg"
                  >
                    {isLoadingRecommendation ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Gerando recomendações...
                      </>
                    ) : (
                      "Ver recomendações"
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Recomendações */}
                <Card className="p-6 shadow-glow border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center shadow-medium">
                        <Sparkles className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">Recomendações IA</h3>
                        <p className="text-xs text-muted-foreground">
                          🤖 Gemini AI • Rosto {userFaceShape} • {profile?.gender === "masculino" ? "👨" : "👩"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {recommendation.recommendations.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-card/50"
                        >
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-secondary-foreground">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Sugestão de estilo baseada no rosto */}
                <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Scissors className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Cortes ideais para seu rosto</h4>
                        <span className="text-xs bg-accent/20 px-2 py-1 rounded-full">
                          {userFaceShape}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Personalizados para formato de rosto {userFaceShape} e perfil {profile?.gender === "masculino" ? "masculino" : "feminino"}
                      </p>
                      {recommendation.stylingTips.map((tip, index) => (
                        <p key={index} className="text-sm">• {tip}</p>
                      ))}
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={() => {
                    setShowRecommendation(false);
                    setAiRecommendation(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Fazer novo check-in
                </Button>
              </>
            )}

            {/* Produtos Recomendados */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-1">Produtos para você</h3>
              
              <Card className="p-4 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Leave-in Nutritivo</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Perfeito para seu tipo de cabelo
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Ver opções →
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Cortes para Você */}
          <TabsContent value="cortes" className="space-y-6">
            {/* Info do formato do rosto detectado pela IA */}
            <Card className="p-6 shadow-medium border-primary/20 bg-gradient-primary/5 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Rosto {currentFaceShape.shape}</h3>
                    <p className="text-xs text-muted-foreground">
                      Detectado automaticamente pela IA ✨
                    </p>
                  </div>
                  {profile?.analysisConfidence && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{profile.analysisConfidence}%</p>
                      <p className="text-xs text-muted-foreground">precisão</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentFaceShape.description}
                </p>
              </div>
            </Card>

            {/* Cortes Recomendados */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-1">Cortes que valorizam você ✨</h3>
              
              {currentFaceShape.cuts.map((cut, index) => (
                <Card
                  key={index}
                  className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {cut.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {cut.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                      <Sparkles className="w-4 h-4 text-secondary-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Dica: </span>
                        {cut.tips}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* O que evitar */}
            <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">⚠️ O que evitar</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentFaceShape.avoid}
                  </p>
                </div>
              </div>
            </Card>

            {/* CTA para consulta */}
            <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
                  <Scissors className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Pronta para mudar?</h4>
                  <p className="text-sm text-muted-foreground">
                    Leve essas sugestões para seu cabeleireiro de confiança!
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity shadow-medium">
                  Salvar minhas sugestões
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowHair;
