import { useState } from "react";
import { Sparkles, Heart, Shirt, Palette, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { generateOutfit, OutfitRecommendation } from "@/lib/ai-service";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { saveOutfit } from "@/lib/database";

const LookPerfeito = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateStats = useUserStore((state) => state.updateStats);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);

  const handleGenerate = async () => {
    if (!profile?.email) return;
    
    setIsGenerating(true);
    
    try {
      const skinTone = profile?.skinTone || "primavera";
      const faceShape = profile?.faceShape || "oval";
      
      const result = await generateOutfit(skinTone, faceShape, "casual");
      setOutfit(result);
      setGenerated(true);
      
      // Salvar outfit no Supabase
      try {
        await saveOutfit({
          user_email: profile.email,
          occasion: result.occasion,
          top: result.top,
          bottom: result.bottom,
          shoes: result.shoes,
          accessories: result.accessories,
          colors: result.colors.join(', '),
          style_notes: result.styleNotes,
        });
      } catch (dbError) {
        console.error("Erro ao salvar outfit:", dbError);
        // Continua mesmo se falhar salvar no banco
      }
      
      // Atualizar estatísticas
      updateStats({ looksCreated: (profile.stats.looksCreated || 0) + 1 });
      
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
                  Nossa IA vai cruzar seu tom de pele, formato do rosto, humor e peças do
                  closet para criar o look ideal
                </p>
              </div>
            </Card>

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

              <Card className="p-4 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Closet digital</p>
                    <p className="text-sm text-muted-foreground">12 peças disponíveis</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                  Criando seu look...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Gerar Look Perfeito
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
                    Combinação perfeita para você brilhar!
                  </p>
                </div>

                {/* Peças sugeridas */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-card/50 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt className="w-5 h-5 text-primary" />
                        <p className="font-medium text-sm">Top</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{outfit?.outfit.top}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card/50 border border-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt className="w-5 h-5 text-secondary-foreground" />
                        <p className="font-medium text-sm">Bottom</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{outfit?.outfit.bottom}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card/50 border border-accent/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shirt className="w-5 h-5 text-accent-foreground" />
                        <p className="font-medium text-sm">Calçado</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{outfit?.outfit.shoes}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card/50 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <p className="font-medium text-sm">Acessórios</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {outfit?.outfit.accessories.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do look */}
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-card/50 border border-primary/20">
                    <p className="font-medium mb-1">💄 Make sugerida</p>
                    <p className="text-sm text-muted-foreground">
                      {outfit?.makeup}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-card/50 border border-secondary/20">
                    <p className="font-medium mb-1">💇‍♀️ Cabelo</p>
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
                    "Você é única e seu estilo também! Arrase com confiança hoje 💖"
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
