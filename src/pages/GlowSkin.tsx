import { useState } from "react";
import { Heart, CheckCircle2, Circle, Droplets, Shield, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import BottomNav from "@/components/BottomNav";

const GlowSkin = () => {
  const [activeTab, setActiveTab] = useState("skin");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const routineSteps = [
    {
      category: "Limpeza",
      icon: Droplets,
      color: "primary",
      items: [
        "Lavar o rosto com sabonete suave",
        "Remover maquiagem completamente",
      ],
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

  const handleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
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
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowSkin;
