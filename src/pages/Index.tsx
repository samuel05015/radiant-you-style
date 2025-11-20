import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, Heart, Scissors, Shirt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/user-store";

const Index = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  
  // Redirecionamento automático desabilitado - usuário escolhe onde ir
  // useEffect(() => {
  //   if (profile) {
  //     navigate("/dashboard");
  //   }
  // }, [profile, navigate]);

  return (
    <div className="min-h-screen gradient-glow flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-accent opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow mb-4 animate-float">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Glow UP
          </h1>
          
          <p className="text-lg text-foreground/80 max-w-sm mx-auto">
            Seu guia de beleza personalizado que une skincare, cabelo e estilo
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/20 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Glow Skin</p>
              <p className="text-sm text-muted-foreground">Rotina de skincare personalizada</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-secondary/20 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-semibold">Glow Hair</p>
              <p className="text-sm text-muted-foreground">Sugestões para valorizar seu cabelo</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-accent/20 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Shirt className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold">Glow Style</p>
              <p className="text-sm text-muted-foreground">Looks que favorecem você</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button
            onClick={() => navigate("/register")}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium text-lg py-6"
            size="lg"
          >
            Começar agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full border-primary/20 hover:bg-primary/5 text-lg py-6"
            size="lg"
          >
            Já tenho uma conta
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Descubra o que mais valoriza sua beleza natural ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
