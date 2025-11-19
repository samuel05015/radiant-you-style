import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen gradient-glow flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary shadow-glow mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bem-vinda ao Glow UP
          </h1>
          <p className="text-muted-foreground">
            Vamos criar seu perfil de beleza personalizado
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-12 bg-gradient-primary"
                  : i < step
                  ? "w-8 bg-primary/50"
                  : "w-8 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <Card className="p-8 shadow-medium backdrop-blur-sm bg-card/80 border-primary/20">
          {step === 1 && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-semibold">Vamos começar!</h2>
              <p className="text-muted-foreground">
                O Glow UP vai te ajudar a descobrir o que mais valoriza sua beleza natural
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">✨ Análise de tom de pele</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm">💇‍♀️ Sugestões personalizadas</p>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm">👗 Looks que favorecem você</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Tire uma selfie</h2>
                <p className="text-muted-foreground">
                  Nossa IA vai analisar seu tom de pele e formato do rosto
                </p>
              </div>

              <div className="space-y-4">
                {selectedImage ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-medium">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                    <Camera className="w-16 h-16 text-primary mb-4" />
                    <span className="text-sm text-muted-foreground">Toque para tirar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Tudo pronto!</h2>
                <p className="text-muted-foreground">
                  Agora vamos personalizar sua experiência no Glow UP
                </p>
              </div>
              <div className="space-y-3 text-left">
                <div className="p-4 rounded-lg bg-gradient-primary/10">
                  <p className="font-medium">Tom de pele: Primavera</p>
                  <p className="text-sm text-muted-foreground">Cores quentes ficam perfeitas em você</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-accent/10">
                  <p className="font-medium">Formato: Oval</p>
                  <p className="text-sm text-muted-foreground">Versátil para diversos estilos</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
            size="lg"
            disabled={step === 2 && !selectedImage}
          >
            {step === 3 ? "Começar!" : "Continuar"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
