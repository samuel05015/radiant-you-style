import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeFaceImage } from "@/lib/ai-service";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    faceShape: string;
    skinTone: string;
    confidence: number;
    analysis: string;
  } | null>(null);

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

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeFaceImage(selectedImage);
      setAnalysisResult(result);
      
      toast({
        title: "Análise concluída! ✨",
        description: `Detectamos rosto ${result.faceShape} com tom ${result.skinTone}`,
      });
      
      // Avançar para próximo passo
      setTimeout(() => {
        setStep(3);
      }, 1500);
      
    } catch (error) {
      console.error("Erro na análise:", error);
      toast({
        title: "Erro na análise",
        description: "Vamos usar uma análise padrão. Você pode refazer depois.",
        variant: "destructive",
      });
      
      // Usar dados padrão
      setAnalysisResult({
        faceShape: "oval",
        skinTone: "primavera",
        confidence: 75,
        analysis: "Análise em modo demo"
      });
      
      setTimeout(() => {
        setStep(3);
      }, 1500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = async () => {
    // Validar nome e email no step 1
    if (step === 1) {
      if (!name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, digite seu nome",
          variant: "destructive",
        });
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast({
          title: "Email inválido",
          description: "Por favor, digite um email válido",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
      return;
    }
    
    // Analisar foto no step 2
    if (step === 2 && selectedImage && !analysisResult) {
      handleAnalyzeImage();
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Salvar perfil e ir para dashboard
      if (analysisResult) {
        await setProfile({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          faceShape: analysisResult.faceShape as any,
          skinTone: analysisResult.skinTone as any,
          photoUrl: selectedImage || undefined,
          analysisConfidence: analysisResult.confidence,
          joinedDate: new Date().toISOString(),
          stats: {
            glowDays: 1,
            checkIns: 0,
            looksCreated: 0,
          },
        });
        
        toast({
          title: "Perfil criado com sucesso! 🎉",
          description: "Bem-vinda ao Glow UP!",
        });
      }
      
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
        
        <div className="text-center text-sm text-muted-foreground">
          Passo {step} de 3
        </div>

        {/* Content */}
        <Card className="p-8 shadow-medium backdrop-blur-sm bg-card/80 border-primary/20">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Vamos começar!</h2>
                <p className="text-muted-foreground">
                  Primeiro, conte-nos sobre você
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Seu nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Seu email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <p className="text-sm font-medium text-center">O que você vai ganhar:</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                    ✨ Análise de tom de pele com IA
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 text-sm">
                    💇‍♀️ Sugestões personalizadas de cabelo
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                    👗 Looks que favorecem você
                  </div>
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
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-primary/30 bg-primary/5">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    <p className="text-sm font-medium">Analisando sua foto...</p>
                    <p className="text-xs text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
                  </div>
                ) : selectedImage ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-medium">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {!analysisResult && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm text-center">
                          Foto pronta! Clique em continuar para analisar
                        </p>
                      </div>
                    )}
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

          {step === 3 && analysisResult && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Análise concluída! ✨</h2>
                <p className="text-muted-foreground">
                  {analysisResult.analysis}
                </p>
              </div>
              <div className="space-y-3 text-left">
                <div className="p-4 rounded-lg bg-gradient-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Tom de pele: {analysisResult.skinTone}</p>
                    <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                      {analysisResult.confidence}% confiança
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.skinTone === "primavera" || analysisResult.skinTone === "outono"
                      ? "Cores quentes ficam perfeitas em você"
                      : "Cores frias valorizam sua beleza"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-accent/10 border border-accent/20">
                  <p className="font-medium">Formato: {analysisResult.faceShape}</p>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.faceShape === "oval" && "Versátil para diversos estilos"}
                    {analysisResult.faceShape === "redondo" && "Cortes alongados favorecem você"}
                    {analysisResult.faceShape === "quadrado" && "Camadas suaves valorizam seu rosto"}
                    {analysisResult.faceShape === "coração" && "Volume inferior equilibra suas proporções"}
                    {analysisResult.faceShape === "alongado" && "Volume lateral harmoniza seu rosto"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
            size="lg"
            disabled={(step === 1 && (!name.trim() || !email.trim())) || (step === 2 && !selectedImage) || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Analisando com IA...
              </>
            ) : step === 3 ? (
              <>
                Começar!
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              <>
                {step === 2 && selectedImage ? "Analisar com Gemini AI" : "Continuar"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
