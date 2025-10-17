import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { teamAPI, joinRequestAPI } from "../../utils/api";
import { toast } from "sonner@2.0.3";
import { User, Team } from "../../types";
import { Plus, Users } from "lucide-react";

type TeamOnboardingProps = {
  user: User;
  onTeamSelected: (team: Team) => void;
};

export function TeamOnboarding({
  user,
  onTeamSelected,
}: TeamOnboardingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<
    "choice" | "create" | "join" | "pending"
  >("choice");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [pendingTeamName, setPendingTeamName] = useState("");

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await teamAPI.create({
        name: teamName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });

      toast.success(`Team created! Code: ${response.code}`);
      toast.info(
        `Share code ${response.code} with your team members`,
        { duration: 8000 },
      );
      onTeamSelected(response.team);
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim() || teamCode.length !== 8) {
      toast.error("Please enter a valid 8-digit team code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await joinRequestAPI.create({
        teamCode: teamCode,
        role: user.role,
      });

      toast.success("Join request sent!");
      setPendingTeamName(teamCode); // Store the team code for display
      setView("pending");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to send join request",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "choice") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Welcome, {user.firstName}!</CardTitle>
            <CardDescription>
              {user.role === "coach"
                ? "Create a new team or join an existing one"
                : "Join a team to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.role === "coach" && (
              <Button
                onClick={() => setView("create")}
                className="flex h-24 w-full flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Plus className="h-8 w-8" />
                <div>
                  <div>Create New Team</div>
                  <p className="text-muted-foreground">
                    Start managing your own team
                  </p>
                </div>
              </Button>
            )}
            <Button
              onClick={() => setView("join")}
              className="flex h-24 w-full flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Users className="h-8 w-8" />
              <div>
                <div>Join Existing Team</div>
                <p className="text-muted-foreground">
                  Enter an 8-digit team code
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Your Team</CardTitle>
            <CardDescription>
              Choose a name for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                placeholder="e.g., Warriors Basketball"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setView("choice")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <svg
                className="h-8 w-8 text-orange-600 dark:text-orange-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <CardTitle>Pending Coach Approval</CardTitle>
            <CardDescription>
              Your join request has been submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950">
              <h3 className="text-orange-900 dark:text-orange-100">
                What happens next?
              </h3>
              <ul className="mt-2 space-y-2 text-orange-700 dark:text-orange-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Your team coach will review your request
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    You'll receive access once approved
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Check back soon or contact your coach
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Request Status
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>
                  <span className="text-orange-600 dark:text-orange-400">
                    Pending
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Team Code
                </span>
                <code className="rounded bg-background px-2 py-1 text-foreground">
                  {pendingTeamName}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Your Role
                </span>
                <span className="capitalize text-foreground">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-center text-muted-foreground">
                Need to join a different team?
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setView("join");
                  setTeamCode("");
                  setPendingTeamName("");
                }}
                className="w-full"
              >
                Try Another Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Team</CardTitle>
          <CardDescription>
            Enter the 8-digit code provided by your coach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="teamCode">Team Code *</Label>
            <Input
              id="teamCode"
              placeholder="12345678"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              maxLength={8}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setView("choice")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleJoinTeam}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Sending..." : "Join Team"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}