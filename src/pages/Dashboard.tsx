import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, Scissors, Shirt, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useUserStore } from "@/lib/user-store";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UsageStats from "@/components/UsageStats";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const [savedLooksCount, setSavedLooksCount] = useState(0);
  const profile = useUserStore((state) => state.profile);
  
  // Carregar contagem de looks salvos
  useEffect(() => {
    const loadSavedLooksCount = async () => {
      if (!profile?.email) return;
      
      try {
        // Buscar o profile_id do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', profile.email)
          .single();

        if (profileError) throw profileError;

        // Contar looks salvos
        const { count, error: countError } = await supabase
          .from('outfits')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileData.id);

        if (countError) throw countError;

        setSavedLooksCount(count || 0);
      } catch (error) {
        console.error("Erro ao carregar contagem de looks:", error);
      }
    };

    loadSavedLooksCount();
  }, [profile?.email]);

  // Redirecionar para login se não tiver perfil (após verificação inicial)
  useEffect(() => {
    if (hasChecked) return;
    
    // Dar tempo para o perfil carregar do localStorage
    const timer = setTimeout(() => {
      setHasChecked(true);
      if (!profile) {
        navigate("/login", { replace: true });
      } else {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [profile, navigate, hasChecked]);

  // Mostrar loading enquanto verifica o perfil
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-glow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Olá, {profile?.name || "Bella"}! ✨</h1>
              <p className="text-sm text-muted-foreground">Como você está hoje?</p>
            </div>
            <div>
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover shadow-soft border-2 border-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-primary shadow-soft flex items-center justify-center text-primary-foreground font-semibold">
                  {profile?.name?.charAt(0).toUpperCase() || "B"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-foreground">
              {profile?.stats.glowDays || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dias de Glow</p>
          </Card>
          <Card className="p-4 text-center shadow-soft border-secondary/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-foreground">
              {profile?.stats.checkIns || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Análises</p>
          </Card>
          <Card className="p-4 text-center shadow-soft border-accent/20 bg-card/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-foreground">{savedLooksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Looks salvos</p>
          </Card>
        </div>

        {/* Look Perfeito - Destaque */}
        <Card className="p-6 shadow-glow border-primary/30 bg-gradient-primary/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/glowy.jpeg" 
                alt="Glow UP" 
                className="w-12 h-12 rounded-full shadow-medium animate-glow-pulse object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">Look Perfeito</h3>
                <p className="text-sm text-muted-foreground">
                  Veja o que combina com você hoje
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-medium" onClick={() => navigate("/look-perfeito")}>
              Descobrir meu look ✨
            </Button>
          </div>
        </Card>

        {/* Meus Salvos */}
        <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-secondary/20 bg-card/50 backdrop-blur-sm" onClick={() => navigate("/my-saved")}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-soft">
              <Bookmark className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Meus Salvos</h3>
              <p className="text-sm text-muted-foreground">Veja seus looks e cortes favoritos</p>
            </div>
            <Heart className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Módulos Principais */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Seus Cuidados</h2>
          
          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-primary/20 bg-card/50 backdrop-blur-sm" onClick={() => navigate("/skin")}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Skin</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.skinTone ? `Tom: ${profile.skinTone}` : "Defina sua rotina"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-secondary/20 bg-card/50 backdrop-blur-sm" onClick={() => navigate("/hair")}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Scissors className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Hair</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.faceShape ? `Rosto: ${profile.faceShape}` : "Faça seu check-in"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft hover:shadow-medium transition-all cursor-pointer border-accent/20 bg-card/50 backdrop-blur-sm" onClick={() => navigate("/style")}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Shirt className="w-7 h-7 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Glow Style</h3>
                <p className="text-sm text-muted-foreground">
                  Organize seu closet
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Estatísticas de Uso */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Suas Estatísticas</h2>
          <UsageStats />
        </div>

        {/* Motivação do dia */}
        <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-accent/5 backdrop-blur-sm">
          <p className="text-sm italic text-foreground/80">
            "Sua beleza natural merece ser celebrada todos os dias. Você é única! 💖"
          </p>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
