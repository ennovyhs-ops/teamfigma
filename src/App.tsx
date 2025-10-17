import { useState, useEffect } from "react";
import { AuthScreen } from "./components/auth/AuthScreen";
import { TeamOnboarding } from "./components/auth/TeamOnboarding";
import { TeamSelector } from "./components/TeamSelector";
import { BottomNav } from "./components/BottomNav";
import { CoachDashboard } from "./components/coach/CoachDashboard";
import { CoachRoster } from "./components/coach/CoachRoster";
import { SimpleDashboard } from "./components/SimpleDashboard";
import { SimpleRoster } from "./components/SimpleRoster";
import { Messages } from "./components/Messages";
import { Events } from "./components/Events";
import { Settings } from "./components/Settings";
import { Toaster } from "./components/ui/sonner";
import { User, Team, TeamMember, Message, Event, Attendance } from "./types";
import { teamAPI, joinRequestAPI, messageAPI, eventAPI, getAuthToken } from "./utils/api";
import { toast } from "sonner@2.0.3";
import { setupDemoData } from "./utils/demoData";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Team data
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      // For demo, we'll rely on onboarding flow
      // In production, you'd verify the token and load user data
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamData();
    }
  }, [selectedTeam]);

  const loadTeamData = async () => {
    if (!selectedTeam) return;

    try {
      const [membersRes, requestsRes, messagesRes, eventsRes] = await Promise.all([
        teamAPI.getMembers(selectedTeam.id),
        currentUser?.role === "coach" ? joinRequestAPI.getTeamRequests(selectedTeam.id) : Promise.resolve({ requests: [] }),
        messageAPI.getTeamMessages(selectedTeam.id),
        eventAPI.getTeamEvents(selectedTeam.id),
      ]);

      setMembers(membersRes.members || []);
      setJoinRequests(requestsRes.requests || []);
      setMessages(messagesRes.messages || []);
      setEvents(eventsRes.events || []);
    } catch (error: any) {
      console.error("Failed to load team data:", error);
      toast.error("Failed to load team data");
    }
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("userId", user.id);

    // Load user's teams
    try {
      // If demo user, setup demo data
      if (user.email === "coach@demo.com") {
        const demoTeam = await setupDemoData(user.id);
        setUserTeams([demoTeam]);
        // For demo, auto-select the team
        setSelectedTeam(demoTeam);
        return;
      }

      const response = await teamAPI.getUserTeams(user.id);
      const teams = response.teams || [];
      setUserTeams(teams);

      // For players/parents with only one team, auto-select
      // For coaches, always show team selector (even with 1 team) so they can manage multiple teams
      if (teams.length === 1 && user.role !== "coach") {
        setSelectedTeam(teams[0]);
      }
      
      // Coaches with multiple teams or just 1 team will see the team selector
      // This allows them to switch between teams or create new ones easily
    } catch (error: any) {
      console.error("Failed to load teams:", error);
    }
  };

  const handleTeamSelected = (team: Team) => {
    setSelectedTeam(team);
    setUserTeams([...userTeams, team]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedTeam(null);
    setUserTeams([]);
    setActiveView("dashboard");
  };

  const handleTeamChange = () => {
    setSelectedTeam(null);
    setActiveView("dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // No team selected
  if (!selectedTeam) {
    if (userTeams.length === 0) {
      return <TeamOnboarding user={currentUser} onTeamSelected={handleTeamSelected} />;
    }
    return (
      <TeamSelector
        teams={userTeams}
        onSelectTeam={setSelectedTeam}
        onCreateTeam={currentUser.role === "coach" ? () => {
          // Navigate to team creation - this will show the TeamOnboarding screen
          setUserTeams([]);
        } : undefined}
        userRole={currentUser.role}
        userName={`${currentUser.firstName} ${currentUser.lastName}`}
      />
    );
  }

  // Main app with bottom navigation
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        if (currentUser.role === "coach") {
          return (
            <CoachDashboard
              team={selectedTeam}
              members={members}
              events={events}
              messages={messages}
              joinRequests={joinRequests}
            />
          );
        }
        return (
          <SimpleDashboard
            user={currentUser}
            team={selectedTeam}
            events={events}
            messages={messages}
          />
        );

      case "roster":
        if (currentUser.role === "coach") {
          return (
            <CoachRoster
              members={members}
              joinRequests={joinRequests}
              onRefresh={loadTeamData}
            />
          );
        }
        return <SimpleRoster members={members} />;

      case "messages":
        return (
          <Messages
            teamId={selectedTeam.id}
            user={currentUser}
            messages={messages}
            members={members}
            onRefresh={loadTeamData}
          />
        );

      case "events":
        return (
          <Events
            teamId={selectedTeam.id}
            user={currentUser}
            events={events}
            members={members}
            attendance={attendance}
            onRefresh={loadTeamData}
          />
        );

      case "settings":
        return (
          <Settings
            user={currentUser}
            team={selectedTeam}
            onLogout={handleLogout}
            onTeamChange={handleTeamChange}
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
            onTeamUpdate={(updatedTeam) => {
              setSelectedTeam(updatedTeam);
              // Update team in userTeams list
              setUserTeams(userTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
            }}
          />
        );

      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
      <BottomNav
        activeView={activeView}
        onViewChange={setActiveView}
        messageCount={messages.filter((m) => m.senderId !== currentUser.id).length}
        requestCount={joinRequests.length}
        teamColor={selectedTeam.color}
        teamName={selectedTeam.name}
      />
      <Toaster />
    </div>
  );
}
