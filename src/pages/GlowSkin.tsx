import { useState, useMemo } from "react";
import { Heart, CheckCircle2, Circle, Droplets, Shield, Sparkles, Scan, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { analyzeSkinCondition, getSkinProductRecommendations, SkinAnalysisResult, SkinProductRecommendation } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/user-store";

const GlowSkin = () => {
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateStats = useUserStore((state) => state.updateStats);
  const [activeTab, setActiveTab] = useState("skin");
  const [currentView, setCurrentView] = useState<"routine" | "analysis">("routine");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [skinCondition, setSkinCondition] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skinAnalysis, setSkinAnalysis] = useState<SkinAnalysisResult | null>(null);
  const [productRecommendations, setProductRecommendations] = useState<SkinProductRecommendation | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const isMale = profile?.gender === "masculino";

  const routineSteps = useMemo(() => {
    const cleaningItems = isMale 
      ? ["Lavar o rosto com sabonete suave"]
      : ["Lavar o rosto com sabonete suave", "Remover maquiagem completamente"];

    return [
      {
        category: "Limpeza",
        icon: Droplets,
        color: "primary",
        items: cleaningItems,
      },
      {
        category: "Hidratação",
        icon: Heart,
        color: "secondary",
        items: [
          "Aplicar tônico facial",
          "Passar hidratante específico",
          "Hidratante para área dos olhos",
        ],
      },
      {
        category: "Proteção",
        icon: Shield,
        color: "accent",
        items: [
          "Protetor solar FPS 50+",
          "Reaplicar protetor (se necessário)",
        ],
      },
    ];
  }, [isMale]);

  const handleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleAnalyzeSkin = async () => {
    if (!skinCondition.trim()) {
      toast({
        title: "Descreva sua pele",
        description: "Por favor, descreva como está sua pele atualmente",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSkinCondition(skinCondition);
      setSkinAnalysis(analysis);
      
      toast({
        title: "Análise concluída! ✨",
        description: `Sua pele é ${analysis.skinType}`,
      });
      
      // Carregar recomendações de produtos
      loadProductRecommendations(analysis.skinType, analysis.concerns);
    } catch (error) {
      console.error("Erro ao analisar pele:", error);
      toast({
        title: "Erro na análise",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadProductRecommendations = async (skinType: string, concerns: string[]) => {
    setIsLoadingProducts(true);
    try {
      const recommendations = await getSkinProductRecommendations(skinType, concerns);
      setProductRecommendations(recommendations);
      
      // Incrementar análises realizadas
      if (profile?.stats) {
        updateStats({ checkIns: (profile.stats.checkIns || 0) + 1 });
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const totalSteps = routineSteps.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedSteps = Object.values(checkedItems).filter(Boolean).length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Glow Skin</h1>
              <p className="text-sm text-muted-foreground">Sua rotina de skincare</p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentView === "routine" && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso de hoje</span>
                <span className="font-semibold text-primary">
                  {completedSteps}/{totalSteps}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Tabs */}
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as "routine" | "analysis")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routine">Rotina</TabsTrigger>
            <TabsTrigger value="analysis">Análise IA</TabsTrigger>
          </TabsList>

          {/* Rotina Tab */}
          <TabsContent value="routine" className="space-y-6 mt-6">
        {/* Recomendação */}
        <Card className="p-5 shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Dica do dia</h3>
              <p className="text-sm text-muted-foreground">
                Sua pele Primavera ama vitamina C! Experimente um sérum pela manhã para mais luminosidade.
              </p>
            </div>
          </div>
        </Card>

        {/* Routine Checklist */}
        {routineSteps.map((category) => {
          const CategoryIcon = category.icon;
          const completedInCategory = category.items.filter(
            (item) => checkedItems[item]
          ).length;

          return (
            <Card
              key={category.category}
              className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${category.color}/10 flex items-center justify-center`}>
                    <CategoryIcon className={`w-5 h-5 text-${category.color}-foreground`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.category}</h3>
                    <p className="text-xs text-muted-foreground">
                      {completedInCategory}/{category.items.length} completos
                    </p>
                  </div>
                </div>
                {completedInCategory === category.items.length && (
                  <CheckCircle2 className="w-6 h-6 text-primary animate-scale-in" />
                )}
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <Checkbox
                      checked={checkedItems[item] || false}
                      onCheckedChange={() => handleCheck(item)}
                      className="data-[state=checked]:bg-gradient-primary data-[state=checked]:border-primary"
                    />
                    <span
                      className={`flex-1 text-sm transition-all ${
                        checkedItems[item]
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}

            {/* Motivação */}
            {completedSteps === totalSteps && (
              <Card className="p-6 text-center shadow-glow border-primary/30 bg-gradient-primary/10 backdrop-blur-sm animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Parabéns! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Você completou sua rotina de skincare hoje. Sua pele agradece!
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Análise IA Tab */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            {!skinAnalysis ? (
              <Card className="p-6 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Scan className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Análise de Pele com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Descreva como está sua pele atualmente para receber recomendações personalizadas
                    </p>
                  </div>
                </div>

                <Textarea
                  placeholder="Ex: Minha pele está oleosa na zona T, com alguns poros dilatados..."
                  value={skinCondition}
                  onChange={(e) => setSkinCondition(e.target.value)}
                  className="min-h-[120px] mb-4"
                />

                <Button
                  onClick={handleAnalyzeSkin}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analisar Pele
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <>
                {/* Resultado da Análise */}
                <Card className="p-5 shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Análise Concluída</h3>
                        <p className="text-xs text-muted-foreground">Tipo de pele: {skinAnalysis.skinType}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSkinAnalysis(null);
                        setProductRecommendations(null);
                        setSkinCondition("");
                      }}
                    >
                      Nova análise
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {skinAnalysis.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Preocupações identificadas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {skinAnalysis.concerns.map((concern, idx) => (
                            <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium mb-2">Recomendações:</h4>
                      <ul className="space-y-2">
                        {skinAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Produtos Recomendados */}
                {isLoadingProducts ? (
                  <Card className="p-8 text-center shadow-soft">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Buscando produtos para você...</p>
                  </Card>
                ) : productRecommendations && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Produtos Recomendados</h3>
                    </div>

                    {productRecommendations.products.map((product, idx) => (
                      <Card key={idx} className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold">{product.name}</h4>
                              {product.price && (
                                <span className="text-sm font-medium text-primary">{product.price}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(product.buyUrl, '_blank')}
                          >
                            Ver produto
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {/* Tips */}
                    {productRecommendations.tips.length > 0 && (
                      <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent-foreground" />
                          Dicas Extras
                        </h4>
                        <ul className="space-y-2">
                          {productRecommendations.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-accent mt-0.5">✨</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowSkin;
