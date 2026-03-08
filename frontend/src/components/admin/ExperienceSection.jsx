import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react";

const emptyExperience = {
  company: "",
  position: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  location: ""
};

export default function ExperienceSection({ api, getAuthHeaders }) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [formData, setFormData] = useState(emptyExperience);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`${api}/experience`);
      setExperiences(response.data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company || !formData.position) {
      toast.error("Company and Position are required");
      return;
    }

    setSaving(true);
    try {
      if (editingExp) {
        await axios.put(`${api}/admin/experience/${editingExp.id}`, formData, getAuthHeaders());
        toast.success("Experience updated");
      } else {
        await axios.post(`${api}/admin/experience`, formData, getAuthHeaders());
        toast.success("Experience added");
      }
      fetchExperiences();
      handleClose();
    } catch (error) {
      toast.error("Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await axios.delete(`${api}/admin/experience/${id}`, getAuthHeaders());
      toast.success("Experience deleted");
      fetchExperiences();
    } catch (error) {
      toast.error("Failed to delete experience");
    }
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setFormData(exp);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingExp(null);
    setFormData(emptyExperience);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="experience-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Experience</h2>
          <p className="text-zinc-500">Your work history</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyExperience)} data-testid="add-experience-button">
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingExp ? "Edit Experience" : "Add Experience"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Google"
                    className="bg-zinc-800 border-white/10"
                    data-testid="experience-company-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Software Engineer"
                    className="bg-zinc-800 border-white/10"
                    data-testid="experience-position-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="bg-zinc-800 border-white/10"
                  data-testid="experience-location-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    placeholder="Jan 2020"
                    className="bg-zinc-800 border-white/10"
                    data-testid="experience-start-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    placeholder="Dec 2023"
                    disabled={formData.is_current}
                    className="bg-zinc-800 border-white/10"
                    data-testid="experience-end-date-input"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_current"
                  checked={formData.is_current}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked, end_date: checked ? "" : formData.end_date })}
                  data-testid="experience-current-checkbox"
                />
                <Label htmlFor="is_current" className="cursor-pointer">I currently work here</Label>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your role and responsibilities..."
                  rows={4}
                  className="bg-zinc-800 border-white/10 resize-none"
                  data-testid="experience-description-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-experience-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingExp ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {experiences.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No experience added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div 
              key={exp.id} 
              className="p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`experience-card-${exp.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{exp.position}</h3>
                  <p className="text-blue-400">{exp.company}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)} data-testid={`edit-experience-${exp.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-experience-${exp.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
