import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Heart, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Sobre o Glow UP</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Logo & Intro */}
        <Card className="p-8 text-center shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-glow mx-auto animate-float">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Glow UP
            </h2>
            <p className="text-muted-foreground">
              Seu guia de beleza personalizado com inteligência artificial
            </p>
          </div>
        </Card>

        {/* Mission */}
        <Card className="p-6 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Nossa Missão</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Ajudar você a descobrir e valorizar sua beleza natural através de recomendações
            personalizadas baseadas em suas características únicas.
          </p>
        </Card>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold px-1">O que oferecemos</h3>
          
          <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Análise com IA</h4>
                <p className="text-sm text-muted-foreground">
                  Usamos Google Gemini AI para analisar seu tom de pele e formato do rosto
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Recomendações Personalizadas</h4>
                <p className="text-sm text-muted-foreground">
                  Sugestões de skincare, cabelo e estilo específicas para você
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Privacidade</h4>
                <p className="text-sm text-muted-foreground">
                  Seus dados são protegidos e nunca compartilhados com terceiros
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Technology */}
        <Card className="p-6 shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm space-y-3">
          <h3 className="font-semibold">Tecnologia</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <span className="font-medium text-foreground">Google Gemini AI</span> - Análise facial avançada</p>
            <p>• <span className="font-medium text-foreground">Supabase</span> - Database seguro na nuvem</p>
            <p>• <span className="font-medium text-foreground">React + TypeScript</span> - Interface moderna</p>
            <p>• <span className="font-medium text-foreground">Tailwind CSS</span> - Design responsivo</p>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm text-center space-y-3">
          <Users className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h3 className="font-semibold mb-1">Entre em Contato</h3>
            <p className="text-sm text-muted-foreground">
              Dúvidas ou sugestões? Envie para:
            </p>
            <p className="text-sm font-medium text-primary mt-2">
              contato@glowup.com
            </p>
          </div>
        </Card>

        {/* Version */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Versão 1.0.0</p>
          <p className="mt-1">© 2025 Glow UP. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
