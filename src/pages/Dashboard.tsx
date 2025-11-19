import { useState } from "react";
import { Sparkles, Heart, Scissors, Shirt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Olá, Bella! ✨</h1>
              <p className="text-sm text-muted-foreground">Como você está hoje?</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-primary shadow-soft" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              7
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dias de Glow</p>
          </Card>
          <Card className="p-4 text-center shadow-soft border-secondary/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              15
            </div>
            <p className="text-xs text-muted-foreground mt-1">Check-ins</p>
          </Card>
          <Card className="p-4 text-center shadow-soft border-accent/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">Peças</p>
          </Card>
        </div>

        {/* Look Perfeito - Destaque */}
        <Card className="p-6 shadow-glow border-primary/30 bg-gradient-primary/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium animate-glow-pulse">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Look Perfeito</h3>
                <p className="text-sm text-muted-foreground">
                  Veja o que combina com você hoje
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium">
              Descobrir meu look ✨
            </Button>
          </div>
        </Card>

        {/* Módulos Principais */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Seus Cuidados</h2>
          
          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Skin</h3>
                <p className="text-sm text-muted-foreground">
                  Routine de hoje: 2 de 3 ✓
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            </div>
          </Card>

          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-secondary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Scissors className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Hair</h3>
                <p className="text-sm text-muted-foreground">
                  Check-in de hoje pendente
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-accent/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Shirt className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Style</h3>
                <p className="text-sm text-muted-foreground">
                  12 peças no closet
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Motivação do dia */}
        <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-accent/5 backdrop-blur-sm">
          <p className="text-sm italic text-foreground/80">
            "Sua beleza natural merece ser celebrada todos os dias. Você é única! 💖"
          </p>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
