import { useState, useRef } from "react";
import { User, Team } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { userAPI, clearAuthToken, teamAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";
import { LogOut, User as UserIcon, Shield, Camera, Upload, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type SettingsProps = {
  user: User;
  team: Team;
  onLogout: () => void;
  onTeamChange: () => void;
  onProfileUpdate?: (user: User) => void;
  onTeamUpdate?: (team: Team) => void;
};

export function Settings({ user, team, onLogout, onTeamChange, onProfileUpdate, onTeamUpdate }: SettingsProps) {
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname || "",
    phone: user.phone || "",
    photoUrl: user.photoUrl || "",
  });
  const [teamData, setTeamData] = useState({
    name: team.name,
    logoUrl: team.logoUrl || "",
  });
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isDemoAccount = user.email === "coach@demo.com";
  const isCoach = user.role === "coach";

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfileData({ ...profileData, photoUrl: base64 });
        setIsUploading(false);
        toast.success("Photo selected! Click 'Save Changes' to update.");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to process image");
    }
  };

  const handleRemovePhoto = () => {
    setProfileData({ ...profileData, photoUrl: "" });
    toast.success("Photo removed! Click 'Save Changes' to update.");
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setTeamData({ ...teamData, logoUrl: base64 });
        setIsUploadingLogo(false);
        toast.success("Logo selected! Click 'Save Changes' to update.");
      };
      reader.onerror = () => {
        setIsUploadingLogo(false);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploadingLogo(false);
      toast.error("Failed to process image");
    }
  };

  const handleRemoveLogo = () => {
    setTeamData({ ...teamData, logoUrl: "" });
    toast.success("Logo removed! Click 'Save Changes' to update.");
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await userAPI.update(user.id, profileData);
      toast.success("Profile updated!");
      // Update the user object to reflect changes
      const updatedUser = { ...user, ...profileData };
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleUpdateTeam = async () => {
    try {
      const response = await teamAPI.update(team.id, teamData);
      toast.success("Team updated!");
      // Update the team object to reflect changes
      const updatedTeam = { ...team, ...teamData };
      if (onTeamUpdate) {
        onTeamUpdate(updatedTeam);
      }
      setIsEditingTeam(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update team");
    }
  };

  const handleCancelTeamEdit = () => {
    setTeamData({
      name: team.name,
      logoUrl: team.logoUrl || "",
    });
    setIsEditingTeam(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    onLogout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Manage your account and team settings</p>
      </div>

      {/* Demo Account Info */}
      {isDemoAccount && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Shield className="h-5 w-5" />
              Demo Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-blue-700 dark:text-blue-300">
            <div>
              <strong>Email:</strong> coach@demo.com
            </div>
            <div>
              <strong>Password:</strong> coach123
            </div>
            <p className="text-blue-600 dark:text-blue-400 mt-2">
              This is a demo account with sample data. You can create your own account from the signup page.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="flex-1 sm:flex-initial">
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1 sm:flex-initial">
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center gap-4 border-b border-border pb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.photoUrl} alt={user.firstName} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        {profileData.photoUrl ? "Change Photo" : "Upload Photo"}
                      </>
                    )}
                  </Button>
                  {profileData.photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-center">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={profileData.nickname}
                  onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>

              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Information</CardTitle>
                  <CardDescription>
                    {isCoach 
                      ? "Manage your team settings" 
                      : "View team information"
                    }
                  </CardDescription>
                </div>
                {isCoach && !isEditingTeam && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingTeam(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingTeam ? (
                <>
                  {/* Team Logo Upload */}
                  <div className="flex flex-col items-center gap-4 border-b border-border pb-6">
                    <div className="relative">
                      {teamData.logoUrl ? (
                        <img 
                          src={teamData.logoUrl} 
                          alt={teamData.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-24 w-24 items-center justify-center rounded-lg"
                          style={{ backgroundColor: team.color || "#3b82f6" }}
                        >
                          <Shield className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        {isUploadingLogo ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {teamData.logoUrl ? "Change Logo" : "Upload Logo"}
                          </>
                        )}
                      </Button>
                      {teamData.logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          disabled={isUploadingLogo}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground text-center">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>

                  {/* Team Name */}
                  <div>
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      value={teamData.name}
                      onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                      placeholder="Enter team name"
                    />
                  </div>

                  {/* Team Code (Read-only) */}
                  <div>
                    <Label>Team Code</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-foreground">{team.code}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(team.code);
                          toast.success("Code copied to clipboard!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      Team code cannot be changed
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelTeamEdit}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateTeam}
                      className="flex-1"
                      disabled={!teamData.name.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                    {teamData.logoUrl ? (
                      <img 
                        src={teamData.logoUrl} 
                        alt={teamData.name}
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
                      <div className="text-foreground">{team.name}</div>
                      <div className="text-muted-foreground">Team Code: {team.code}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Team Code</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-foreground">{team.code}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(team.code);
                          toast.success("Code copied to clipboard!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {isCoach 
                        ? "Share this code with new players and parents"
                        : "New members can use this code to join"
                      }
                    </p>
                  </div>

                  <div>
                    <Button variant="outline" onClick={onTeamChange} className="w-full" size="lg">
                      <Shield className="mr-2 h-4 w-4" />
                      {isCoach ? "Manage Different Team" : "Switch Team"}
                    </Button>
                    {isCoach && (
                      <p className="text-muted-foreground text-center mt-2">
                        Switch between your teams or create a new one
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
