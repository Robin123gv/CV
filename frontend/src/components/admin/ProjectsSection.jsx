import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Upload, X } from "lucide-react";

const emptyProject = {
  title: "",
  description: "",
  image_url: "",
  live_url: "",
  github_url: "",
  tech_stack: []
};

export default function ProjectsSection({ api, getAuthHeaders }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${api}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await axios.post(`${api}/admin/upload-image`, formDataUpload, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" }
      });
      setFormData({ ...formData, image_url: response.data.url });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingProject) {
        await axios.put(`${api}/admin/projects/${editingProject.id}`, formData, getAuthHeaders());
        toast.success("Project updated");
      } else {
        await axios.post(`${api}/admin/projects`, formData, getAuthHeaders());
        toast.success("Project added");
      }
      fetchProjects();
      handleClose();
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`${api}/admin/projects/${id}`, getAuthHeaders());
      toast.success("Project deleted");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData(project);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormData(emptyProject);
    setTechInput("");
  };

  const addTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, techInput.trim()] });
      setTechInput("");
    }
  };

  const removeTech = (tech) => {
    setFormData({ ...formData, tech_stack: formData.tech_stack.filter(t => t !== tech) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="projects-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Projects</h2>
          <p className="text-zinc-500">Showcase your work</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyProject)} data-testid="add-project-button">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProject ? "Edit Project" : "Add Project"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Project Image</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative w-24 h-16 rounded overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded bg-zinc-800 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Upload
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Awesome Project"
                  className="bg-zinc-800 border-white/10"
                  data-testid="project-title-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this project do?"
                  rows={3}
                  className="bg-zinc-800 border-white/10 resize-none"
                  data-testid="project-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-zinc-800 border-white/10"
                    data-testid="project-live-url-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="bg-zinc-800 border-white/10"
                    data-testid="project-github-url-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="React, Node.js, etc."
                    className="bg-zinc-800 border-white/10"
                    data-testid="project-tech-input"
                  />
                  <Button type="button" variant="outline" onClick={addTech}>Add</Button>
                </div>
                {formData.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tech_stack.map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-zinc-800 rounded text-sm text-zinc-300 flex items-center gap-1">
                        {tech}
                        <button onClick={() => removeTech(tech)} className="hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-project-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProject ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No projects added yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="rounded-xl overflow-hidden bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`project-card-${project.id}`}
            >
              <div className="aspect-video bg-zinc-800">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} data-testid={`edit-project-${project.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-project-${project.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tech_stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{tech}</span>
                    ))}
                    {project.tech_stack.length > 4 && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">+{project.tech_stack.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
