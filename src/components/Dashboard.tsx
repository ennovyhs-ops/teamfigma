import { Athlete, Game } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Trophy, TrendingUp, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

type DashboardProps = {
  athletes: Athlete[];
  games: Game[];
};

export function Dashboard({ athletes, games }: DashboardProps) {
  const activeAthletes = athletes.filter((a) => a.status === "active").length;
  const injuredAthletes = athletes.filter((a) => a.status === "injured").length;

  const completedGames = games.filter((g) => g.status === "completed");
  const upcomingGames = games.filter((g) => g.status === "scheduled").length;

  const wins = completedGames.filter((g) => 
    g.isHome ? g.homeScore > g.awayScore : g.awayScore > g.homeScore
  ).length;
  const losses = completedGames.length - wins;
  const winRate = completedGames.length > 0 ? ((wins / completedGames.length) * 100).toFixed(1) : "0";

  const totalPoints = athletes.reduce((sum, a) => sum + a.points, 0);
  const avgPointsPerPlayer = athletes.length > 0 ? (totalPoints / athletes.length).toFixed(1) : "0";

  const topScorers = [...athletes]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const recentGames = [...completedGames]
    .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
    .slice(0, 6)
    .reverse();

  const performanceData = recentGames.map((game) => ({
    date: new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: game.isHome ? game.homeScore : game.awayScore,
    opponentScore: game.isHome ? game.awayScore : game.homeScore,
  }));

  const positionData = [
    { position: "Forward", count: athletes.filter((a) => a.position === "Forward").length },
    { position: "Guard", count: athletes.filter((a) => a.position === "Guard").length },
    { position: "Center", count: athletes.filter((a) => a.position === "Center").length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your team overview.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Active Athletes</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{activeAthletes}</div>
            <p className="text-muted-foreground mt-1">{injuredAthletes} injured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Win Rate</CardTitle>
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{winRate}%</div>
            <p className="text-muted-foreground mt-1">{wins}W - {losses}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Upcoming Games</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{upcomingGames}</div>
            <p className="text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground">Avg Points/Player</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-primary">{avgPointsPerPlayer}</div>
            <p className="text-muted-foreground mt-1">This season</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-6 sm:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Our Score",
                  color: "hsl(var(--chart-1))",
                },
                opponentScore: {
                  label: "Opponent Score",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="opponentScore"
                    stroke="var(--color-opponentScore)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roster by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Athletes",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {topScorers.map((athlete, index) => (
                <div key={athlete.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 sm:pb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-8 sm:w-8">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-foreground">{athlete.name}</div>
                      <div className="text-muted-foreground">#{athlete.jerseyNumber} • {athlete.position}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground">{athlete.points} pts</div>
                    <div className="text-muted-foreground">{athlete.gamesPlayed} games</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {completedGames.slice(0, 5).map((game) => {
                const won = game.isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore;
                const ourScore = game.isHome ? game.homeScore : game.awayScore;
                const theirScore = game.isHome ? game.awayScore : game.homeScore;
                
                return (
                  <div key={game.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 sm:pb-4">
                    <div>
                      <div className="text-foreground">{game.opponent}</div>
                      <div className="text-muted-foreground">
                        {new Date(game.gameDate).toLocaleDateString()} • {game.isHome ? "Home" : "Away"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={won ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {ourScore} - {theirScore}
                      </div>
                      <div className="text-muted-foreground">{won ? "W" : "L"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
