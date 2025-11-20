import { useState, useEffect } from "react";
import { Sparkles, Heart, Shirt, Palette, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { generateOutfit, OutfitRecommendation } from "@/lib/ai-service";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { saveOutfit, getClosetItems } from "@/lib/database";
import { supabase } from "@/lib/supabase";

const LookPerfeito = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateStats = useUserStore((state) => state.updateStats);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [closetItemsCount, setClosetItemsCount] = useState(0);
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<"casual" | "formal" | "festa">("casual");

  // Verificar e atualizar gender do perfil
  useEffect(() => {
    const checkGender = async () => {
      if (!profile?.email || profile?.gender) return; // Já tem gender
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('gender')
          .eq('email', profile.email)
          .single();
        
        if (data?.gender) {
          console.log("🔄 Atualizando gender no perfil:", data.gender);
          useUserStore.getState().setProfile({ ...profile, gender: data.gender });
        }
      } catch (error) {
        console.error("Erro ao buscar gender:", error);
      }
    };
    checkGender();
  }, [profile?.email]);

  // Carregar peças do closet
  useEffect(() => {
    const loadClosetItems = async () => {
      if (!profile?.email) return;
      try {
        const items = await getClosetItems(profile.email);
        setClosetItems(items);
        setClosetItemsCount(items.length);
        console.log("👔 Peças do closet carregadas:", items);
      } catch (error) {
        console.error("Erro ao carregar closet:", error);
      }
    };
    loadClosetItems();
  }, [profile?.email]);

  const handleGenerate = async () => {
    if (!profile?.email) return;
    
    // Verificar se tem peças no closet
    if (closetItems.length === 0) {
      toast({
        title: "Closet vazio",
        description: "Adicione peças ao seu closet em Glow Style antes de criar looks!",
        variant: "destructive",
      });
      navigate("/style");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const skinTone = profile?.skinTone || "primavera";
      const faceShape = profile?.faceShape || "oval";
      const gender = profile?.gender || "feminino";
      
      // Buscar últimos 5 looks salvos para evitar repetição
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      let recentOutfits: string[] = [];
      if (profileData) {
        const { data: outfits } = await supabase
          .from('outfits')
          .select('top, bottom, shoes')
          .eq('profile_id', profileData.id)
          .eq('occasion', selectedOccasion)
          .order('created_at', { ascending: false })
          .limit(5);

        if (outfits) {
          recentOutfits = outfits.map(o => `${o.top}|${o.bottom}|${o.shoes}`);
        }
      }
      
      console.log("═══════════════════════════════════");
      console.log("🎨 GERANDO OUTFIT");
      console.log("═══════════════════════════════════");
      console.log("📊 Dados do perfil:");
      console.log("  - skinTone:", skinTone);
      console.log("  - faceShape:", faceShape);
      console.log("  - gender:", gender);
      console.log("  - occasion:", selectedOccasion);
      console.log("");
      console.log("👔 Peças do closet (" + closetItems.length + "):");
      closetItems.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.category} - ${item.color}`);
      });
      console.log("");
      console.log("🚫 Looks recentes a evitar:", recentOutfits.length);
      console.log("═══════════════════════════════════");
      
      // Passar as peças do closet e looks recentes para a IA
      const result = await generateOutfit(skinTone, faceShape, gender, selectedOccasion, undefined, closetItems, recentOutfits);
      
      console.log("═══════════════════════════════════");
      console.log("✅ RESULTADO DA IA:");
      console.log("═══════════════════════════════════");
      console.log("Top:", result.outfit.top);
      console.log("Bottom:", result.outfit.bottom);
      console.log("Shoes:", result.outfit.shoes);
      console.log("Reasoning:", result.reasoning);
      console.log("═══════════════════════════════════");
      
      setOutfit(result);
      setGenerated(true);
      
      // Salvar outfit no Supabase
      try {
        // Buscar profile_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', profile.email)
          .single();

        if (profileData) {
          await saveOutfit({
            profile_id: profileData.id,
            occasion: result.occasion,
            top: result.outfit.top,
            bottom: result.outfit.bottom,
            shoes: result.outfit.shoes,
            accessories: result.outfit.accessories,
            makeup: result.makeup,
            hair: result.hair,
            reasoning: result.reasoning,
          });
          console.log("💾 Outfit salvo no banco de dados");
        }
      } catch (dbError) {
        console.error("Erro ao salvar outfit:", dbError);
        // Continua mesmo se falhar salvar no banco
      }
      
      // Atualizar estatísticas
      updateStats({ 
        looksCreated: (profile.stats.looksCreated || 0) + 1,
        checkIns: (profile.stats.checkIns || 0) + 1
      });
      
      toast({
        title: "Look criado com sucesso! ✨",
        description: "Seu look personalizado está pronto!",
      });
      
    } catch (error) {
      console.error("Erro ao gerar look:", error);
      toast({
        title: "Erro ao gerar look",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-glow">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Look Perfeito</h1>
                <p className="text-sm text-muted-foreground">Feito especialmente para você</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {!generated ? (
          <>
            {/* Intro */}
            <Card className="p-6 shadow-medium border-primary/20 bg-card/50 backdrop-blur-sm text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Crie seu look perfeito!</h2>
                <p className="text-muted-foreground">
                  {closetItemsCount > 0 
                    ? `Nossa IA vai combinar suas ${closetItemsCount} ${closetItemsCount === 1 ? 'peça' : 'peças'} do closet com base no seu tom de pele e formato de rosto`
                    : "Adicione peças ao seu closet em Glow Style para criar looks personalizados!"
                  }
                </p>
              </div>
            </Card>

            {/* Seletor de Ocasião */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-1">Para qual ocasião?</h3>
              <div className="grid grid-cols-3 gap-3">
                <Card 
                  className={`p-4 text-center cursor-pointer transition-all ${
                    selectedOccasion === "casual" 
                      ? "border-primary bg-primary/10 shadow-medium" 
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOccasion("casual")}
                >
                  <div className="text-3xl mb-2">👕</div>
                  <p className="text-sm font-medium">Casual</p>
                  <p className="text-xs text-muted-foreground">Dia a dia</p>
                </Card>

                <Card 
                  className={`p-4 text-center cursor-pointer transition-all ${
                    selectedOccasion === "formal" 
                      ? "border-primary bg-primary/10 shadow-medium" 
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOccasion("formal")}
                >
                  <div className="text-3xl mb-2">👔</div>
                  <p className="text-sm font-medium">Formal</p>
                  <p className="text-xs text-muted-foreground">Trabalho</p>
                </Card>

                <Card 
                  className={`p-4 text-center cursor-pointer transition-all ${
                    selectedOccasion === "festa" 
                      ? "border-primary bg-primary/10 shadow-medium" 
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedOccasion("festa")}
                >
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm font-medium">Festa</p>
                  <p className="text-xs text-muted-foreground">Eventos</p>
                </Card>
              </div>
            </div>

            {/* O que será analisado */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-1">O que será analisado:</h3>

              <Card className="p-4 shadow-soft border-primary/20 bg-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Tom de pele</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.skinTone || "Primavera"} - cores {
                        profile?.skinTone === "primavera" || profile?.skinTone === "outono"
                          ? "quentes"
                          : "frias"
                      }
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 shadow-soft border-secondary/20 bg-secondary/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Formato do rosto</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.faceShape || "Oval"} - versátil
                    </p>
                  </div>
                </div>
              </Card>

              <Card className={`p-4 shadow-soft border-accent/20 ${closetItemsCount === 0 ? 'bg-red-500/10' : 'bg-accent/5'} backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Suas peças do closet</p>
                    <p className="text-sm text-muted-foreground">
                      {closetItemsCount === 0 
                        ? "⚠️ Adicione peças primeiro!" 
                        : `✅ ${closetItemsCount} ${closetItemsCount === 1 ? 'peça' : 'peças'} cadastrada${closetItemsCount === 1 ? '' : 's'}`
                      }
                    </p>
                  </div>
                </div>
                {closetItemsCount === 0 && (
                  <Button
                    onClick={() => navigate("/style")}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    Ir para Glow Style →
                  </Button>
                )}
              </Card>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || closetItemsCount === 0}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                  IA montando seu look...
                </>
              ) : closetItemsCount === 0 ? (
                <>
                  <Shirt className="mr-2 w-5 h-5" />
                  Adicione peças primeiro
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Montar look com minhas {closetItemsCount} {closetItemsCount === 1 ? 'peça' : 'peças'}
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Look Gerado */}
            <Card className="p-6 shadow-glow border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-glow-pulse" />
              
              <div className="relative space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Seu look de hoje ✨</h2>
                  <p className="text-sm text-muted-foreground">
                    {closetItemsCount > 0 
                      ? `Montado com suas ${closetItemsCount} ${closetItemsCount === 1 ? 'peça' : 'peças'} do closet`
                      : "Combinação perfeita para você brilhar!"
                    }
                  </p>
                </div>

                {/* Peças sugeridas */}
                <div className="space-y-3">
                  {/* Top ou Vestido */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-primary/20">
                    <div className="text-3xl">
                      {outfit?.outfit.top?.toLowerCase().includes('vestido') ? '👗' : '👕'}
                    </div>
                    <p className="text-sm flex-1">{outfit?.outfit.top}</p>
                  </div>
                  
                  {/* Bottom (só mostra se não for "não usar") */}
                  {outfit?.outfit.bottom && !outfit.outfit.bottom.toLowerCase().includes('não usar') && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-secondary/20">
                      <div className="text-3xl">👖</div>
                      <p className="text-sm flex-1">{outfit?.outfit.bottom}</p>
                    </div>
                  )}
                  
                  {/* Sapatos */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-accent/20">
                    <div className="text-3xl">👞</div>
                    <p className="text-sm flex-1">{outfit?.outfit.shoes}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-primary/20">
                    <div className="text-3xl">✨</div>
                    <p className="text-sm flex-1">
                      {Array.isArray(outfit?.outfit.accessories) 
                        ? outfit.outfit.accessories.join(", ")
                        : outfit?.outfit.accessories || "Nenhum acessório"}
                    </p>
                  </div>
                </div>

                {/* Detalhes do look */}
                <div className="space-y-3">
                  {profile?.gender !== "masculino" && outfit?.makeup && outfit.makeup !== "Não aplicável" && (
                    <div className="p-4 rounded-lg bg-card/50 border border-primary/20">
                      <p className="font-medium mb-1">💄 Make sugerida</p>
                      <p className="text-sm text-muted-foreground">
                        {outfit.makeup}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-card/50 border border-secondary/20">
                    <p className="font-medium mb-1">{profile?.gender === "masculino" ? "💇‍♂️ Cabelo" : "💇‍♀️ Cabelo"}</p>
                    <p className="text-sm text-muted-foreground">
                      {outfit?.hair}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-card/50 border border-accent/20">
                    <p className="font-medium mb-1">✨ Por que funciona?</p>
                    <p className="text-sm text-muted-foreground">
                      {outfit?.reasoning}
                    </p>
                  </div>
                </div>

                {/* Motivação */}
                <Card className="p-4 text-center bg-gradient-accent/10 border-accent/30">
                  <p className="text-sm italic">
                    {profile?.gender === "masculino" 
                      ? "Você é único e seu estilo também! Vista-se com confiança hoje 💪"
                      : "Você é única e seu estilo também! Arrase com confiança hoje 💖"
                    }
                  </p>
                </Card>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 w-4 h-4" />
                Gerar novo
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                Voltar ao início
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LookPerfeito;
