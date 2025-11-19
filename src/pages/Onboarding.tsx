import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);
  
  // Receber dados do registro se vier da página de register ou pegar do perfil existente
  const registrationData = location.state as { name?: string; email?: string } | null;
  const profile = useUserStore((state) => state.profile);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState(registrationData?.name || profile?.name || "");
  const [email, setEmail] = useState(registrationData?.email || profile?.email || "");
  const [gender, setGender] = useState<"masculino" | "feminino" | "">("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    faceShape: string;
    skinTone: string;
    confidence: number;
    analysis: string;
  } | null>(null);
  const [hasAnalyzedOnce, setHasAnalyzedOnce] = useState(false);

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

  const handleAnalyzeImage = async (forceReanalyze = false) => {
    if (!selectedImage) return;

    // Se já analisou e não é uma reanálise forçada, usar resultado anterior
    if (hasAnalyzedOnce && analysisResult && !forceReanalyze) {
      setStep(2);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeFaceImage(selectedImage);
      setAnalysisResult(result);
      setHasAnalyzedOnce(true);
      
      toast({
        title: forceReanalyze ? "Nova análise concluída! ✨" : "Análise concluída! ✨",
        description: `Detectamos rosto ${result.faceShape} com tom ${result.skinTone}`,
      });
      
      // Avançar para próximo passo
      setTimeout(() => {
        setStep(2);
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
        setStep(2);
      }, 1500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = async () => {
    // No step 1, validar gênero e foto
    if (step === 1) {
      if (!gender) {
        toast({
          title: "Gênero obrigatório",
          description: "Por favor, selecione seu gênero",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedImage) {
        toast({
          title: "Foto obrigatória",
          description: "Por favor, tire uma selfie para análise",
          variant: "destructive",
        });
        return;
      }
      
      // Se já temos foto mas não analisamos, analisar
      if (!analysisResult) {
        handleAnalyzeImage();
        return;
      }
      
      // Se já analisamos, ir para o próximo step
      setStep(2);
      return;
    }
    
    // Step 2 = Confirmação e conclusão
    if (step === 2) {
      // Salvar perfil e ir para dashboard
      if (analysisResult) {
        await setProfile({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          gender: gender,
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
          description: `Bem-vindo${gender === "feminino" ? "a" : ""} ao Glow UP!`,
        });
      }
      
      navigate("/dashboard", { replace: true });
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
          {[1, 2].map((i) => (
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
          Passo {step} de 2
        </div>

        {/* Content */}
        <Card className="p-8 shadow-medium backdrop-blur-sm bg-card/80 border-primary/20">
          {step === 1 && !gender && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Qual é o seu gênero?</h2>
                <p className="text-muted-foreground">
                  Para recomendações personalizadas
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGender("masculino")}
                  className="p-6 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all text-center space-y-3"
                >
                  <div className="text-5xl">👨</div>
                  <div className="font-semibold">Masculino</div>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("feminino")}
                  className="p-6 rounded-2xl border-2 border-border bg-background hover:bg-primary/5 hover:border-primary transition-all text-center space-y-3"
                >
                  <div className="text-5xl">👩</div>
                  <div className="font-semibold">Feminino</div>
                </button>
              </div>
            </div>
          )}

          {step === 1 && gender && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Tire uma selfie</h2>
                <p className="text-muted-foreground">
                  Nossa IA vai analisar seu tom de pele e formato do rosto automaticamente
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
                    {!analysisResult ? (
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm text-center">
                          Foto pronta! Clique em continuar para analisar
                        </p>
                      </div>
                    ) : (
                      <div className="absolute bottom-4 left-4 right-4">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnalyzeImage(true);
                          }}
                          variant="secondary"
                          size="sm"
                          className="w-full bg-white/90 hover:bg-white text-black"
                        >
                          🔄 Refazer análise
                        </Button>
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

          {step === 2 && analysisResult && (
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
                <Button
                  onClick={() => {
                    setStep(1);
                    toast({
                      title: "Voltando para refazer análise",
                      description: "Clique no botão 'Refazer análise' na foto",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  ⬅️ Não gostei, quero refazer
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
            size="lg"
            disabled={(step === 1 && (!name.trim() || !email.trim() || !gender)) || (step === 2 && !selectedImage) || isAnalyzing}
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
