import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Award, ExternalLink } from "lucide-react";

const emptyCertification = {
  name: "",
  issuer: "",
  date: "",
  credential_url: ""
};

export default function CertificationsSection({ api, getAuthHeaders }) {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [formData, setFormData] = useState(emptyCertification);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${api}/certifications`);
      setCertifications(response.data);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.issuer) {
      toast.error("Name and Issuer are required");
      return;
    }

    setSaving(true);
    try {
      if (editingCert) {
        await axios.put(`${api}/admin/certifications/${editingCert.id}`, formData, getAuthHeaders());
        toast.success("Certification updated");
      } else {
        await axios.post(`${api}/admin/certifications`, formData, getAuthHeaders());
        toast.success("Certification added");
      }
      fetchCertifications();
      handleClose();
    } catch (error) {
      toast.error("Failed to save certification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this certification?")) return;
    try {
      await axios.delete(`${api}/admin/certifications/${id}`, getAuthHeaders());
      toast.success("Certification deleted");
      fetchCertifications();
    } catch (error) {
      toast.error("Failed to delete certification");
    }
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setFormData(cert);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCert(null);
    setFormData(emptyCertification);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="certifications-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Certifications</h2>
          <p className="text-zinc-500">Your professional certifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(emptyCertification)} data-testid="add-certification-button">
              <Plus className="w-4 h-4 mr-2" /> Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCert ? "Edit Certification" : "Add Certification"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="AWS Solutions Architect"
                  className="bg-zinc-800 border-white/10"
                  data-testid="certification-name-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issuer *</Label>
                  <Input
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="Amazon Web Services"
                    className="bg-zinc-800 border-white/10"
                    data-testid="certification-issuer-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Jan 2024"
                    className="bg-zinc-800 border-white/10"
                    data-testid="certification-date-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input
                  value={formData.credential_url}
                  onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800 border-white/10"
                  data-testid="certification-url-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} data-testid="save-certification-button">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCert ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {certifications.length === 0 ? (
        <div className="empty-state py-12 rounded-xl bg-zinc-900/20 border border-white/5">
          <Award className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No certifications added yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className="p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all"
              data-testid={`certification-card-${cert.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{cert.name}</h3>
                  <p className="text-sm text-zinc-400">{cert.issuer}</p>
                  <p className="text-xs text-zinc-500 mt-2">{cert.date}</p>
                  {cert.credential_url && (
                    <a 
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300"
                    >
                      View Credential <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cert)} data-testid={`edit-certification-${cert.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)} className="text-red-400 hover:text-red-300" data-testid={`delete-certification-${cert.id}`}>
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
