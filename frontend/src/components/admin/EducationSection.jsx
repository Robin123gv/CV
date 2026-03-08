import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";

const emptyEducation = {
  institution: "",
  degree: "",
  field: "",
  start_year: "",
  end_year: "",
  description: ""
};

export default function EducationSection({ api, getAuthHeaders }) {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [formData, setFormData] = useState(emptyEducation);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const response = await axios.get(`${api}/education`);
      setEducation(response.data);
    } catch (error) {
      console.error("Error fetching education:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.institution || !formData.degree || !formData.field) {
      toast.error("Institution, Degree, and Field are required");
      return;
    }

    setSaving(true);
    try {
      if (editingEdu) {
        await axios.put(`${api}/admin/education/${editingEdu.id}`, formData, getAuthHeaders());
        toast.success("Education updated");
      } else {
        await axios.post(`${api}/admin/education`, formData, getAuthHeaders());
        toast.success("Education added");
      }
      fetchEducation();
      handleClose();
    } catch (error) {
      toast.error("Failed to save education");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this education?")) return;
    try {
      await axios.delete(`${api}/admin/education/${id}`, getAuthHeaders());
      toast.success("Education deleted");
      fetchEducation();
    } catch (error) {
      toast.error("Failed to delete education");
    }
  };

  const handleEdit = (edu) => {
    setEditingEdu(edu);
    setFormData(edu);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingEdu(null);
    setFormData(emptyEducation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="education-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Education</h2>
          <p className="text-zinc-500">Your academic background</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyEducation)} data-testid="add-education-button">
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingEdu ? "Edit Education" : "Add Education"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Input
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="MIT, Stanford, etc."
                  className="bg-zinc-800 border-white/10"
                  data-testid="education-institution-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="Bachelor's, Master's, etc."
                    className="bg-zinc-800 border-white/10"
                    data-testid="education-degree-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study *</Label>
                  <Input
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    placeholder="Computer Science"
                    className="bg-zinc-800 border-white/10"
                    data-testid="education-field-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Year</Label>
                  <Input
                    value={formData.start_year}
                    onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                    placeholder="2018"
                    className="bg-zinc-800 border-white/10"
                    data-testid="education-start-year-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Year</Label>
                  <Input
                    value={formData.end_year}
                    onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                    placeholder="2022"
                    className="bg-zinc-800 border-white/10"
                    data-testid="education-end-year-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any notable achievements or activities..."
                  rows={3}
                  className="bg-zinc-800 border-white/10 resize-none"
                  data-testid="education-description-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-education-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingEdu ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {education.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No education added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div 
              key={edu.id} 
              className="p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`education-card-${edu.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{edu.degree} in {edu.field}</h3>
                  <p className="text-blue-400">{edu.institution}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {edu.start_year} - {edu.end_year || "Present"}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-zinc-400 mt-3">{edu.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(edu)} data-testid={`edit-education-${edu.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-education-${edu.id}`}>
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
