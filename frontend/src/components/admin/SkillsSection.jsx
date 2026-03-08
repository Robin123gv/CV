import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Code2, X } from "lucide-react";

const emptySkill = {
  category: "",
  skills: []
};

export default function SkillsSection({ api, getAuthHeaders }) {
  const [skillGroups, setSkillGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState(emptySkill);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${api}/skills`);
      setSkillGroups(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    setSaving(true);
    try {
      if (editingSkill) {
        await axios.put(`${api}/admin/skills/${editingSkill.id}`, formData, getAuthHeaders());
        toast.success("Skills updated");
      } else {
        await axios.post(`${api}/admin/skills`, formData, getAuthHeaders());
        toast.success("Skills added");
      }
      fetchSkills();
      handleClose();
    } catch (error) {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill group?")) return;
    try {
      await axios.delete(`${api}/admin/skills/${id}`, getAuthHeaders());
      toast.success("Skills deleted");
      fetchSkills();
    } catch (error) {
      toast.error("Failed to delete skills");
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData(skill);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingSkill(null);
    setFormData(emptySkill);
    setSkillInput("");
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="skills-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Skills</h2>
          <p className="text-zinc-500">Your technical and soft skills</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptySkill)} data-testid="add-skill-button">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingSkill ? "Edit Skills" : "Add Skill Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category Name *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Frontend, Backend, DevOps, etc."
                  className="bg-zinc-800 border-white/10"
                  data-testid="skill-category-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="React, Python, etc."
                    className="bg-zinc-800 border-white/10"
                    data-testid="skill-input"
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-400 flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-blue-300">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-skill-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSkill ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {skillGroups.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <Code2 className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No skills added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skillGroups.map((group) => (
            <div 
              key={group.id} 
              className="p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`skill-card-${group.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-semibold text-white">{group.category}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(group)} data-testid={`edit-skill-${group.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-skill-${group.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
