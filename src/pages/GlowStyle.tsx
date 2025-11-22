import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Plus, Camera, Sparkles, Trash2, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { useUserStore } from "@/lib/user-store";
import { getClosetItems, saveClosetItem } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { analyzeClothingItem } from "@/lib/ai-service";

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    "Camisas": "👕",
    "Calças": "👖",
    "Sapatos": "👞",
    "Vestidos": "👗",
    "Macacões": "🩱",
    "Casacos": "🧥",
    "Acessórios": "👜",
    "Blusas": "👚",
    "Shorts/Bermudas": "🩳",
    "Camisas Sociais": "👔"
  };
  return emojis[category] || "👕";
};

// Estrutura de dados para peças pré-definidas
const predefinedItems: Record<string, { subtypes: string[], colors: string[] }> = {
  "Camisas": {
    subtypes: ["Camiseta básica", "Polo", "Regata", "Babylook", "Oversized", "Cropped", "Manga longa", "Estampada"],
    colors: ["Branco", "Preto", "Cinza", "Azul", "Vermelho", "Rosa", "Verde", "Amarelo", "Bege", "Marrom"]
  },
  "Camisas Sociais": {
    subtypes: ["Slim fit", "Regular", "Manga curta", "Manga longa", "Linho", "Algodão", "Oxford", "Listrada"],
    colors: ["Branco", "Azul claro", "Azul marinho", "Rosa", "Cinza", "Preto", "Bege", "Xadrez"]
  },
  "Blusas": {
    subtypes: ["Básica", "Social", "Tomara que caia", "Ciganinha", "Gola alta", "Decote V", "Cropped", "Estampada"],
    colors: ["Branco", "Preto", "Rosa", "Vermelho", "Azul", "Verde", "Amarelo", "Nude", "Coral", "Lilás"]
  },
  "Calças": {
    subtypes: ["Jeans skinny", "Jeans reta", "Jeans flare", "Alfaiataria", "Legging", "Cargo", "Wide leg", "Social"],
    colors: ["Azul", "Preto", "Cinza", "Bege", "Branco", "Marrom", "Verde militar", "Cáqui"]
  },
  "Shorts/Bermudas": {
    subtypes: ["Jeans", "Sarja", "Alfaiataria", "Moletom", "Ciclista", "Esportiva", "Praia"],
    colors: ["Azul", "Preto", "Branco", "Bege", "Cinza", "Verde", "Vermelho", "Rosa"]
  },
  "Sapatos": {
    subtypes: ["Tênis casual", "Tênis esportivo", "Bota", "Coturno", "Social", "Sandália", "Chinelo", "Salto alto", "Salto baixo", "Rasteira"],
    colors: ["Branco", "Preto", "Marrom", "Bege", "Cinza", "Vermelho", "Rosa", "Azul", "Verde", "Amarelo"]
  },
  "Vestidos": {
    subtypes: ["Midi", "Longo", "Curto", "Tomara que caia", "Alça fina", "Manga", "Festa", "Casual", "Social"],
    colors: ["Preto", "Branco", "Vermelho", "Rosa", "Azul", "Verde", "Amarelo", "Floral", "Estampado", "Nude"]
  },
  "Macacões": {
    subtypes: ["Jeans", "Social", "Longo", "Curto", "Festa", "Casual", "Jardineira"],
    colors: ["Azul", "Preto", "Branco", "Bege", "Verde", "Vermelho", "Rosa", "Estampado"]
  },
  "Casacos": {
    subtypes: ["Jaqueta jeans", "Blazer", "Moletom", "Casaco de lã", "Corta-vento", "Couro", "Bomber", "Sobretudo"],
    colors: ["Preto", "Azul", "Cinza", "Bege", "Marrom", "Verde", "Branco", "Vinho", "Caramelo"]
  },
  "Acessórios": {
    subtypes: ["Bolsa", "Mochila", "Cinto", "Chapéu", "Boné", "Óculos", "Relógio", "Lenço", "Brinco", "Colar"],
    colors: ["Preto", "Marrom", "Bege", "Branco", "Prata", "Dourado", "Vermelho", "Azul", "Rosa", "Verde"]
  }
};

