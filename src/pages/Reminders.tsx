import { useState, useEffect } from "react";
import { ChevronLeft, Bell, Plus, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/lib/user-store";
import { useToast } from "@/hooks/use-toast";
import { getReminders, saveReminder, toggleReminder, deleteReminder } from "@/lib/database";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const Reminders = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("profile");
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newReminder, setNewReminder] = useState({
    type: 'skincare',
    title: '',
    message: '',
    time: '09:00'
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    if (!profile?.email) {
      console.log("Sem email no profile");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      console.log("Profile data:", profileData);

      if (!profileData) {
        console.log("Profile não encontrado");
        return;
      }

      const data = await getReminders(profileData.id, false); // Buscar todos, não apenas ativos
      console.log("Lembretes carregados:", data);
      setReminders(data);
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!profile?.email || !newReminder.title) {
      console.log("Faltam dados:", { email: profile?.email, title: newReminder.title });
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();

      console.log("Profile para criar lembrete:", profileData);

      if (!profileData) return;

      const reminderData = {
        profile_id: profileData.id,
        reminder_type: newReminder.type,
        title: newReminder.title,
        message: newReminder.message || '',
        scheduled_time: newReminder.time + ':00' // Formato TIME: HH:MM:SS
      };

      console.log("Dados do lembrete a ser salvo:", reminderData);

      const result = await saveReminder(reminderData);
      console.log("Resultado do save:", result);

      toast({
        title: "Lembrete criado",
        description: "Seu lembrete foi salvo com sucesso"
      });

      setIsDialogOpen(false);
      setNewReminder({ type: 'skincare', title: '', message: '', time: '09:00' });
      await loadReminders(); // Await para garantir reload
    } catch (error) {
      console.error("Erro completo ao criar lembrete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete",
        variant: "destructive"
      });
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await toggleReminder(id, !currentState);
      loadReminders();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lembrete",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id);
      toast({ title: "Lembrete excluído" });
      loadReminders();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lembrete",
        variant: "destructive"
      });
    }
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      skincare: '✨',
      outfit: '👗',
      hair: '💇',
      general: '📌'
    };
    return emojis[type] || '📌';
  };

  return (
    <div className="min-h-screen bg-gradient-glow pb-24">
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Lembretes</h1>
                <p className="text-sm text-muted-foreground">Notificações e alertas</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Lembrete</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Tipo</Label>
                    <select 
                      className="w-full mt-1 p-2 rounded-md border bg-background"
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
                    >
                      <option value="skincare">Skincare</option>
                      <option value="outfit">Look</option>
                      <option value="hair">Cabelo</option>
                      <option value="general">Geral</option>
                    </select>
                  </div>
                  <div>
                    <Label>Título</Label>
                    <Input 
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                      placeholder="Ex: Lavar o cabelo"
                    />
                  </div>
                  <div>
                    <Label>Mensagem</Label>
                    <Textarea 
                      value={newReminder.message}
                      onChange={(e) => setNewReminder({...newReminder, message: e.target.value})}
                      placeholder="Detalhes do lembrete..."
                    />
                  </div>
                  <div>
                    <Label>Horário</Label>
                    <Input 
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleAddReminder} className="w-full">
                    Criar Lembrete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </Card>
        ) : reminders.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum lembrete criado</p>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className="p-5">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{getTypeEmoji(reminder.reminder_type)}</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{reminder.title}</h3>
                      {reminder.message && (
                        <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
                      )}
                    </div>
                    <Switch 
                      checked={reminder.is_active}
                      onCheckedChange={() => handleToggle(reminder.id, reminder.is_active)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(reminder.scheduled_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Reminders;
