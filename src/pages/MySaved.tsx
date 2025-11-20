import { useState, useEffect } from "react";
import { Trash2, Sparkles, Scissors, ChevronLeft, Star, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getHaircutRecommendations, toggleOutfitFavorite, recordOutfitUsage } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const MySaved = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("saved");
  const [currentTab, setCurrentTab] = useState("looks");
  
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [savedHaircuts, setSavedHaircuts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const findClosetItemImage = (description: string): string | null => {
    if (!description || typeof description !== 'string' || !closetItems.length) return null;
    
    // Tentar encontrar a peça exata pelo nome
    const item = closetItems.find(item => {
      if (!item.description || typeof item.description !== 'string') return false;
      const desc = description.toLowerCase();
      const itemDesc = item.description.toLowerCase();
      return desc.includes(itemDesc) || itemDesc.includes(desc);
    });
    
    return item?.image_url || null;
  };

  const loadSavedItems = async () => {
    if (!profile?.email) return;
    
    setIsLoading(true);
    try {
      // Buscar o profile_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (profileError) throw profileError;

      // Carregar looks salvos usando o profile_id (UUID)
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false });

      if (outfitsError) throw outfitsError;
      
      // Adicionar campo is_favorite se não existir
      const outfitsWithFavorites = (outfits || []).map(outfit => ({
        ...outfit,
        is_favorite: outfit.is_favorite ?? false
      }));
      
      setSavedOutfits(outfitsWithFavorites);

      // Carregar cortes salvos usando email
      const haircuts = await getHaircutRecommendations(profile.email);
      setSavedHaircuts(haircuts || []);

      // Carregar peças do closet para buscar imagens
      const { data: items, error: itemsError } = await supabase
        .from('closet_items')
        .select('*')
        .eq('profile_id', profileData.id);

      if (!itemsError && items) {
        setClosetItems(items);
      }
      
    } catch (error) {
      console.error("Erro ao carregar salvos:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus itens salvos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (outfitId: string, currentState: boolean) => {
    try {
      await toggleOutfitFavorite(outfitId, !currentState);
      
      setSavedOutfits(savedOutfits.map(outfit => 
        outfit.id === outfitId 
          ? { ...outfit, is_favorite: !currentState }
          : outfit
      ));

      toast({
        title: !currentState ? "Adicionado aos favoritos ⭐" : "Removido dos favoritos",
        description: !currentState ? "Look marcado como favorito" : "Look desmarcado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favorito",
        variant: "destructive",
      });
    }
  };

  const handleShareOutfit = async (outfit: any) => {
    const shareText = `✨ Meu Look Perfeito ✨\n\n📅 Ocasião: ${outfit.occasion}\n👕 Top: ${outfit.top}\n👖 Bottom: ${outfit.bottom}\n👟 Calçado: ${outfit.shoes}\n\nCriado com Radiant You 💖`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Look: ${outfit.occasion}`,
          text: shareText,
        });
        toast({ title: "Compartilhado com sucesso! ✨" });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado! 📋",
          description: "Link copiado para a área de transferência",
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const handleUseOutfit = async (outfitId: string, profileId: string) => {
    try {
      await recordOutfitUsage(outfitId, profileId);
      toast({
        title: "Look registrado! 👗",
        description: "Uso do look foi contabilizado nas estatísticas",
      });
    } catch (error) {
      console.error("Erro ao registrar uso:", error);
    }
  };

  const handleDeleteOutfit = async (id: string) => {
    console.log('Tentando deletar outfit com id:', id);
    try {
      const { data, error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', id)
        .select();

      console.log('Resultado do delete outfit:', { data, error });

      if (error) {
        console.error('Erro Supabase ao deletar outfit:', error);
        throw error;
      }

      setSavedOutfits(savedOutfits.filter(outfit => outfit.id !== id));
      
      toast({
        title: "Look excluído! 👕",
        description: "O look foi removido dos seus salvos",
      });
    } catch (error) {
      console.error("Erro ao deletar look:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHaircut = async (id: string) => {
    console.log('Tentando deletar haircut com id:', id);
    try {
      const { data, error } = await supabase
        .from('haircut_recommendations')
        .delete()
        .eq('id', id)
        .select();

      console.log('Resultado do delete haircut:', { data, error });

      if (error) {
        console.error('Erro Supabase ao deletar haircut:', error);
        throw error;
      }

      setSavedHaircuts(savedHaircuts.filter(haircut => haircut.id !== id));
      
      toast({
        title: "Corte excluído! ✂️",
        description: "O corte foi removido dos seus salvos",
      });
    } catch (error) {
      console.error("Erro ao deletar corte:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Meus Salvos</h1>
              <p className="text-sm text-muted-foreground">Looks e cortes salvos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6">
        <Tabs defaultValue="looks" className="w-full" onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="looks">Looks ({savedOutfits.length})</TabsTrigger>
            <TabsTrigger value="haircuts">Cortes ({savedHaircuts.length})</TabsTrigger>
          </TabsList>

          {/* Tab: Looks Salvos */}
          <TabsContent value="looks" className="space-y-4">
            {!isLoading && savedOutfits.length > 0 && (
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={!showOnlyFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyFavorites(false)}
                >
                  Todos
                </Button>
                <Button 
                  variant={showOnlyFavorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyFavorites(true)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Favoritos
                </Button>
              </div>
            )}
            
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </Card>
            ) : savedOutfits.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum look salvo ainda</p>
                <Button onClick={() => navigate('/look-perfeito')}>
                  Criar look
                </Button>
              </Card>
            ) : (
              savedOutfits
                .filter(outfit => !showOnlyFavorites || outfit.is_favorite)
                .map((outfit) => (
                <Card key={outfit.id} className="overflow-hidden">
                  <div className="flex items-start justify-between p-5 pb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{outfit.occasion}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(outfit.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(outfit.id, outfit.is_favorite)}
                      >
                        <Star 
                          className={`w-5 h-5 ${outfit.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareOutfit(outfit)}
                        className="text-primary hover:text-primary"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Peças do Look */}
                  <div className="px-5 pb-4 space-y-3">
                    {/* Top */}
                    {(() => {
                      const imageUrl = findClosetItemImage(outfit.top);
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={outfit.top}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                              👕
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{outfit.top}</p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Bottom */}
                    {(() => {
                      const imageUrl = findClosetItemImage(outfit.bottom);
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={outfit.bottom}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl flex-shrink-0">
                              👖
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{outfit.bottom}</p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Shoes */}
                    {(() => {
                      const imageUrl = findClosetItemImage(outfit.shoes);
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={outfit.shoes}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                              👟
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{outfit.shoes}</p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Accessories */}
                    {outfit.accessories && (() => {
                      const imageUrl = findClosetItemImage(outfit.accessories);
                      return (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={outfit.accessories}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                              ✨
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{outfit.accessories}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {outfit.reasoning && (
                    <div className="px-5 pb-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">💡 Por que funciona:</p>
                      <p className="text-sm text-muted-foreground">{outfit.reasoning}</p>
                    </div>
                  )}

                  {/* Botão "Usei este look" */}
                  <div className="px-5 pb-5">
                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-white"
                      onClick={async () => {
                        const { data: profileData } = await supabase
                          .from('profiles')
                          .select('id')
                          .eq('email', profile?.email)
                          .single();
                        
                        if (profileData) {
                          await handleUseOutfit(outfit.id, profileData.id);
                        }
                      }}
                    >
                      ✅ Usei este look hoje
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Tab: Cortes Salvos */}
          <TabsContent value="haircuts" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </Card>
            ) : savedHaircuts.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <Scissors className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum corte salvo ainda</p>
                <Button onClick={() => navigate('/glow-hair')}>
                  Ver recomendações
                </Button>
              </Card>
            ) : (
              savedHaircuts.map((haircut) => (
                <Card key={haircut.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img 
                      src={haircut.image_url} 
                      alt={haircut.cut_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold">{haircut.cut_name}</h3>
                      <p className="text-xs opacity-90">Rosto: {haircut.face_shape}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(haircut.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHaircut(haircut.id)}
                        className="text-destructive hover:text-destructive h-8"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">Descrição</h4>
                      <p className="text-sm text-muted-foreground">{haircut.description}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-sm mb-1 text-primary">Por que funciona</h4>
                      <p className="text-sm">{haircut.why_it_works}</p>
                    </div>

                    {haircut.styling_tips && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Dicas de finalização</h4>
                        <div className="space-y-1">
                          {haircut.styling_tips.split('\n').map((tip: string, index: number) => (
                            <p key={index} className="text-sm">• {tip}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav activeTab="saved" onTabChange={(tab) => navigate(`/${tab}`)} />
    </div>
  );
};

export default MySaved;
