import { TrendingUp, Crown, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/user-store";
import { supabase } from "@/lib/supabase";
import { getMostUsedOutfits, getOutfitStats } from "@/lib/database";

interface UsageStatsProps {
  profileId?: string;
}

const UsageStats = ({ profileId }: UsageStatsProps) => {
  const profile = useUserStore((state) => state.profile);
  const [stats, setStats] = useState<any[]>([]);
  const [topOutfit, setTopOutfit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profileId]);

  const loadStats = async () => {
    const email = profile?.email;
    if (!email && !profileId) return;

    setIsLoading(true);
    try {
      let currentProfileId = profileId;

      if (!currentProfileId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (!profileData) return;
        currentProfileId = profileData.id;
      }

      // Buscar looks mais usados
      const mostUsed = await getMostUsedOutfits(currentProfileId, 5);
      setStats(mostUsed);

      if (mostUsed.length > 0) {
        setTopOutfit(mostUsed[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground text-center">Carregando estatísticas...</p>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="p-6 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Ainda não há estatísticas. Use seus looks para ver as métricas!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Look do Mês */}
      {topOutfit && (
        <Card className="p-6 shadow-glow border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-primary opacity-20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Look do Mês 👑</h3>
                <p className="text-sm text-muted-foreground">Seu look mais usado</p>
              </div>
            </div>
            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold">{topOutfit.occasion}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {topOutfit.usage_count} {topOutfit.usage_count === 1 ? 'uso' : 'usos'}
                </span>
                {topOutfit.last_used && (
                  <span className="text-muted-foreground">
                    Último uso: {new Date(topOutfit.last_used).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top 5 Looks */}
      <Card className="p-6 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top 5 Looks Mais Usados
        </h3>
        <div className="space-y-3">
          {stats.map((outfit, index) => (
            <div 
              key={outfit.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                <div>
                  <p className="font-medium">{outfit.occasion}</p>
                  {outfit.last_used && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(outfit.last_used).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{outfit.usage_count}</p>
                <p className="text-xs text-muted-foreground">
                  {outfit.usage_count === 1 ? 'uso' : 'usos'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UsageStats;
