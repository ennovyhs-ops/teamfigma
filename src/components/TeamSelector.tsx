import { Team } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Plus, Users, ChevronRight } from "lucide-react";

type TeamSelectorProps = {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onCreateTeam?: () => void;
  userRole: string;
  userName?: string;
};

export function TeamSelector({ teams, onSelectTeam, onCreateTeam, userRole, userName }: TeamSelectorProps) {
  const isCoach = userRole === "coach";
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center sm:text-left">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary sm:mx-0">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>
            {isCoach ? "Select Team to Manage" : "Select Your Team"}
          </CardTitle>
          <CardDescription>
            {isCoach 
              ? `You're managing ${teams.length} ${teams.length === 1 ? "team" : "teams"}. Choose which team to work with.`
              : `You're a member of ${teams.length} ${teams.length === 1 ? "team" : "teams"}. Select one to continue.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {teams.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No teams found</p>
            </div>
          ) : (
            teams.map((team) => (
              <Card
                key={team.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => onSelectTeam(team)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
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
                    <div className="text-left">
                      <div className="text-foreground">{team.name}</div>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">Team Code: <code className="rounded bg-muted px-1">{team.code}</code></p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          )}
          
          {isCoach && onCreateTeam && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button
                onClick={onCreateTeam}
                className="w-full"
                variant="outline"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Team
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
