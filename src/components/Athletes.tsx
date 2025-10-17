import { useState } from "react";
import { Athlete } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, Search, MoreVertical, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

type AthletesProps = {
  athletes: Athlete[];
  onAddAthlete: (athlete: Omit<Athlete, "id" | "createdAt">) => void;
  onUpdateAthlete: (id: string, athlete: Partial<Athlete>) => void;
  onDeleteAthlete: (id: string) => void;
};

export function Athletes({ athletes, onAddAthlete, onUpdateAthlete, onDeleteAthlete }: AthletesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "Forward",
    jerseyNumber: 0,
    team: "Varsity",
    status: "active" as Athlete["status"],
    gamesPlayed: 0,
    points: 0,
  });

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.jerseyNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingAthlete) {
      onUpdateAthlete(editingAthlete.id, formData);
      toast.success("Athlete updated successfully");
      setEditingAthlete(null);
    } else {
      onAddAthlete(formData);
      toast.success("Athlete added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "Forward",
      jerseyNumber: 0,
      team: "Varsity",
      status: "active",
      gamesPlayed: 0,
      points: 0,
    });
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      name: athlete.name,
      email: athlete.email,
      phone: athlete.phone,
      position: athlete.position,
      jerseyNumber: athlete.jerseyNumber,
      team: athlete.team,
      status: athlete.status,
      gamesPlayed: athlete.gamesPlayed,
      points: athlete.points,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      onDeleteAthlete(id);
      toast.success("Athlete deleted successfully");
    }
  };

  const getStatusColor = (status: Athlete["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "injured":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Athletes</h1>
          <p className="text-muted-foreground">Manage your team roster</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Athlete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Athlete</DialogTitle>
              <DialogDescription>Add a new athlete to your team roster.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="jerseyNumber">Jersey Number *</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    value={formData.jerseyNumber || ""}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                    placeholder="23"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Forward">Forward</SelectItem>
                      <SelectItem value="Guard">Guard</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team">Team</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
                    <SelectTrigger id="team">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Varsity">Varsity</SelectItem>
                      <SelectItem value="JV">JV</SelectItem>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: Athlete["status"]) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gamesPlayed">Games Played</Label>
                  <Input
                    id="gamesPlayed"
                    type="number"
                    value={formData.gamesPlayed}
                    onChange={(e) => setFormData({ ...formData, gamesPlayed: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Total Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Athlete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead className="min-w-[80px]">Jersey</TableHead>
              <TableHead className="min-w-[100px]">Position</TableHead>
              <TableHead className="min-w-[80px]">Team</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Games</TableHead>
              <TableHead className="min-w-[80px]">Points</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No athletes found
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>
                    <div>
                      <div>{athlete.name}</div>
                      <div className="text-muted-foreground">{athlete.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>#{athlete.jerseyNumber}</TableCell>
                  <TableCell>{athlete.position}</TableCell>
                  <TableCell>{athlete.team}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(athlete.status)}>{athlete.status}</Badge>
                  </TableCell>
                  <TableCell>{athlete.gamesPlayed}</TableCell>
                  <TableCell>{athlete.points}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(athlete)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(athlete.id, athlete.name)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingAthlete} onOpenChange={(open) => !open && setEditingAthlete(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
            <DialogDescription>Update athlete information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-jerseyNumber">Jersey Number *</Label>
                <Input
                  id="edit-jerseyNumber"
                  type="number"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger id="edit-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Forward">Forward</SelectItem>
                    <SelectItem value="Guard">Guard</SelectItem>
                    <SelectItem value="Center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-team">Team</Label>
                <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
                  <SelectTrigger id="edit-team">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Varsity">Varsity</SelectItem>
                    <SelectItem value="JV">JV</SelectItem>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Athlete["status"]) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-gamesPlayed">Games Played</Label>
                <Input
                  id="edit-gamesPlayed"
                  type="number"
                  value={formData.gamesPlayed}
                  onChange={(e) => setFormData({ ...formData, gamesPlayed: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-points">Total Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingAthlete(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
