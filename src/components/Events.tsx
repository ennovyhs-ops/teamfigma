import { useState } from "react";
import { Event, User, EventType, Attendance, AttendanceStatus, TeamMember } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock, MapPin, Plus, Trophy, Users as UsersIcon, MessageSquare, MoreVertical, Edit, Trash } from "lucide-react";
import { eventAPI, attendanceAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type EventsProps = {
  teamId: string;
  user: User;
  events: Event[];
  members: TeamMember[];
  attendance: Attendance[];
  onRefresh: () => void;
};

export function Events({ teamId, user, events, members, attendance, onRefresh }: EventsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    type: "practice",
    title: "",
    date: "",
    time: "",
    location: "",
    details: "",
  });

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events
    .filter((e) => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isCoach = user.role === "coach";

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "game":
        return <Trophy className="h-5 w-5" />;
      case "practice":
        return <UsersIcon className="h-5 w-5" />;
      case "meeting":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "game":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "practice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "meeting":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleCreateOrUpdateEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, formData);
        toast.success("Event updated!");
      } else {
        await eventAPI.create({
          ...formData,
          teamId,
        });
        toast.success("Event created!");
      }

      setIsCreateOpen(false);
      setEditingEvent(null);
      setFormData({
        type: "practice",
        title: "",
        date: "",
        time: "",
        location: "",
        details: "",
      });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await eventAPI.delete(eventId);
        toast.success("Event deleted!");
        onRefresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete event");
      }
    }
  };

  const handleIndicateAttendance = async (eventId: string, status: AttendanceStatus) => {
    try {
      await attendanceAPI.indicate({
        eventId,
        playerId: user.id,
        indicatedStatus: status,
      });
      toast.success("Attendance updated!");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update attendance");
    }
  };

  const getUserAttendance = (eventId: string) => {
    return attendance.find((a) => a.eventId === eventId && a.userId === user.id);
  };

  const getEventAttendance = (eventId: string) => {
    return attendance.filter((a) => a.eventId === eventId);
  };

  const EventCard = ({ event }: { event: Event }) => {
    const userAttendance = getUserAttendance(event.id);
    const eventAttendance = getEventAttendance(event.id);

    return (
      <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setSelectedEvent(event)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-foreground">{event.title}</h3>
                  <Badge className={getEventColor(event.type)}>{event.type}</Badge>
                </div>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  {event.opponent && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      vs {event.opponent} ({event.isHome ? "Home" : "Away"})
                    </div>
                  )}
                </div>
                {userAttendance && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      Your status: {userAttendance.indicatedStatus || "Not indicated"}
                    </Badge>
                  </div>
                )}
                {isCoach && eventAttendance.length > 0 && (
                  <div className="mt-2 text-muted-foreground">
                    {eventAttendance.length} attendance record{eventAttendance.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
            {isCoach && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEvent(event);
                      setFormData(event);
                      setIsCreateOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Events</h1>
          <p className="text-muted-foreground">Team schedule and activities</p>
        </div>
        {isCoach && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                <DialogDescription>Schedule a team event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Event Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: EventType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Team Practice"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Gym"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {formData.type === "game" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="opponent">Opponent</Label>
                      <Input
                        id="opponent"
                        placeholder="Opposing team"
                        value={formData.opponent || ""}
                        onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="isHome">Game Type</Label>
                      <Select
                        value={formData.isHome ? "home" : "away"}
                        onValueChange={(value) => setFormData({ ...formData, isHome: value === "home" })}
                      >
                        <SelectTrigger id="isHome">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Additional event details..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingEvent(null);
                      setFormData({
                        type: "practice",
                        title: "",
                        date: "",
                        time: "",
                        location: "",
                        details: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrUpdateEvent}>
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 sm:flex-initial">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming events
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No past events
              </CardContent>
            </Card>
          ) : (
            pastEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Event Details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <Badge className={getEventColor(selectedEvent.type)}>{selectedEvent.type}</Badge>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <p className="text-foreground">
                    {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-foreground">{selectedEvent.location}</p>
                </div>
                {selectedEvent.opponent && (
                  <div>
                    <Label>Opponent</Label>
                    <p className="text-foreground">
                      {selectedEvent.opponent} ({selectedEvent.isHome ? "Home" : "Away"})
                    </p>
                  </div>
                )}
              </div>

              {selectedEvent.details && (
                <div>
                  <Label>Details</Label>
                  <p className="text-foreground">{selectedEvent.details}</p>
                </div>
              )}

              {user.role !== "coach" && new Date(selectedEvent.date) >= new Date() && (
                <div>
                  <Label>Indicate Your Attendance</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Button
                      variant={getUserAttendance(selectedEvent.id)?.indicatedStatus === "attend" ? "default" : "outline"}
                      onClick={() => handleIndicateAttendance(selectedEvent.id, "attend")}
                    >
                      Attend
                    </Button>
                    <Button
                      variant={getUserAttendance(selectedEvent.id)?.indicatedStatus === "late" ? "default" : "outline"}
                      onClick={() => handleIndicateAttendance(selectedEvent.id, "late")}
                    >
                      Late
                    </Button>
                    <Button
                      variant={getUserAttendance(selectedEvent.id)?.indicatedStatus === "injured" ? "default" : "outline"}
                      onClick={() => handleIndicateAttendance(selectedEvent.id, "injured")}
                    >
                      Injured
                    </Button>
                    <Button
                      variant={getUserAttendance(selectedEvent.id)?.indicatedStatus === "absent" ? "default" : "outline"}
                      onClick={() => handleIndicateAttendance(selectedEvent.id, "absent")}
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              )}

              {isCoach && (
                <div>
                  <Label>Attendance ({getEventAttendance(selectedEvent.id).length})</Label>
                  <div className="mt-2 space-y-2">
                    {getEventAttendance(selectedEvent.id).map((att) => {
                      const member = members.find((m) => m.userId === att.userId);
                      return (
                        <div key={att.id} className="flex items-center justify-between rounded-lg border p-2">
                          <div>
                            <p className="text-foreground">
                              {member?.user?.firstName} {member?.user?.lastName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Indicated: {att.indicatedStatus || "N/A"}
                            </Badge>
                            {att.actualStatus && (
                              <Badge>Actual: {att.actualStatus}</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
