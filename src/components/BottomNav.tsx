import { Home, Heart, Scissors, Shirt, User, Bookmark, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    { id: "style", icon: Shirt, label: "Style", path: "/style" },
    { id: "skin", icon: Sparkles, label: "Skincare", path: "/skin" },
    { id: "hair", icon: Scissors, label: "Hair", path: "/hair" },
    { id: "saved", icon: Bookmark, label: "Salvos", path: "/my-saved" },
    { id: "profile", icon: User, label: "Perfil", path: "/profile" },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-medium z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-primary shadow-soft scale-110"
                      : "bg-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`} />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
