import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, TrendingUp, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/lib/user-store";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";

const MyProgress = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("profile");

  const joinedDate = profile?.joinedDate 
    ? new Date(profile.joinedDate).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })
    : "Data não disponível";

  const achievements = [
    {
      id: 1,
      title: "Primeira Análise",
      description: "Completou a análise facial",
      icon: "✨",
      unlocked: true,
    },
    {
      id: 2,
      title: "Glow Starter",
      description: "1 dia de glow",
      icon: "🌟",
      unlocked: (profile?.stats.glowDays || 0) >= 1,
    },
    {
      id: 3,
      title: "Glow Warrior",
      description: "7 dias de glow",
      icon: "🔥",
      unlocked: (profile?.stats.glowDays || 0) >= 7,
    },
    {
      id: 4,
      title: "Check-in Master",
      description: "10 análises realizadas",
      icon: "💯",
      unlocked: (profile?.stats.checkIns || 0) >= 10,
    },
    {
      id: 5,
      title: "Style Creator",
      description: "5 looks criados",
      icon: "👗",
      unlocked: (profile?.stats.looksCreated || 0) >= 5,
    },
    {
      id: 6,
      title: "Glow Legend",
      description: "30 dias de glow",
      icon: "👑",
      unlocked: (profile?.stats.glowDays || 0) >= 30,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Meu Progresso</h1>
              <p className="text-sm text-muted-foreground">Acompanhe sua jornada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center shadow-soft border-primary/20 bg-gradient-primary/10 backdrop-blur-sm">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {profile?.stats.glowDays || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dias de Glow</p>
          </Card>
          
          <Card className="p-4 text-center shadow-soft border-secondary/20 bg-gradient-to-br from-secondary/10 to-accent/10 backdrop-blur-sm">
            <History className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
            <div className="text-3xl font-bold text-secondary-foreground">
              {profile?.stats.checkIns || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Análises</p>
          </Card>
          
          <Card className="p-4 text-center shadow-soft border-accent/20 bg-accent/10 backdrop-blur-sm">
            <Award className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
            <div className="text-3xl font-bold text-accent-foreground">
              {profile?.stats.looksCreated || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Looks</p>
          </Card>
        </div>

        {/* Member Since */}
        <Card className="p-5 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membro desde</p>
              <p className="font-semibold">{joinedDate}</p>
            </div>
          </div>
        </Card>

        {/* Profile Info */}
        <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm space-y-3">
          <h3 className="font-semibold text-lg mb-3">Seu Perfil</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Tom de pele</p>
              <p className="font-medium capitalize">{profile?.skinTone || "Não definido"}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <p className="text-xs text-muted-foreground mb-1">Formato do rosto</p>
              <p className="font-medium capitalize">{profile?.faceShape || "Não definido"}</p>
            </div>
          </div>

          {profile?.analysisConfidence && (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-xs text-muted-foreground mb-1">Confiança da análise</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary"
                    style={{ width: `${profile.analysisConfidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{profile.analysisConfidence}%</span>
              </div>
            </div>
          )}
        </Card>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold px-1">Conquistas 🏆</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-4 shadow-soft backdrop-blur-sm transition-all ${
                  achievement.unlocked
                    ? "border-primary/20 bg-gradient-primary/10"
                    : "border-border/50 bg-card/30 opacity-60"
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full inline-block">
                      Desbloqueada
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-accent/5 backdrop-blur-sm">
          <p className="text-sm italic text-foreground/80">
            "Continue brilhando! Cada dia é uma oportunidade para valorizar sua beleza natural. 💫"
          </p>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MyProgress;
