import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Globe } from "lucide-react";

const emptyLanguage = {
  name: "",
  proficiency: ""
};

const proficiencyLevels = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Beginner"
];

export default function LanguagesSection({ api, getAuthHeaders }) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLang, setEditingLang] = useState(null);
  const [formData, setFormData] = useState(emptyLanguage);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${api}/languages`);
      setLanguages(response.data);
    } catch (error) {
      console.error("Error fetching languages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.proficiency) {
      toast.error("Language name and proficiency are required");
      return;
    }

    setSaving(true);
    try {
      if (editingLang) {
        await axios.put(`${api}/admin/languages/${editingLang.id}`, formData, getAuthHeaders());
        toast.success("Language updated");
      } else {
        await axios.post(`${api}/admin/languages`, formData, getAuthHeaders());
        toast.success("Language added");
      }
      fetchLanguages();
      handleClose();
    } catch (error) {
      toast.error("Failed to save language");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this language?")) return;
    try {
      await axios.delete(`${api}/admin/languages/${id}`, getAuthHeaders());
      toast.success("Language deleted");
      fetchLanguages();
    } catch (error) {
      toast.error("Failed to delete language");
    }
  };

  const handleEdit = (lang) => {
    setEditingLang(lang);
    setFormData(lang);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingLang(null);
    setFormData(emptyLanguage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="languages-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Languages</h2>
          <p className="text-zinc-500">Languages you speak</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyLanguage)} data-testid="add-language-button">
              <Plus className="w-4 h-4 mr-2" /> Add Language
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingLang ? "Edit Language" : "Add Language"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Language *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="English, Spanish, etc."
                  className="bg-zinc-800 border-white/10"
                  data-testid="language-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency *</Label>
                <Select
                  value={formData.proficiency}
                  onValueChange={(value) => setFormData({ ...formData, proficiency: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-white/10" data-testid="language-proficiency-select">
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-white/10">
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-language-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingLang ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {languages.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <Globe className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No languages added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {languages.map((lang) => (
            <div 
              key={lang.id} 
              className="group px-5 py-3 rounded-full bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all flex items-center gap-3"
              data-testid={`language-card-${lang.id}`}
            >
              <div>
                <span className="text-white font-medium">{lang.name}</span>
                <span className="text-zinc-500 ml-2">({lang.proficiency})</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(lang)} data-testid={`edit-language-${lang.id}`}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => handleDelete(lang.id)} data-testid={`delete-language-${lang.id}`}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
