import { useState } from "react";
import { Contact, Deal } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, MoreVertical, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

type DealsProps = {
  deals: Deal[];
  contacts: Contact[];
  onAddDeal: (deal: Omit<Deal, "id" | "createdAt">) => void;
  onUpdateDeal: (id: string, deal: Partial<Deal>) => void;
  onDeleteDeal: (id: string) => void;
};

export function Deals({ deals, contacts, onAddDeal, onUpdateDeal, onDeleteDeal }: DealsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    contactName: "",
    value: 0,
    stage: "prospecting" as Deal["stage"],
    probability: 20,
    closeDate: "",
  });

  const stages: { id: Deal["stage"]; label: string; color: string }[] = [
    { id: "prospecting", label: "Prospecting", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    { id: "qualification", label: "Qualification", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { id: "proposal", label: "Proposal", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    { id: "closed-won", label: "Closed Won", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { id: "closed-lost", label: "Closed Lost", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  ];

  const getDealsByStage = (stageId: Deal["stage"]) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.contactId || !formData.value || !formData.closeDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedContact = contacts.find((c) => c.id === formData.contactId);
    if (!selectedContact) {
      toast.error("Please select a valid contact");
      return;
    }

    const dealData = {
      ...formData,
      contactName: selectedContact.name,
    };

    if (editingDeal) {
      onUpdateDeal(editingDeal.id, dealData);
      toast.success("Deal updated successfully");
      setEditingDeal(null);
    } else {
      onAddDeal(dealData);
      toast.success("Deal added successfully");
      setIsAddDialogOpen(false);
    }

    setFormData({
      title: "",
      contactId: "",
      contactName: "",
      value: 0,
      stage: "prospecting",
      probability: 20,
      closeDate: "",
    });
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      contactId: deal.contactId,
      contactName: deal.contactName,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      closeDate: deal.closeDate,
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDeleteDeal(id);
      toast.success("Deal deleted successfully");
    }
  };

  const handleStageChange = (dealId: string, newStage: Deal["stage"]) => {
    const probabilityMap = {
      prospecting: 20,
      qualification: 40,
      proposal: 60,
      negotiation: 80,
      "closed-won": 100,
      "closed-lost": 0,
    };

    onUpdateDeal(dealId, {
      stage: newStage,
      probability: probabilityMap[newStage],
    });
    toast.success("Deal stage updated");
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1>Deals Pipeline</h1>
          <p className="text-muted-foreground">Track your sales opportunities</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enterprise License Agreement"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact">Contact *</Label>
                  <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                    <SelectTrigger id="contact">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Deal Value ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="100000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={formData.stage} onValueChange={(value: Deal["stage"]) => setFormData({ ...formData, stage: value })}>
                    <SelectTrigger id="stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="closeDate">Expected Close Date *</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stages.slice(0, 4).map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <div key={stage.id} className="space-y-4">
              <div className="sticky top-0 bg-background pb-2">
                <h3 className="text-foreground">{stage.label}</h3>
                <p className="text-muted-foreground">
                  {stageDeals.length} deals • ${totalValue.toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-foreground">{deal.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(deal)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {stages.map((s) => (
                              <DropdownMenuItem
                                key={s.id}
                                onClick={() => handleStageChange(deal.id, s.id)}
                              >
                                Move to {s.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => handleDelete(deal.id, deal.title)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="text-muted-foreground">{deal.contactName}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">${deal.value.toLocaleString()}</span>
                        <Badge className={stage.color}>{deal.probability}%</Badge>
                      </div>
                      <div className="text-muted-foreground">
                        Close: {new Date(deal.closeDate).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editingDeal} onOpenChange={(open) => !open && setEditingDeal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-title">Deal Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-contact">Contact *</Label>
                <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                  <SelectTrigger id="edit-contact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} - {contact.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-value">Deal Value ($) *</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stage">Stage</Label>
                <Select value={formData.stage} onValueChange={(value: Deal["stage"]) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger id="edit-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-probability">Probability (%)</Label>
                <Input
                  id="edit-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-closeDate">Expected Close Date *</Label>
              <Input
                id="edit-closeDate"
                type="date"
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingDeal(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
