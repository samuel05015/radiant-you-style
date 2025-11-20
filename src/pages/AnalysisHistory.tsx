import { useState, useEffect } from "react";
import { ChevronLeft, Camera, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { getAnalysisHistory } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const AnalysisHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("profile");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    if (!profile?.email) return;
    
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (!profileData) return;

      const data = await getAnalysisHistory(profileData.id, filter || undefined);
      setHistory(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      face: '👤 Rosto',
      skin: '✨ Pele',
      hair: '💇 Cabelo'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Histórico de Análises</h1>
              <p className="text-sm text-muted-foreground">Suas análises anteriores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <Tabs defaultValue="all" onValueChange={(v) => setFilter(v === 'all' ? null : v)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="face">Rosto</TabsTrigger>
            <TabsTrigger value="skin">Pele</TabsTrigger>
            <TabsTrigger value="hair">Cabelo</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </Card>
            ) : history.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma análise encontrada</p>
              </Card>
            ) : (
              history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.photo_url && (
                    <div className="h-48 w-full">
                      <img 
                        src={item.photo_url} 
                        alt="Análise"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{getTypeLabel(item.analysis_type)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-sm space-y-2">
                      {Object.entries(item.result_data).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AnalysisHistory;
