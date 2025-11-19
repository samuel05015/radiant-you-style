import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Plus, Camera, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useUserStore } from "@/lib/user-store";
import { getClosetItems, saveClosetItem } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { analyzeClothingItem } from "@/lib/ai-service";

const GlowStyle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("style");
  const [pieces, setPieces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar peças do banco de dados
  useEffect(() => {
    const loadPieces = async () => {
      if (!profile?.email) return;
      
      setIsLoading(true);
      try {
        const items = await getClosetItems(profile.email);
        setPieces(items || []);
      } catch (error) {
        console.error("Erro ao carregar peças:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPieces();
  }, [profile?.email]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📸 handleImageUpload chamado");
    
    const file = e.target.files?.[0];
    console.log("📁 Arquivo selecionado:", file?.name, file?.type);
    
    if (!file) {
      console.warn("⚠️ Nenhum arquivo selecionado");
      return;
    }
    
    if (!profile?.email) {
      console.warn("⚠️ Email do perfil não encontrado");
      toast({
        title: "Erro",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processando imagem...",
      description: "Aguarde um momento",
    });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;
      console.log("🖼️ Imagem carregada, tamanho:", imageData.length);
      
      try {
        // Buscar profile_id do usuário
        console.log("🔍 Buscando profile_id para email:", profile.email);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', profile.email)
          .single();

        if (profileError || !profileData) {
          console.error("❌ Erro ao buscar perfil:", profileError);
          throw new Error('Perfil não encontrado');
        }

        console.log("✅ Profile_id encontrado:", profileData.id);

        // Analisar a peça com IA
        console.log("🤖 Analisando peça com IA...");
        const analysis = await analyzeClothingItem(imageData);
        console.log("📊 Resultado da análise:", analysis);

        // Salvar no banco de dados
        console.log("💾 Salvando item no closet...");
        const newItem = await saveClosetItem({
          profile_id: profileData.id,
          image_url: imageData,
          category: analysis.category,
          color: analysis.color,
          description: analysis.description,
        });

        if (newItem) {
          console.log("✅ Item salvo com sucesso:", newItem.id);
          setPieces([...pieces, newItem]);
          toast({
            title: "Peça adicionada! ✨",
            description: "Sua nova peça foi adicionada ao closet.",
          });
        } else {
          throw new Error("Falha ao salvar item");
        }
      } catch (error) {
        console.error("❌ Erro ao adicionar peça:", error);
        toast({
          title: "Erro ao adicionar peça",
          description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      console.error("❌ Erro ao ler arquivo");
      toast({
        title: "Erro ao ler imagem",
        description: "Tente selecionar outra imagem.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center shadow-soft">
                <Shirt className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Glow Style</h1>
                <p className="text-sm text-muted-foreground">Seu closet digital</p>
              </div>
            </div>
            
            <label className="cursor-pointer" onClick={() => console.log("📘 Label clicado (header)")}>              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-soft hover:shadow-medium transition-all">
                <Plus className="w-5 h-5 text-accent-foreground" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                onClick={(e) => console.log("📁 Input file clicado (header)", e)}
              />
            </label>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{pieces.length} {pieces.length === 1 ? 'peça' : 'peças'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Look Perfeito CTA */}
        <Card className="p-6 shadow-glow border-accent/30 bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-accent opacity-20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center shadow-medium animate-glow-pulse">
                <Sparkles className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Look Perfeito</h3>
                <p className="text-sm text-muted-foreground">
                  IA vai montar o look ideal para você
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-accent hover:opacity-90 transition-opacity shadow-medium" size="lg" onClick={() => navigate("/look-perfeito")}>
              Criar look perfeito ✨
            </Button>
          </div>
        </Card>

        {/* Categorias */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold px-1">Categorias</h3>
          <div className="grid grid-cols-3 gap-3">
            {["Blusas", "Calças", "Vestidos", "Saias", "Casacos", "Acessórios"].map(
              (category) => (
                <Card
                  key={category}
                  className="p-4 text-center shadow-soft border-accent/20 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <p className="text-xs font-medium">{category}</p>
                </Card>
              )
            )}
          </div>
        </div>

        {/* Grid de Peças */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold">Suas peças</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Carregando seu closet...</p>
            </div>
          ) : pieces.length === 0 ? (
            <Card className="p-8 text-center shadow-soft border-accent/20 bg-card/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Shirt className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Seu closet está vazio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando fotos das suas roupas para criar looks incríveis!
              </p>
              <label className="inline-block" onClick={() => console.log("📘 Label clicado (empty state)")}>
                <Button className="bg-gradient-accent hover:opacity-90">
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar primeira peça
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  onClick={(e) => console.log("📁 Input file clicado (empty)", e)}
                />
              </label>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {pieces.map((piece) => (
                <Card
                  key={piece.id}
                  className="aspect-square p-0 overflow-hidden shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer group"
                >
                  {piece.image_url ? (
                    <img
                      src={piece.image_url}
                      alt={piece.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center p-3">
                      <Shirt className="w-8 h-8 text-accent-foreground mb-2" />
                      <p className="text-xs font-medium text-center">{piece.category}</p>
                      <p className="text-xs text-muted-foreground">{piece.color}</p>
                    </div>
                  )}
                </Card>
              ))}

              {/* Add new piece card */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 cursor-pointer flex flex-col items-center justify-center transition-colors group" onClick={() => console.log("📘 Label clicado (grid)")}>
                <Camera className="w-8 h-8 text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  onClick={(e) => console.log("📁 Input file clicado (grid)", e)}
                />
              </label>
            </div>
          )}
        </div>

        {profile?.skinTone && (
          <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold">Dica de hoje</h4>
                <p className="text-sm text-muted-foreground">
                  {profile.skinTone === "primavera" || profile.skinTone === "outono"
                    ? "Peças em tons quentes valorizam seu tom de pele! 🌸"
                    : "Peças em tons frios realçam sua beleza natural! ❄️"}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowStyle;
