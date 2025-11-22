import { useState, useRef } from "react";
import { Scissors, Sparkles, Wind, Droplets, Sun, ChevronRight, Loader2, ExternalLink, ShoppingCart, Camera, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { getHairProductRecommendations, HairProductRecommendation, getHaircutRecommendation, HaircutRecommendation, analyzeFaceImage, analyzeHairImage, HairAnalysisResult, getHairRecommendations } from "@/lib/ai-service";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { saveHairCheckIn, saveHaircutRecommendation } from "@/lib/database";
import { supabase } from "@/lib/supabase";

const GlowHair = () => {
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateStats = useUserStore((state) => state.updateStats);
  const setProfile = useUserStore((state) => state.setProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("hair");
  const [hairCondition, setHairCondition] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [productRecommendations, setProductRecommendations] = useState<HairProductRecommendation | null>(null);
  const [haircutRecommendation, setHaircutRecommendation] = useState<HaircutRecommendation | null>(null);
  const [isLoadingHaircut, setIsLoadingHaircut] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysisResult, setHairAnalysisResult] = useState<HairAnalysisResult | null>(null);
  const [hairImageProductRecommendations, setHairImageProductRecommendations] = useState<HairProductRecommendation | null>(null);
  const [showHaircutResult, setShowHaircutResult] = useState(false);
  const [isSavingHaircut, setIsSavingHaircut] = useState(false);
  const [currentTab, setCurrentTab] = useState("checkin");

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
      const result = await getHairProductRecommendations(
        hairCondition,
        profile?.gender || "feminino"
      );
      
      setProductRecommendations(result);
      setShowRecommendation(true);
      
      // Buscar recomendação de corte também
      try {
        const haircutResult = await getHaircutRecommendation(
          profile?.faceShape || "oval",
          hairCondition,
          profile?.gender || "feminino"
        );
        setHaircutRecommendation(haircutResult);
      } catch (haircutError) {
        console.error("Erro ao buscar corte:", haircutError);
      }
      
      // Salvar check-in no Supabase
      try {
        if (profile.id) {
          await saveHairCheckIn({
            profile_id: profile.id,
            date: new Date().toISOString().split('T')[0],
            condition: hairCondition,
            recommendations: result.products.map(p => p.name),
            styling_tips: result.tips || [],
          });
        }
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
      
      setShowRecommendation(true);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          setCapturedPhoto(base64String);

          console.log("📸 Foto capturada, iniciando análise...");

          // Analisar rosto com IA (sempre necessário)
          const analysis = await analyzeFaceImage(base64String);
          console.log("✅ Análise facial completa:", analysis);

          // Se estiver na aba "Saúde Capilar", fazer análise do cabelo
          if (currentTab === "saude") {
            const hairAnalysis = await analyzeHairImage(base64String);
            console.log("✅ Análise capilar completa:", hairAnalysis);
            setHairAnalysisResult(hairAnalysis);
          }

          if (!profile?.email) {
            throw new Error("Email do perfil não encontrado");
          }

          // Atualizar perfil no Supabase (apenas formato e tom)
          const { error } = await supabase
            .from('profiles')
            .update({
              faceShape: analysis.faceShape,
              skinTone: analysis.skinTone
            })
            .eq('email', profile.email);

          if (error) {
            console.error("❌ Erro Supabase:", error);
            // Continua mesmo com erro no Supabase
          } else {
            console.log("💾 Perfil atualizado no Supabase");
          }

          // Atualizar estado local (incluindo a foto)
          await setProfile({
            ...profile,
            faceShape: analysis.faceShape,
            skinTone: analysis.skinTone,
            photoUrl: base64String,
            analysisConfidence: analysis.confidence
          });

          // Se estiver na aba "Saúde Capilar", buscar produtos para os problemas detectados
          if (currentTab === "saude" && hairAnalysisResult) {
            // Mapear o primeiro problema detectado para condição entendida pelo sistema
            const primaryIssue = hairAnalysisResult.issues && hairAnalysisResult.issues.length > 0 ? hairAnalysisResult.issues[0] : null;
            const conditionMap: { [key: string]: string } = {
              frizz: 'frizzy',
              'ressecamento': 'dry',
              'queda': 'perfect',
              'pontas duplas': 'dry',
              'caspa': 'perfect',
              'oleosidade excessiva': 'oily'
            };

            const conditionKey = primaryIssue ? (conditionMap[primaryIssue] || 'perfect') : 'perfect';

            // Buscar recomendações de produtos baseadas no problema detectado
            try {
              const prodRec = await getHairProductRecommendations(conditionKey, profile?.gender || 'feminino');
              setHairImageProductRecommendations(prodRec);
            } catch (prodErr) {
              console.error('Erro ao obter produtos para análise de imagem:', prodErr);
              setHairImageProductRecommendations(null);
            }

            // Buscar recomendações de cuidados (rotina/dicas)
            try {
              const careRec = await getHairRecommendations(conditionKey, analysis.faceShape, profile?.gender || 'feminino', undefined);
              console.log('Dicas de cuidado recebidas:', careRec);
            } catch (careErr) {
              console.error('Erro ao obter dicas de cuidado:', careErr);
            }
          }

          // Se estiver na aba "Cortes para Você", buscar recomendação de corte
          if (currentTab === "cortes") {
            console.log("🔍 Buscando recomendação de corte...");
            console.log("Formato:", analysis.faceShape);
            console.log("Gênero:", profile?.gender || "feminino");

            const haircutResult = await getHaircutRecommendation(
              analysis.faceShape,
              "perfect",
              profile?.gender || "feminino"
            );
            
            console.log("✂️ Corte recomendado:", haircutResult);
            
            setHaircutRecommendation(haircutResult);
            setShowHaircutResult(true);

            toast({
              title: "Análise completa! ✨",
              description: `Formato: ${analysis.faceShape} • Corte recomendado!`,
            });
          } else if (currentTab === "saude") {
            toast({
              title: "Análise capilar completa! 🔬",
              description: `${hairAnalysisResult?.issues.length || 0} problema(s) detectado(s)`,
            });
          }

          setIsAnalyzing(false);
        } catch (innerError) {
          console.error("❌ Erro na análise:", innerError);
          setIsAnalyzing(false);
          toast({
            title: "Erro ao analisar foto",
            description: innerError instanceof Error ? innerError.message : "Tente novamente",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        setIsAnalyzing(false);
        toast({
          title: "Erro ao ler arquivo",
          description: "Tente novamente",
          variant: "destructive",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ Erro geral:", error);
      toast({
        title: "Erro ao processar foto",
        description: "Tente novamente com outra foto",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const handleDeletePhoto = () => {
    setCapturedPhoto(null);
    setShowHaircutResult(false);
    setHaircutRecommendation(null);
    setHairAnalysisResult(null);
    setHairImageProductRecommendations(null);
  };

  const handleSaveHaircut = async () => {
    if (!haircutRecommendation || !profile?.email) return;

    setIsSavingHaircut(true);
    
    try {
      const success = await saveHaircutRecommendation({
        user_email: profile.email,
        face_shape: profile.faceShape || "oval",
        cut_name: haircutRecommendation.cutName,
        description: haircutRecommendation.description,
        why_it_works: haircutRecommendation.whyItWorks,
        styling_tips: haircutRecommendation.stylingTips.join('\n'),
        image_url: haircutRecommendation.imageUrl
      });

      if (success) {
        // Incrementar análises realizadas
        updateStats({ checkIns: (profile.stats.checkIns || 0) + 1 });
        
        toast({
          title: "Corte salvo! ✂️",
          description: "Você pode ver suas recomendações salvas a qualquer momento",
        });
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar corte:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSavingHaircut(false);
    }
  };

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
        <Tabs defaultValue="checkin" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="checkin">Check-in Diário</TabsTrigger>
            <TabsTrigger value="cortes">Cortes para Você</TabsTrigger>
            <TabsTrigger value="saude">Saúde Capilar</TabsTrigger>
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
                {/* Produtos Recomendados */}
                {productRecommendations && (
                  <>
                    <Card className="p-6 shadow-glow border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center shadow-medium">
                            <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold">Produtos Recomendados</h3>
                            <p className="text-xs text-muted-foreground">
                              🤖 Gemini AI • {productRecommendations.products.length} produtos ideais para você
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {productRecommendations.products.map((product, index) => (
                            <Card key={index} className="overflow-hidden border-border/50 hover:border-secondary/50 transition-all">
                              <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-base">{product.name}</h4>
                                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                                  </div>
                                  <span className="text-lg font-semibold text-secondary">{product.price}</span>
                                </div>
                                <p className="text-sm">{product.description}</p>
                                <Button 
                                  variant="outline" 
                                  className="w-full gap-2"
                                  onClick={() => window.open(product.buyUrl, '_blank')}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Onde comprar
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Corte Recomendado */}
                    {haircutRecommendation && (
                      <Card className="overflow-hidden shadow-glow border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
                        <div className="relative h-64 w-full">
                          <img 
                            src={haircutRecommendation.imageUrl} 
                            alt={haircutRecommendation.cutName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-2xl font-bold mb-1">{haircutRecommendation.cutName}</h3>
                            <p className="text-sm opacity-90">✂️ Recomendado pela IA para você</p>
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Como é o corte</h4>
                            <p className="text-sm">{haircutRecommendation.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Por que funciona para você</h4>
                            <p className="text-sm">{haircutRecommendation.whyItWorks}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dicas de finalização</h4>
                            <div className="space-y-1">
                              {haircutRecommendation.stylingTips.map((tip, index) => (
                                <p key={index} className="text-sm">• {tip}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Dicas de cuidado */}
                    {productRecommendations.tips && productRecommendations.tips.length > 0 && (
                      <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold">Dicas de Cuidado</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              Recomendações personalizadas para {productRecommendations.condition}
                            </p>
                            {productRecommendations.tips.map((tip, index) => (
                              <p key={index} className="text-sm">• {tip}</p>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}

                <Button
                  onClick={() => {
                    setShowRecommendation(false);
                    setProductRecommendations(null);
                    setHaircutRecommendation(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Fazer novo check-in
                </Button>
              </>
            )}
          </TabsContent>

          {/* Tab: Cortes para Você */}
          <TabsContent value="cortes" className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!showHaircutResult ? (
              <>
                {/* Captura de foto para análise de rosto */}
                <Card className="p-6 shadow-medium border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto shadow-soft">
                        <Camera className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold">Tire uma foto do seu rosto</h2>
                      <p className="text-sm text-muted-foreground">
                        A IA vai analisar seu formato de rosto e recomendar o corte ideal
                      </p>
                    </div>

                    {capturedPhoto && (
                      <div className="relative">
                        <img
                          src={capturedPhoto}
                          alt="Sua foto"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={handleDeletePhoto}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={handlePhotoCapture}
                      disabled={isAnalyzing}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analisando formato do rosto...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          {capturedPhoto ? "Escolher outra foto" : "Escolher foto"}
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <p>📸 Tire foto ou escolha da galeria</p>
                      <p>✨ Análise de formato de rosto</p>
                      <p>✂️ Recomendação de cortes personalizados</p>
                    </div>
                  </div>
                </Card>

                {profile?.faceShape && (
                  <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-10 h-10 text-primary" />
                      <div>
                        <h4 className="font-semibold">Última análise de rosto</h4>
                        <p className="text-sm text-muted-foreground">
                          Formato: {profile.faceShape} • Tom: {profile.skinTone}
                        </p>
                        {profile.analysisConfidence && (
                          <p className="text-xs text-muted-foreground">
                            Precisão: {profile.analysisConfidence}%
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Resultado do corte recomendado */}
                {haircutRecommendation && (
                  <Card className="overflow-hidden shadow-glow border-primary/30">
                    <div className="relative h-80 w-full">
                      <img 
                        src={haircutRecommendation.imageUrl} 
                        alt={haircutRecommendation.cutName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Scissors className="w-5 h-5" />
                          <span className="text-sm font-medium">Recomendado pela IA</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{haircutRecommendation.cutName}</h2>
                        <p className="text-sm opacity-90">
                          Formato de rosto: {profile?.faceShape || "oval"}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Como é o corte
                        </h4>
                        <p className="text-sm text-muted-foreground">{haircutRecommendation.description}</p>
                      </div>

                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold mb-2 text-primary">Por que funciona para você</h4>
                        <p className="text-sm">{haircutRecommendation.whyItWorks}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Dicas de finalização</h4>
                        <div className="space-y-2">
                          {haircutRecommendation.stylingTips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold">{index + 1}</span>
                              </div>
                              <p className="text-sm">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveHaircut}
                        disabled={isSavingHaircut}
                        className="w-full gap-2"
                        size="lg"
                      >
                        {isSavingHaircut ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Salvar esta recomendação
                          </>
                        )}
                      </Button>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowHaircutResult(false)}
                          className="flex-1"
                        >
                          Tirar nova foto
                        </Button>
                        <Button
                          onClick={handlePhotoCapture}
                          variant="secondary"
                          className="flex-1 gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Nova análise
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

          </TabsContent>

          {/* Tab: Saúde Capilar */}
          <TabsContent value="saude" className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <Card className="p-6 shadow-medium border-accent/20 bg-gradient-to-br from-accent/5 to-secondary/5 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent to-secondary flex items-center justify-center mx-auto shadow-soft">
                    <Camera className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">Analise a saúde do seu cabelo</h2>
                  <p className="text-sm text-muted-foreground">
                    A IA vai detectar problemas capilares e recomendar produtos e tratamentos
                  </p>
                </div>

                {capturedPhoto && (
                  <div className="relative">
                    <img
                      src={capturedPhoto}
                      alt="Foto do cabelo"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleDeletePhoto}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {hairAnalysisResult && (
                  <Card className="p-4 shadow-soft border-border/30 bg-card/60">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Análise do Cabelo</h4>
                          <p className="text-xs text-muted-foreground">Confiança: {hairAnalysisResult.confidence}%</p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">Problemas detectados</h5>
                        <div className="flex flex-wrap gap-2">
                          {hairAnalysisResult.issues.map((issue, idx) => (
                            <span 
                              key={idx} 
                              className={`px-3 py-1 rounded-full text-sm ${
                                hairAnalysisResult.severity[issue] === 'grave' 
                                  ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                                  : hairAnalysisResult.severity[issue] === 'moderado'
                                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30'
                                  : 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30'
                              }`}
                            >
                              {issue} • {hairAnalysisResult.severity[issue]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {hairAnalysisResult.recommendations && hairAnalysisResult.recommendations.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Recomendações rápidas</h5>
                          <ul className="space-y-1 text-sm">
                            {hairAnalysisResult.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {hairImageProductRecommendations && (
                  <Card className="p-5 shadow-glow border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center shadow-medium">
                          <ShoppingCart className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">Produtos Recomendados</h3>
                          <p className="text-xs text-muted-foreground">Baseados na análise da sua foto</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {hairImageProductRecommendations.products.map((product, index) => (
                          <Card key={index} className="overflow-hidden border-border/50 hover:border-secondary/50 transition-all">
                            <div className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-base">{product.name}</h4>
                                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                                </div>
                                <span className="text-lg font-semibold text-secondary">{product.price}</span>
                              </div>
                              <p className="text-sm">{product.description}</p>
                              <Button 
                                variant="outline" 
                                className="w-full gap-2"
                                onClick={() => window.open(product.buyUrl, '_blank')}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Onde comprar
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {hairImageProductRecommendations.tips && hairImageProductRecommendations.tips.length > 0 && (
                        <Card className="p-4 bg-accent/5 border-accent/20">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <h4 className="font-semibold">Dicas de Uso</h4>
                              {hairImageProductRecommendations.tips.map((tip, index) => (
                                <p key={index} className="text-sm">• {tip}</p>
                              ))}
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </Card>
                )}

                <Button
                  onClick={handlePhotoCapture}
                  disabled={isAnalyzing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analisando saúde capilar...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      {capturedPhoto ? "Escolher outra foto" : "Escolher foto do cabelo"}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>📸 Tire foto ou escolha da galeria</p>
                  <p>🔬 Análise de problemas capilares</p>
                  <p>💊 Recomendação de produtos específicos</p>
                </div>
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
