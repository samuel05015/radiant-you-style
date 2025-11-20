import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { saveWeeklyPlanner, getWeeklyPlanner, deleteWeeklyPlanner } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const WeeklyPlanner = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("home");
  
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [plannedOutfits, setPlannedOutfits] = useState<any[]>([]);
  const [availableOutfits, setAvailableOutfits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOutfitSelector, setShowOutfitSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getWeekDates(): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  useEffect(() => {
    loadWeekData();
    loadAvailableOutfits();
  }, [currentWeekStart, profile?.email]);

  const loadWeekData = async () => {
    if (!profile?.email) return;
    
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (!profileData) return;

      const weekDates = getWeekDates();
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);

      const data = await getWeeklyPlanner(profileData.id, startDate, endDate);
      setPlannedOutfits(data);
    } catch (error) {
      console.error("Erro ao carregar planejamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableOutfits = async () => {
    if (!profile?.email) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (!profileData) return;

      const { data: outfits } = await supabase
        .from('outfits')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false });

      setAvailableOutfits(outfits || []);
    } catch (error) {
      console.error("Erro ao carregar looks:", error);
    }
  };

  const handleAddOutfit = async (outfitId: string) => {
    if (!profile?.email || !selectedDate) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (!profileData) return;

      const date = new Date(selectedDate);
      const success = await saveWeeklyPlanner({
        profile_id: profileData.id,
        outfit_id: outfitId,
        date: selectedDate,
        day_of_week: date.getDay()
      });

      if (success) {
        toast({
          title: "Look agendado! 📅",
          description: "Seu look foi adicionado ao planejamento semanal",
        });
        loadWeekData();
        setShowOutfitSelector(false);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Erro ao agendar look:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar o look",
        variant: "destructive",
      });
    }
  };

  const handleRemoveOutfit = async (plannerId: string) => {
    const success = await deleteWeeklyPlanner(plannerId);
    if (success) {
      toast({
        title: "Look removido",
        description: "O look foi removido do planejamento",
      });
      loadWeekData();
    }
  };

  const getOutfitForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return plannedOutfits.find(p => p.date === dateStr);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(getWeekStart(newDate));
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Planejador Semanal</h1>
              <p className="text-sm text-muted-foreground">Organize seus looks da semana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Week Navigator */}
        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">
                {currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(getWeekDates()[0])} - {formatDate(getWeekDates()[6])}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Week Grid */}
        <div className="space-y-3">
          {getWeekDates().map((date, index) => {
            const planned = getOutfitForDate(date);
            const isToday = formatDate(date) === formatDate(new Date());
            
            return (
              <Card 
                key={index}
                className={`p-4 shadow-soft ${isToday ? 'border-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {weekDays[date.getDay()]}
                      {isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Hoje</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                  {!planned && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(formatDate(date));
                        setShowOutfitSelector(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>

                {planned && planned.outfits ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-sm font-medium">👕 {planned.outfits.top}</p>
                      <p className="text-sm font-medium">👖 {planned.outfits.bottom}</p>
                      <p className="text-sm font-medium">👟 {planned.outfits.shoes}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-destructive"
                      onClick={() => handleRemoveOutfit(planned.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum look planejado
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog para selecionar look */}
      <Dialog open={showOutfitSelector} onOpenChange={setShowOutfitSelector}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escolha um Look</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {availableOutfits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Você ainda não tem looks salvos
              </p>
            ) : (
              availableOutfits.map((outfit) => (
                <Card
                  key={outfit.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleAddOutfit(outfit.id)}
                >
                  <p className="font-semibold mb-2">{outfit.occasion}</p>
                  <div className="space-y-1 text-sm">
                    <p>👕 {outfit.top}</p>
                    <p>👖 {outfit.bottom}</p>
                    <p>👟 {outfit.shoes}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default WeeklyPlanner;
