import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Plus, Camera, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const GlowStyle = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("style");
  const [pieces, setPieces] = useState([
    { id: 1, image: null, category: "Blusa", color: "Rosa" },
    { id: 2, image: null, category: "Calça", color: "Azul" },
    { id: 3, image: null, category: "Vestido", color: "Branco" },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPieces([
          ...pieces,
          {
            id: pieces.length + 1,
            image: reader.result as string,
            category: "Nova peça",
            color: "Cor",
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
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
            
            <label className="cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center shadow-soft hover:shadow-medium transition-all">
                <Plus className="w-5 h-5 text-accent-foreground" />
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{pieces.length} peças</span>
            </div>
            <div>
              <span className="text-muted-foreground">Looks: </span>
              <span className="font-semibold">8 combinações</span>
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
            <Button variant="ghost" size="sm">
              Filtrar
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {pieces.map((piece) => (
              <Card
                key={piece.id}
                className="aspect-square p-0 overflow-hidden shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer group"
              >
                {piece.image ? (
                  <img
                    src={piece.image}
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
            <label className="aspect-square rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 cursor-pointer flex flex-col items-center justify-center transition-colors group">
              <Camera className="w-8 h-8 text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Dica */}
        <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">Dica de hoje</h4>
              <p className="text-sm text-muted-foreground">
                Peças em tons quentes valorizam seu tom de pele Primavera! 🌸
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowStyle;