const GlowStyle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("style");
  const [pieces, setPieces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryToAdd, setCategoryToAdd] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAllPieces, setShowAllPieces] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const isMale = profile?.gender === "masculino";
  const categories = isMale 
    ? ["Camisas", "Camisas Sociais", "Calças", "Shorts/Bermudas", "Sapatos", "Macacões", "Casacos", "Acessórios"]
    : ["Camisas", "Camisas Sociais", "Blusas", "Calças", "Shorts/Bermudas", "Sapatos", "Vestidos", "Macacões", "Casacos", "Acessórios"];

  const ITEMS_PER_PAGE = 12;

  const handleDeletePiece = async (pieceId: string) => {
    try {
      const { error } = await supabase
        .from('closet_items')
        .delete()
        .eq('id', pieceId);

      if (error) throw error;

      setPieces(pieces.filter(p => p.id !== pieceId));
      
      toast({
        title: "Peça excluída! 👕",
        description: "A peça foi removida do seu closet",
      });
    } catch (error) {
      console.error("Erro ao deletar peça:", error);
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

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
    console.log("📋 Categoria selecionada:", categoryToAdd);
    
    const file = e.target.files?.[0];
    console.log("📁 Arquivo selecionado:", file?.name, file?.type);
    
    if (!file) {
      console.warn("⚠️ Nenhum arquivo selecionado");
      return;
    }

    if (!categoryToAdd) {
      console.error("❌ Nenhuma categoria selecionada!");
      toast({
        title: "Selecione uma categoria",
        description: "Clique em uma categoria antes de adicionar a peça",
        variant: "destructive",
      });
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

        // Analisar a peça com IA (usando a categoria escolhida)
        console.log("🤖 Analisando peça com IA...");
        const analysis = await analyzeClothingItem(imageData);
        console.log("📊 Resultado da análise:", analysis);
        
        // Forçar a categoria selecionada
        const finalCategory = categoryToAdd || analysis.category;
        console.log("✅ Categoria final a ser salva:", finalCategory);

        // Salvar no banco de dados
        console.log("💾 Salvando item no closet...");
        const newItem = await saveClosetItem({
          profile_id: profileData.id,
          image_url: imageData,
          category: finalCategory,
          color: analysis.color,
          description: analysis.description,
        });
        
        console.log("💾 Item sendo salvo:", {
          category: finalCategory,
          color: analysis.color,
          description: analysis.description
        });

        if (newItem) {
          console.log("✅ Item salvo com sucesso:", newItem.id);
          setPieces([...pieces, newItem]);
          setCategoryToAdd(null);
          toast({
            title: "Peça adicionada! ✨",
            description: `${categoryToAdd} adicionada ao closet.`,
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

  // Função para salvar peça pré-definida (sem foto)
  const handleSavePredefinedItem = async () => {
    if (!selectedSubtype || !selectedColor || !categoryToAdd) {
      toast({
        title: 'Seleção incompleta',
        description: 'Por favor, selecione o tipo e a cor da peça',
        variant: 'destructive',
      });
      return;
    }

    if (!profile?.email) {
      toast({
        title: 'Erro',
        description: 'Por favor, faça login novamente.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Buscar profile_id do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (profileError || !profileData) {
        throw new Error('Perfil não encontrado');
      }

      // Salvar no banco de dados sem image_url
      const newItem = await saveClosetItem({
        profile_id: profileData.id,
        image_url: null,
        category: categoryToAdd,
        color: selectedColor,
        description: `${selectedSubtype} ${selectedColor}`,
      });

      if (newItem) {
        setPieces([...pieces, newItem]);
        setShowSelectionModal(false);
        setCategoryToAdd(null);
        setSelectedSubtype('');
        setSelectedColor('');
        
        toast({
          title: 'Peça adicionada!',
          description: `${selectedSubtype} ${selectedColor} adicionada ao closet.`,
        });
      } else {
        throw new Error('Falha ao salvar item');
      }
    } catch (error) {
      console.error('Erro ao adicionar peça:', error);
      toast({
        title: 'Erro ao adicionar peça',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Glow Style</h1>
              <p className="text-sm text-muted-foreground">Seu closet digital</p>
            </div>

            {/* Stats */}
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{pieces.length} {pieces.length === 1 ? 'peça' : 'peças'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cor, categoria ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Look Perfeito CTA */}
        <Card className="p-6 shadow-glow border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium animate-glow-pulse">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Look Perfeito</h3>
                <p className="text-sm text-muted-foreground">
                  IA vai montar o look ideal para você
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium text-white" size="lg" onClick={() => navigate("/look-perfeito")}>
              Criar look perfeito ✨
            </Button>
          </div>
        </Card>

        {/* Categorias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold">Categorias</h3>
            {categoryToAdd && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCategoryToAdd(null)}
                className="text-xs"
              >
                Cancelar
              </Button>
            )}
          </div>
          
          {categoryToAdd ? (
            <Card className="p-6 text-center shadow-soft border-accent bg-accent/20 backdrop-blur-sm">
              <p className="text-sm font-medium mb-3">Como deseja adicionar?</p>
              <h3 className="text-xl font-bold mb-4">{categoryToAdd}</h3>
              <div className="flex flex-col gap-3">
                {/* Opção: Escolher peça pré-definida */}
                <Button
                  onClick={() => setShowSelectionModal(true)}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-opacity w-full"
                  size="lg"
                >
                  <Shirt className="w-4 h-4 mr-2" />
                  Selecionar peça pré-definida
                </Button>

                {/* Opção: Tirar foto */}
                <input
                  id="file-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="file-camera" className="cursor-pointer">
                  <div className="bg-gradient-accent hover:opacity-90 text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-3 shadow-medium transition-opacity w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Tirar foto
                  </div>
                </label>
                
                {/* Opção: Escolher da galeria */}
                <input
                  id="file-gallery"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="file-gallery" className="cursor-pointer">
                  <div className="border border-border hover:bg-accent/10 inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-3 transition-colors w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Escolher da galeria
                  </div>
                </label>
              </div>
            </Card>
          ) : (
            <>
              <p className="text-xs text-muted-foreground px-1">Clique para filtrar ou adicionar peças</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((name) => (
                  <Card
                    key={name}
                    onClick={() => {
                      if (selectedCategory === name) {
                        setSelectedCategory(null);
                      } else {
                        setSelectedCategory(name);
                      }
                    }}
                    className={`p-4 text-center shadow-soft backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer ${
                      selectedCategory === name 
                        ? 'border-accent bg-accent/20 scale-105' 
                        : 'border-accent/20 bg-card/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{getCategoryEmoji(name)}</div>
                    <p className="text-xs font-medium">{name}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToAdd(name);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Grid de Peças */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold">
              {selectedCategory ? `${selectedCategory}` : 'Suas peças'}
            </h3>
            {selectedCategory && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                Ver todas
              </Button>
            )}
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
              <p className="text-sm text-muted-foreground">
                Use os botões "Adicionar" nas categorias acima para começar!
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {pieces
                  .filter(piece => {
                    // Filtro por categoria
                    if (selectedCategory && piece.category !== selectedCategory) return false;
                    
                    // Filtro por busca
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      return (
                        piece.category?.toLowerCase().includes(term) ||
                        piece.color?.toLowerCase().includes(term) ||
                        piece.description?.toLowerCase().includes(term)
                      );
                    }
                    
                    return true;
                  })
                  .slice(0, showAllPieces ? undefined : ITEMS_PER_PAGE)
                  .map((piece) => (
                <Card
                  key={piece.id}
                  className="aspect-square p-0 overflow-hidden shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all group relative"
                >
                  {piece.image_url ? (
                    <>
                      <img
                        src={piece.image_url}
                        alt={piece.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePiece(piece.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex flex-col items-center justify-center p-3">
                      <Shirt className="w-8 h-8 text-accent-foreground mb-2" />
                      <p className="text-xs font-medium text-center">{piece.category}</p>
                      <p className="text-xs text-muted-foreground">{piece.color}</p>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 w-7 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePiece(piece.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
              </div>

              {/* Show More Button */}
              {!showAllPieces && pieces.filter(piece => !selectedCategory || piece.category === selectedCategory).length > ITEMS_PER_PAGE && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllPieces(true)}
                    className="w-full"
                  >
                    Ver todas as {pieces.filter(piece => !selectedCategory || piece.category === selectedCategory).length} peças
                  </Button>
                </div>
              )}

              {/* Show Less Button */}
              {showAllPieces && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAllPieces(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full"
                  >
                    Mostrar menos
                  </Button>
                </div>
              )}
            </>
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

      {/* Modal de Seleção de Peça Pré-definida */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Adicionar {categoryToAdd}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSelectionModal(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seleção de Subtipo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de peça</Label>
              <RadioGroup value={selectedSubtype} onValueChange={setSelectedSubtype}>
                <div className="grid grid-cols-2 gap-2">
                  {categoryToAdd && predefinedItems[categoryToAdd]?.subtypes.map((subtype) => (
                    <Label
                      key={subtype}
                      htmlFor={`subtype-${subtype}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSubtype === subtype
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={subtype} id={`subtype-${subtype}`} />
                      <span className="text-sm">{subtype}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Seleção de Cor */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cor</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="grid grid-cols-2 gap-2">
                  {categoryToAdd && predefinedItems[categoryToAdd]?.colors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={`color-${color}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedColor === color
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value={color} id={`color-${color}`} />
                      <span className="text-sm">{color}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSelectionModal(false);
                  setSelectedSubtype('');
                  setSelectedColor('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePredefinedItem}
                disabled={!selectedSubtype || !selectedColor}
                className="flex-1 bg-gradient-primary text-white"
              >
                Adicionar peça
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowStyle;
