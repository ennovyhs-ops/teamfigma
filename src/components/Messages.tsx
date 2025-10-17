import { useState } from "react";
import { Message, User, UserRole, TeamMember } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Search, Plus, Reply } from "lucide-react";
import { messageAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

type MessagesProps = {
  teamId: string;
  user: User;
  messages: Message[];
  members: TeamMember[];
  onRefresh: () => void;
};

export function Messages({ teamId, user, messages, members, onRefresh }: MessagesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    recipientType: "everyone" as string,
    recipientIds: [] as string[],
    forwardToParent: false,
  });

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecipientOptions = () => {
    const options: { value: string; label: string }[] = [
      { value: "everyone", label: "Everyone" },
    ];

    if (user.role === "coach") {
      options.push(
        { value: "players", label: "All Players" },
        { value: "parents", label: "All Parents" },
        { value: "coaches", label: "All Coaches" },
        { value: "individual", label: "Specific Person" }
      );
    } else if (user.role === "player") {
      options.push({ value: "coaches", label: "Coaches Only" });
    } else if (user.role === "parent") {
      options.push(
        { value: "coaches", label: "Coaches Only" },
        { value: "parents", label: "Other Parents" }
      );
    }

    return options;
  };

  const handleSendMessage = async () => {
    if (!formData.subject.trim() || !formData.body.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    try {
      await messageAPI.send({
        teamId,
        ...formData,
        replyToId: selectedMessage?.id,
      });

      toast.success("Message sent!");
      setIsComposeOpen(false);
      setSelectedMessage(null);
      setFormData({
        subject: "",
        body: "",
        recipientType: "everyone",
        recipientIds: [],
        forwardToParent: false,
      });
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setFormData({
      ...formData,
      subject: `Re: ${message.subject}`,
      recipientType: "individual",
      recipientIds: [message.senderId],
    });
    setIsComposeOpen(true);
  };

  return (
    <div className="space-y-4 p-4 pb-20 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Messages</h1>
          <p className="text-muted-foreground">Team communications</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMessage ? "Reply" : "New Message"}</DialogTitle>
              <DialogDescription>Send a message to your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="recipients">Send To *</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) => setFormData({ ...formData, recipientType: value })}
                >
                  <SelectTrigger id="recipients">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getRecipientOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {user.role === "coach" && formData.recipientType === "players" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forwardToParent"
                    checked={formData.forwardToParent}
                    onChange={(e) => setFormData({ ...formData, forwardToParent: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="forwardToParent">Also send to parents</Label>
                </div>
              )}

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Type your message here..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsComposeOpen(false);
                    setSelectedMessage(null);
                    setFormData({
                      subject: "",
                      body: "",
                      recipientType: "everyone",
                      recipientIds: [],
                      forwardToParent: false,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>Send Message</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No messages yet
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className="cursor-pointer transition-colors hover:bg-accent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground">{message.subject}</h3>
                      <Badge variant="outline">{message.senderRole}</Badge>
                      {message.replyToId && (
                        <Badge variant="secondary">Reply</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                      From: {message.senderName}
                    </p>
                    <p className="text-foreground mt-2">{message.body}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <Badge variant="outline">
                        To: {message.recipientType}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
