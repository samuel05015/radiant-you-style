import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Palette, Heart, Calendar, Settings as SettingsIcon, LogOut, TrendingUp, Crown, Sparkles, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useUserStore } from "@/lib/user-store";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const profile = useUserStore((state) => state.profile);

  const stats = [
    { label: "Dias de Glow", value: profile?.stats.glowDays || 0, color: "primary" },
    { label: "Análises", value: profile?.stats.checkIns || 0, color: "secondary" },
    { label: "Looks criados", value: profile?.stats.looksCreated || 0, color: "accent" },
  ];

  const achievements = [
    { 
      icon: Crown, 
      label: "7 dias seguidos", 
      color: "primary",
      unlocked: (profile?.stats.glowDays || 0) >= 7
    },
    { 
      icon: Sparkles, 
      label: "10 análises", 
      color: "secondary",
      unlocked: (profile?.stats.checkIns || 0) >= 10
    },
    { 
      icon: Heart, 
      label: "Primeira análise", 
      color: "accent",
      unlocked: !!profile?.faceShape
    },
  ];

  const joinedDate = profile?.joinedDate 
    ? new Date(profile.joinedDate).toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      })
    : "Novembro 2025";

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-glow">
                {profile?.photoUrl ? (
                  <AvatarImage src={profile.photoUrl} />
                ) : null}
                <AvatarFallback className="bg-gradient-primary text-2xl text-primary-foreground">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => navigate("/edit-profile")}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-primary shadow-medium flex items-center justify-center border-2 border-card hover:opacity-90 transition-opacity"
              >
                <Edit className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{profile?.name || "Usuário"} ✨</h1>
              <p className="text-sm text-muted-foreground">{profile?.email || "email@exemplo.com"}</p>
            </div>

            {/* Badge */}
            <Badge className="bg-gradient-primary text-primary-foreground shadow-soft">
              <Crown className="w-3 h-3 mr-1" />
              Glow Member
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 text-center shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Conquistas */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Conquistas</h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card
                  key={index}
                  className={`p-4 text-center shadow-soft backdrop-blur-sm transition-all ${
                    achievement.unlocked
                      ? `border-${achievement.color}/20 bg-${achievement.color}/10`
                      : "border-border/50 bg-card/30 opacity-60"
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    achievement.unlocked 
                      ? `bg-${achievement.color}/20` 
                      : "bg-border/50"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      achievement.unlocked 
                        ? `text-${achievement.color}-foreground` 
                        : "text-muted-foreground"
                    }`} />
                  </div>
                  <p className="text-xs font-medium">{achievement.label}</p>
                </Card>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/my-progress")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver Todas as Conquistas
          </Button>
        </div>

        {/* Informações de Perfil */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Meu Perfil de Beleza</h2>

          <Card className="p-5 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Coloração Pessoal</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  Tom de pele: {profile?.skinTone || "Não definido"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {["#F4A460", "#FFD700", "#FF6B6B", "#98D8C8"].map((color, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full shadow-soft border-2 border-card"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Cores quentes valorizam sua beleza natural ✨
            </p>
          </Card>

          <Card className="p-5 shadow-soft border-secondary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Formato do Rosto</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {profile?.faceShape || "Não definido"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-soft border-accent/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Membro desde</h3>
                <p className="text-sm text-muted-foreground capitalize">{joinedDate}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Configurações */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Configurações</h2>

          <Card className="divide-y divide-border/50 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <button 
              onClick={() => navigate("/settings")}
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
            >
              <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">Configurações gerais</span>
              <span className="text-muted-foreground">→</span>
            </button>

            <button 
              onClick={() => navigate("/edit-profile")}
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">Editar perfil</span>
              <span className="text-muted-foreground">→</span>
            </button>

            <button 
              onClick={() => navigate("/onboarding")}
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 font-medium">Refazer análise</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </Card>
        </div>

        {/* Motivação */}
        <Card className="p-6 text-center shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-glow-pulse" />
            <p className="font-semibold">Continue brilhando!</p>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "Você está em uma jornada incrível de autodescoberta 💖"
          </p>
        </Card>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Profile;
