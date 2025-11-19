import { useState } from "react";
import { Scissors, Sparkles, Wind, Droplets, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";

const GlowHair = () => {
  const [activeTab, setActiveTab] = useState("hair");
  const [hairCondition, setHairCondition] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);

  const conditions = [
    { id: "frizzy", label: "Com frizz", icon: Wind },
    { id: "oily", label: "Oleoso", icon: Droplets },
    { id: "dry", label: "Ressecado", icon: Sun },
    { id: "perfect", label: "Perfeito!", icon: Sparkles },
  ];

  const handleSubmit = () => {
    setShowRecommendation(true);
  };

  const getRecommendation = () => {
    switch (hairCondition) {
      case "frizzy":
        return {
          title: "Combata o frizz!",
          tips: [
            "Deixe o cabelo solto hoje",
            "Use leave-in anti-frizz",
            "Evite secador no calor máximo",
          ],
          style: "Para seu rosto oval, um corte em camadas longas valoriza muito!",
        };
      case "oily":
        return {
          title: "Controle a oleosidade",
          tips: [
            "Prenda em um coque baixo",
            "Use shampoo a seco",
            "Lave apenas as raízes",
          ],
          style: "Penteados presos como rabo de cavalo alto ficam perfeitos em você!",
        };
      case "dry":
        return {
          title: "Hidratação urgente!",
          tips: [
            "Aplique máscara hidratante",
            "Evite lavar hoje se possível",
            "Use óleo nas pontas",
          ],
          style: "Tranças soltas protegem e valorizam seu formato de rosto!",
        };
      default:
        return {
          title: "Arrase!",
          tips: [
            "Seu cabelo está incrível",
            "Experimente algo novo hoje",
            "Solte a criatividade!",
          ],
          style: "Com o cabelo assim, qualquer penteado vai ficar lindo!",
        };
    }
  };

  const recommendation = getRecommendation();

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
        {/* Check-in */}
        {!showRecommendation ? (
          <Card className="p-6 shadow-medium border-secondary/20 bg-card/50 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Como está seu cabelo hoje?</h2>
                <p className="text-sm text-muted-foreground">
                  Vamos personalizar suas dicas
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
                disabled={!hairCondition}
                className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity shadow-medium"
                size="lg"
              >
                Ver recomendações
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Recomendações */}
            <Card className="p-6 shadow-glow border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center shadow-medium">
                    <Sparkles className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{recommendation.title}</h3>
                </div>

                <div className="space-y-3">
                  {recommendation.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-secondary-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Sugestão de estilo baseada no rosto */}
            <Card className="p-5 shadow-soft border-accent/20 bg-accent/5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">Dica de estilo</h4>
                  <p className="text-sm text-muted-foreground">{recommendation.style}</p>
                </div>
              </div>
            </Card>

            <Button
              onClick={() => setShowRecommendation(false)}
              variant="outline"
              className="w-full"
            >
              Fazer novo check-in
            </Button>
          </>
        )}

        {/* Produtos Recomendados */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold px-1">Produtos para você</h3>
          
          <Card className="p-4 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-medium transition-all cursor-pointer">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Leave-in Nutritivo</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Perfeito para seu tipo de cabelo
                </p>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Ver opções →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default GlowHair;
