import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, User, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getProfile } from "@/lib/database";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e email.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se o email já existe
      const existingProfile = await getProfile(email.toLowerCase().trim());

      if (existingProfile) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já possui uma conta. Faça login!",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Ir para onboarding com os dados
      navigate("/onboarding", { 
        state: { 
          name: name.trim(), 
          email: email.toLowerCase().trim() 
        } 
      });

    } catch (error) {
      console.error("Erro ao verificar email:", error);
      toast({
        title: "Erro ao verificar email",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-glow flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-glow border-primary/20 bg-card/95 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Glow UP
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie sua conta e comece a brilhar! ✨
            </p>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 border-primary/20 focus:border-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-primary/20 focus:border-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg shadow-soft bg-gradient-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Verificando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Login Link */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-primary/20 hover:bg-primary/5"
          onClick={() => navigate("/login")}
        >
          <LogIn className="w-5 h-5 mr-2" />
          Já tenho uma conta
        </Button>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade
        </p>
      </Card>
    </div>
  );
};

export default Register;
