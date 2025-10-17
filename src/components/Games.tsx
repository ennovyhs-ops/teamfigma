import { useState } from "react";
import { Game } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, MoreVertical, Edit, Trash, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type GamesProps = {
  games: Game[];
  onAddGame: (game: Omit<Game, "id" | "createdAt">) => void;
  onUpdateGame: (id: string, game: Partial<Game>) => void;
  onDeleteGame: (id: string) => void;
};

export function Games({ games, onAddGame, onUpdateGame, onDeleteGame }: GamesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    opponent: "",
    location: "",
    isHome: true,
    gameDate: "",
    gameTime: "",
    homeScore: 0,
    awayScore: 0,
    status: "scheduled" as Game["status"],
    attendance: 0,
  });

  const getStatusColor = (status: Game["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in-progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleSubmit = () => {
    if (!formData.opponent || !formData.location || !formData.gameDate || !formData.gameTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingGame) {
      onUpdateGame(editingGame.id, formData);
      toast.success("Game updated successfully");
      setEditingGame(null);
    } else {
      onAddGame(formData);
      toast.success("Game added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      opponent: "",
      location: "",
      isHome: true,
      gameDate: "",
      gameTime: "",
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      attendance: 0,
    });
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      opponent: game.opponent,
      location: game.location,
      isHome: game.isHome,
      gameDate: game.gameDate,
      gameTime: game.gameTime,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      status: game.status,
      attendance: game.attendance,
    });
  };

  const handleDelete = (id: string, opponent: string) => {
    if (confirm(`Are you sure you want to delete the game against ${opponent}?`)) {
      onDeleteGame(id);
      toast.success("Game deleted successfully");
    }
  };

  const scheduledGames = games
    .filter((g) => g.status === "scheduled")
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

  const completedGames = games
    .filter((g) => g.status === "completed")
    .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());

  const GameCard = ({ game }: { game: Game }) => {
    const won = game.status === "completed" && (game.isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore);
    const ourScore = game.isHome ? game.homeScore : game.awayScore;
    const theirScore = game.isHome ? game.awayScore : game.homeScore;

    return (
      <Card key={game.id}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-foreground">{game.opponent}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{game.isHome ? "Home" : "Away"} • {game.location}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(game)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(game.id, game.opponent)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(game.gameDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              • {game.gameTime}
            </span>
          </div>
          {game.status === "completed" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Final Score</span>
                <Badge className={won ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
                  {won ? "W" : "L"}
                </Badge>
              </div>
              <div className="text-foreground">
                {ourScore} - {theirScore}
              </div>
              <div className="text-muted-foreground">
                Attendance: {game.attendance.toLocaleString()}
              </div>
            </div>
          ) : (
            <Badge className={getStatusColor(game.status)}>{game.status}</Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Games</h1>
          <p className="text-muted-foreground">Manage your game schedule and results</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Game</DialogTitle>
              <DialogDescription>Schedule a new game for your team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="opponent">Opponent *</Label>
                  <Input
                    id="opponent"
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    placeholder="Central High"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Home Court"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="isHome">Game Type</Label>
                  <Select value={formData.isHome ? "home" : "away"} onValueChange={(value) => setFormData({ ...formData, isHome: value === "home" })}>
                    <SelectTrigger id="isHome">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gameDate">Date *</Label>
                  <Input
                    id="gameDate"
                    type="date"
                    value={formData.gameDate}
                    onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gameTime">Time *</Label>
                  <Input
                    id="gameTime"
                    type="time"
                    value={formData.gameTime}
                    onChange={(e) => setFormData({ ...formData, gameTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Game["status"]) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="homeScore">Home Score</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    value={formData.homeScore}
                    onChange={(e) => setFormData({ ...formData, homeScore: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="awayScore">Away Score</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    value={formData.awayScore}
                    onChange={(e) => setFormData({ ...formData, awayScore: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="attendance">Attendance</Label>
                  <Input
                    id="attendance"
                    type="number"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Game</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">
            Upcoming ({scheduledGames.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
            Completed ({completedGames.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {scheduledGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming games scheduled
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scheduledGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No completed games yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>Update game information and results.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-opponent">Opponent *</Label>
                <Input
                  id="edit-opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="edit-isHome">Game Type</Label>
                <Select value={formData.isHome ? "home" : "away"} onValueChange={(value) => setFormData({ ...formData, isHome: value === "home" })}>
                  <SelectTrigger id="edit-isHome">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-gameDate">Date *</Label>
                <Input
                  id="edit-gameDate"
                  type="date"
                  value={formData.gameDate}
                  onChange={(e) => setFormData({ ...formData, gameDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-gameTime">Time *</Label>
                <Input
                  id="edit-gameTime"
                  type="time"
                  value={formData.gameTime}
                  onChange={(e) => setFormData({ ...formData, gameTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Game["status"]) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-homeScore">Home Score</Label>
                <Input
                  id="edit-homeScore"
                  type="number"
                  value={formData.homeScore}
                  onChange={(e) => setFormData({ ...formData, homeScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-awayScore">Away Score</Label>
                <Input
                  id="edit-awayScore"
                  type="number"
                  value={formData.awayScore}
                  onChange={(e) => setFormData({ ...formData, awayScore: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-attendance">Attendance</Label>
                <Input
                  id="edit-attendance"
                  type="number"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingGame(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
