import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const updateProfile = useUserStore((state) => state.updateProfile);
  
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, digite um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        photoUrl: photoUrl || undefined,
      });

      toast({
        title: "Perfil atualizado! ✨",
        description: "Suas informações foram salvas com sucesso",
      });

      navigate("/settings");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              onClick={() => navigate("/settings")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Editar Perfil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Photo */}
        <Card className="p-6 shadow-soft border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            <Label>Foto do Perfil</Label>
            <div className="flex flex-col items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-medium"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-5xl shadow-medium">
                  {name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {photoUrl ? "Trocar Foto" : "Adicionar Foto"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl("")}
                  className="text-destructive hover:text-destructive"
                >
                  Remover Foto
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="p-6 shadow-soft border-border/50 bg-card/50 backdrop-blur-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Usado para login e recuperação de conta
            </p>
          </div>
        </Card>

        {/* Analysis Info (Read-only) */}
        <Card className="p-6 shadow-soft border-primary/20 bg-gradient-primary/5 backdrop-blur-sm space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span>Análise Facial</span>
            <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
              {profile?.analysisConfidence}% confiança
            </span>
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Tom de pele</p>
              <p className="font-medium capitalize">{profile?.skinTone || "Não analisado"}</p>
            </div>
            <div className="p-3 rounded-lg bg-card/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Formato do rosto</p>
              <p className="font-medium capitalize">{profile?.faceShape || "Não analisado"}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/onboarding")}
          >
            Refazer Análise
          </Button>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-medium"
          size="lg"
          disabled={isSaving || !name.trim() || !email.trim()}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 w-5 h-5" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
