import { Team, Event, Message, TeamMember } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Calendar, MessageSquare, Trophy } from "lucide-react";
import { Badge } from "../ui/badge";

type CoachDashboardProps = {
  team: Team;
  members: TeamMember[];
  events: Event[];
  messages: Message[];
  joinRequests: any[];
};

export function CoachDashboard({ team, members, events, messages, joinRequests }: CoachDashboardProps) {
  const players = members.filter((m) => m.role === "player" && m.status === "active");
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentMessages = messages.slice(0, 5);
  const unreadMessages = messages.filter((m) => m.senderId !== localStorage.getItem("userId")).length;

  // Check if this is the demo account
  const isDemoAccount = team.name === "Warriors Basketball";

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      {/* Demo Banner */}
      {isDemoAccount && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-blue-900 dark:text-blue-100">Demo Mode</h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  You're viewing the demo account. Explore all features! To add players, have them join using code: <strong>{team.code}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-4">
        {team.logoUrl ? (
          <img 
            src={team.logoUrl} 
            alt={team.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg"
            style={{ backgroundColor: team.color || "#3b82f6" }}
          >
            <Trophy className="h-8 w-8 text-white" />
          </div>
        )}
        <div>
          <h1>{team.name}</h1>
          <p className="text-muted-foreground">Team Code: {team.code}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Total Players</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{players.length}</div>
            <p className="text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Upcoming Events</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{upcomingEvents.length}</div>
            <p className="text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{messages.length}</div>
            <p className="text-muted-foreground mt-1">{unreadMessages} unread</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Join Requests</CardTitle>
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{joinRequests.length}</div>
            <p className="text-muted-foreground mt-1">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <div className="text-foreground">{event.title}</div>
                      <div className="text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </div>
                      <div className="text-muted-foreground">{event.location}</div>
                    </div>
                    <Badge>
                      {event.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No messages yet</p>
              ) : (
                recentMessages.map((message) => (
                  <div key={message.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="text-foreground">{message.subject}</div>
                      <span className="text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      From: {message.senderName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {joinRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">{joinRequests.length}</Badge>
              Pending Join Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You have {joinRequests.length} pending join request{joinRequests.length !== 1 ? "s" : ""}.
              Go to Roster to review and approve.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
