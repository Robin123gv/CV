import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Link2, Github, Linkedin, Twitter, Instagram, Globe, Youtube, Mail } from "lucide-react";

const emptySocialLink = {
  platform: "",
  url: "",
  icon: ""
};

const platforms = [
  { value: "github", label: "GitHub", icon: Github },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "website", label: "Website", icon: Globe },
  { value: "email", label: "Email", icon: Mail },
  { value: "other", label: "Other", icon: Link2 },
];

const getIconForPlatform = (platform) => {
  const found = platforms.find(p => p.value === platform?.toLowerCase());
  return found ? found.icon : Link2;
};

export default function SocialLinksSection({ api, getAuthHeaders }) {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState(emptySocialLink);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const response = await axios.get(`${api}/social-links`);
      setSocialLinks(response.data);
    } catch (error) {
      console.error("Error fetching social links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.platform || !formData.url) {
      toast.error("Platform and URL are required");
      return;
    }

    setSaving(true);
    try {
      if (editingLink) {
        await axios.put(`${api}/admin/social-links/${editingLink.id}`, formData, getAuthHeaders());
        toast.success("Link updated");
      } else {
        await axios.post(`${api}/admin/social-links`, formData, getAuthHeaders());
        toast.success("Link added");
      }
      fetchSocialLinks();
      handleClose();
    } catch (error) {
      toast.error("Failed to save link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this link?")) return;
    try {
      await axios.delete(`${api}/admin/social-links/${id}`, getAuthHeaders());
      toast.success("Link deleted");
      fetchSocialLinks();
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData(link);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingLink(null);
    setFormData(emptySocialLink);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="social-links-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Social Links</h2>
          <p className="text-zinc-500">Your social media and other links</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptySocialLink)} data-testid="add-social-link-button">
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingLink ? "Edit Link" : "Add Social Link"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10" data-testid="social-platform-select">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-white/10">
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center gap-2">
                          <platform.icon className="w-4 h-4" />
                          {platform.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL *</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800 border-white/10"
                  data-testid="social-url-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-social-link-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingLink ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {socialLinks.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <Link2 className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No social links added yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {socialLinks.map((link) => {
            const Icon = getIconForPlatform(link.platform);
            return (
              <div 
                key={link.id} 
                className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all flex items-center gap-4"
                data-testid={`social-link-card-${link.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white capitalize">{link.platform}</p>
                  <p className="text-sm text-zinc-500 truncate">{link.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(link)} data-testid={`edit-social-link-${link.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-social-link-${link.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
