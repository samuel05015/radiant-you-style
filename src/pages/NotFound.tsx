import { useNavigate } from "react-router-dom";
import { Sparkles, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-glow flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-accent opacity-20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        {/* Icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow mb-4">
            <Search className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            Ops! Parece que esta página não existe ou foi movida.
          </p>
        </div>

        {/* Suggestions Card */}
        <Card className="p-6 shadow-medium backdrop-blur-sm bg-card/80 border-primary/20 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Que tal explorar essas páginas?
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium"
              size="lg"
            >
              <Home className="mr-2 w-5 h-5" />
              Ir para o Dashboard
            </Button>
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Voltar ao início
            </Button>
          </div>
        </Card>

        {/* Motivational message */}
        <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-accent/5 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="font-semibold">Continue sua jornada!</p>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "Sua beleza natural merece ser celebrada todos os dias 💖"
          </p>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
