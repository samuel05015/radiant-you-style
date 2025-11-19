import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Camera, Trash2, LogOut, RefreshCw, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const clearProfile = useUserStore((state) => state.clearProfile);
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    clearProfile();
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre! 👋",
    });
    navigate("/");
  };

  const handleDeleteAccount = () => {
    clearProfile();
    toast({
      title: "Conta excluída",
      description: "Seus dados foram removidos com sucesso.",
      variant: "destructive",
    });
    navigate("/");
  };

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
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Profile Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Perfil</h2>
          
          <Card className="p-5 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profile?.name || "Usuário"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email || "email@exemplo.com"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/edit-profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/onboarding")}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refazer Análise Facial
              </Button>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Preferências</h2>
          
          <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-base font-medium">
                    Notificações
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber lembretes diários
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="darkMode" className="text-base font-medium">
                    Modo Escuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tema escuro para o app
                  </p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </Card>
        </div>

        {/* About */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Sobre</h2>
          
          <Card className="p-5 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/about")}
            >
              Sobre o Glow UP
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/privacy")}
            >
              Política de Privacidade
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/terms")}
            >
              Termos de Uso
            </Button>
            <div className="pt-2 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground">
                Versão 1.0.0
              </p>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1 text-destructive">Zona de Perigo</h2>
          
          <Card className="p-5 shadow-soft border-destructive/20 bg-card/50 backdrop-blur-sm space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente
                    excluídos de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sim, excluir minha conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
