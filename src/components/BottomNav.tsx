import { LayoutDashboard, Users, MessageSquare, Calendar, Settings } from "lucide-react";
import { Badge } from "./ui/badge";

type BottomNavProps = {
  activeView: string;
  onViewChange: (view: string) => void;
  messageCount?: number;
  requestCount?: number;
  teamColor?: string;
  teamName?: string;
};

export function BottomNav({ 
  activeView, 
  onViewChange, 
  messageCount = 0, 
  requestCount = 0,
  teamColor,
  teamName 
}: BottomNavProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "roster", icon: Users, label: "Roster", badge: requestCount },
    { id: "messages", icon: MessageSquare, label: "Messages", badge: messageCount },
    { id: "events", icon: Calendar, label: "Events" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      {/* Team Indicator Bar */}
      {teamColor && (
        <div 
          className="h-1 w-full" 
          style={{ backgroundColor: teamColor }}
          title={teamName}
        />
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex flex-1 flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-4 min-w-4 px-1 text-[10px]">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
