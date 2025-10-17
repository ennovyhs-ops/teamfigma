import { useState } from "react";
import { TeamMember } from "../types";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type SimpleRosterProps = {
  members: TeamMember[];
};

export function SimpleRoster({ members }: SimpleRosterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const players = members.filter((m) => m.role === "player" && m.status === "active");
  const coaches = members.filter((m) => m.role === "coach" && m.status === "active");

  const filteredPlayers = players.filter((member: any) =>
    member.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.playerInfo?.jerseyNumber?.toString().includes(searchQuery) ||
    member.playerInfo?.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div>
        <h1>Team Roster</h1>
        <p className="text-muted-foreground">View team members</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="players" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="players" className="flex-1 sm:flex-initial">
            Players ({players.length})
          </TabsTrigger>
          <TabsTrigger value="coaches" className="flex-1 sm:flex-initial">
            Coaches ({coaches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-3">
          {filteredPlayers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No players found
              </CardContent>
            </Card>
          ) : (
            filteredPlayers.map((member: any) => (
              <Card key={member.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.user?.photoUrl} alt={member.user?.firstName} />
                      <AvatarFallback>
                        {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {member.playerInfo?.jerseyNumber && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {member.playerInfo.jerseyNumber}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground">
                      {member.user?.firstName} {member.user?.lastName}
                    </div>
                    <div className="text-muted-foreground">
                      {member.playerInfo?.position}
                    </div>
                  </div>
                  <Badge variant="outline" className="hidden sm:inline-flex">{member.user?.email}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="coaches" className="space-y-3">
          {coaches.map((member: any) => (
            <Card key={member.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user?.photoUrl} alt={member.user?.firstName} />
                  <AvatarFallback>
                    {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-foreground">
                      {member.user?.firstName} {member.user?.lastName}
                    </div>
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-muted-foreground">{member.user?.email}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
