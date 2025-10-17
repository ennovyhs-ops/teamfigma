import { Team, Event, Message, User } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, MessageSquare, Users, Shield } from "lucide-react";
import { Badge } from "./ui/badge";

type SimpleDashboardProps = {
  user: User;
  team: Team;
  events: Event[];
  messages: Message[];
};

export function SimpleDashboard({ user, team, events, messages }: SimpleDashboardProps) {
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentMessages = messages.slice(0, 5);

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
      </div>

      {/* Team Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {team.logoUrl ? (
              <img 
                src={team.logoUrl} 
                alt={team.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: team.color || "#3b82f6" }}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-foreground">{team.name}</h2>
              <p className="text-muted-foreground">Team Code: {team.code}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
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
            <p className="text-muted-foreground mt-1">Total messages</p>
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
                    <Badge>{event.type}</Badge>
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
                    <div className="text-muted-foreground">From: {message.senderName}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
