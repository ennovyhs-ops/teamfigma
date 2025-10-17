import { useState } from "react";
import { TeamMember, User } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Search, User as UserIcon, Shield, Baby, Edit, Trash2, X } from "lucide-react";
import { joinRequestAPI, teamAPI } from "../../utils/api";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type CoachRosterProps = {
  members: TeamMember[];
  joinRequests: any[];
  onRefresh: () => void;
};

export function CoachRoster({ members, joinRequests, onRefresh }: CoachRosterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [notes, setNotes] = useState("");
  const [editPlayerInfo, setEditPlayerInfo] = useState({
    position: "Forward",
    jerseyNumber: 0,
  });
  const [playerInfo, setPlayerInfo] = useState({
    position: "Forward",
    jerseyNumber: 0,
    birthMonth: 1,
    birthYear: 2010,
  });

  const players = members.filter((m) => m.role === "player" && m.status === "active");
  const coaches = members.filter((m) => m.role === "coach" && m.status === "active");
  const parents = members.filter((m) => m.role === "parent" && m.status === "active");

  const filteredPlayers = players.filter((member: any) =>
    member.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.playerInfo?.jerseyNumber?.toString().includes(searchQuery) ||
    member.playerInfo?.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveRequest = async (request: any) => {
    try {
      const additionalData: any = {};
      
      if (request.userRole === "player") {
        additionalData.playerInfo = playerInfo;
      } else if (request.userRole === "parent") {
        additionalData.parentInfo = { childrenIds: [] };
      }

      await joinRequestAPI.approve(request.id, additionalData);
      toast.success("Request approved!");
      setSelectedRequest(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      try {
        await joinRequestAPI.reject(requestId);
        toast.success("Request rejected");
        onRefresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to reject request");
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMember) return;

    try {
      await teamAPI.updateMember(selectedMember.id, { notes });
      toast.success("Notes saved");
      setSelectedMember(null);
      setIsEditing(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save notes");
    }
  };

  const handleUpdatePlayer = async () => {
    if (!selectedMember) return;

    try {
      await teamAPI.updateMember(selectedMember.id, {
        playerInfo: editPlayerInfo,
        notes,
      });
      toast.success("Player information updated!");
      setSelectedMember(null);
      setIsEditing(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update player");
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await teamAPI.deleteMember(memberToDelete.id);
      toast.success("Player removed from team");
      setMemberToDelete(null);
      setSelectedMember(null);
      setIsEditing(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove player");
    }
  };

  const handleOpenPlayerDetail = (member: TeamMember) => {
    setSelectedMember(member);
    setNotes(member.notes || "");
    setEditPlayerInfo({
      position: member.playerInfo?.position || "Forward",
      jerseyNumber: member.playerInfo?.jerseyNumber || 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div>
        <h1>Team Roster</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>

      {/* Join Requests Alert */}
      {joinRequests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">{joinRequests.length}</Badge>
              Pending Join Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {joinRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div>
                  <div className="text-foreground">{request.userName}</div>
                  <div className="text-muted-foreground">
                    {request.userEmail} • {request.userRole}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(request);
                      if (request.userRole === "player") {
                        setPlayerInfo({
                          position: "Forward",
                          jerseyNumber: 0,
                          birthMonth: 1,
                          birthYear: 2010,
                        });
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Roster Tabs */}
      <Tabs defaultValue="players" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="players" className="flex-1 sm:flex-initial">
            Players ({players.length})
          </TabsTrigger>
          <TabsTrigger value="coaches" className="flex-1 sm:flex-initial">
            Coaches ({coaches.length})
          </TabsTrigger>
          <TabsTrigger value="parents" className="flex-1 sm:flex-initial">
            Parents ({parents.length})
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
              <Card
                key={member.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => handleOpenPlayerDetail(member)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <div className="text-foreground">
                        {member.user?.firstName} {member.user?.lastName}
                      </div>
                      <div className="text-muted-foreground">
                        {member.playerInfo?.position} • {member.user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {member.notes && (
                      <Badge variant="outline">Has Notes</Badge>
                    )}
                  </div>
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
                <div>
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

        <TabsContent value="parents" className="space-y-3">
          {parents.map((member: any) => (
            <Card key={member.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user?.photoUrl} alt={member.user?.firstName} />
                  <AvatarFallback>
                    {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-foreground">
                      {member.user?.firstName} {member.user?.lastName}
                    </div>
                    <Baby className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-muted-foreground">{member.user?.email}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Player Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => {
        if (!open) {
          setSelectedMember(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle>Player Details</DialogTitle>
                <DialogDescription>
                  {selectedMember?.user?.firstName} {selectedMember?.user?.lastName}
                </DialogDescription>
              </div>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setMemberToDelete(selectedMember)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              {/* Player Photo */}
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedMember.user?.photoUrl} alt={selectedMember.user?.firstName} />
                  <AvatarFallback className="text-2xl">
                    {selectedMember.user?.firstName?.[0]}{selectedMember.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="mb-3">Contact Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground">{selectedMember.user?.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-foreground">{selectedMember.user?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Player Information */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="mb-3">Player Information</h3>
                {isEditing ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="editPosition">Position</Label>
                      <Select
                        value={editPlayerInfo.position}
                        onValueChange={(value) => setEditPlayerInfo({ ...editPlayerInfo, position: value })}
                      >
                        <SelectTrigger id="editPosition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Forward">Forward</SelectItem>
                          <SelectItem value="Guard">Guard</SelectItem>
                          <SelectItem value="Center">Center</SelectItem>
                          <SelectItem value="Defense">Defense</SelectItem>
                          <SelectItem value="Midfielder">Midfielder</SelectItem>
                          <SelectItem value="Striker">Striker</SelectItem>
                          <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editJerseyNumber">Jersey Number</Label>
                      <Input
                        id="editJerseyNumber"
                        type="number"
                        value={editPlayerInfo.jerseyNumber || ""}
                        onChange={(e) => setEditPlayerInfo({ ...editPlayerInfo, jerseyNumber: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Position</Label>
                      <p className="text-foreground">{selectedMember.playerInfo?.position || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Jersey Number</Label>
                      <p className="text-foreground">
                        {selectedMember.playerInfo?.jerseyNumber ? `#${selectedMember.playerInfo.jerseyNumber}` : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Coach Notes */}
              <div>
                <Label htmlFor="notes">Coach Notes (Private)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add private notes about this player..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  disabled={!isEditing}
                />
                <p className="text-muted-foreground mt-1">
                  These notes are only visible to coaches
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      setNotes(selectedMember.notes || "");
                      setEditPlayerInfo({
                        position: selectedMember.playerInfo?.position || "Forward",
                        jerseyNumber: selectedMember.playerInfo?.jerseyNumber || 0,
                      });
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdatePlayer}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedMember(null)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player from Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToDelete?.user?.firstName} {memberToDelete?.user?.lastName}</strong> from the team? 
              This action cannot be undone. The player will no longer have access to team information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Join Request</DialogTitle>
            <DialogDescription>
              {selectedRequest?.userName} - {selectedRequest?.userRole}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest?.userRole === "player" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={playerInfo.position}
                    onValueChange={(value) => setPlayerInfo({ ...playerInfo, position: value })}
                  >
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Forward">Forward</SelectItem>
                      <SelectItem value="Guard">Guard</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                      <SelectItem value="Defense">Defense</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jerseyNumber">Jersey Number</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    value={playerInfo.jerseyNumber || ""}
                    onChange={(e) => setPlayerInfo({ ...playerInfo, jerseyNumber: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleApproveRequest(selectedRequest)}>
              Approve & Add to Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
