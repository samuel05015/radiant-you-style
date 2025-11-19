import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/lib/user-store";
import { getProfile } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
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
      // Buscar perfil no banco de dados
      const profile = await getProfile(email.toLowerCase().trim());

      if (profile) {
        // Converter o perfil do banco para o formato do store
        await setProfile({
          name: profile.name,
          email: profile.email,
          gender: profile.gender as "masculino" | "feminino" | undefined,
          faceShape: profile.face_shape as "oval" | "redondo" | "quadrado" | "coração" | "alongado" | undefined,
          skinTone: profile.skin_tone as "primavera" | "verão" | "outono" | "inverno" | undefined,
          photoUrl: profile.photo_url || undefined,
          analysisConfidence: profile.analysis_confidence || undefined,
          joinedDate: profile.created_at,
          stats: {
            glowDays: profile.glow_days || 0,
            checkIns: profile.check_ins || 0,
            looksCreated: profile.looks_created || 0,
          },
        });

        toast({
          title: "Login realizado! ✨",
          description: `Bem-vindo${profile.gender === "feminino" ? "a" : ""} de volta, ${profile.name}!`,
        });

        // Aguardar um pouco para garantir que o perfil foi persistido
        setTimeout(() => {
          navigate("/dashboard");
        }, 200);
      } else {
        toast({
          title: "Conta não encontrada",
          description: "Nenhuma conta encontrada com este email. Deseja criar uma conta?",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
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
              Entre para brilhar ainda mais! ✨
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
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
                Entrando...
              </>
            ) : (
              <>
                Entrar
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

        {/* Sign Up Link */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-primary/20 hover:bg-primary/5"
          onClick={() => navigate("/register")}
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Criar nova conta
        </Button>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade
        </p>
      </Card>
    </div>
  );
};

export default Login;
