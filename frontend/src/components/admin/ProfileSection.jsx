import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { User, Upload, Save, Loader2 } from "lucide-react";

export default function ProfileSection({ api, getAuthHeaders }) {
  const [profile, setProfile] = useState({
    photo_url: "",
    name: "",
    title: "",
    about: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${api}/profile`);
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${api}/admin/profile`, profile, getAuthHeaders());
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${api}/admin/upload-image`, formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });
      setProfile({ ...profile, photo_url: response.data.url });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="profile-section">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
        <p className="text-zinc-500">Your basic information and photo</p>
      </div>

      <div className="space-y-8">
        {/* Photo Upload */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
            {profile.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
                data-testid="profile-preview"
              />
            ) : (
              <User className="w-12 h-12 text-zinc-600" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              data-testid="photo-input"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mb-2"
              data-testid="upload-photo-button"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Photo
            </Button>
            <p className="text-xs text-zinc-500">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="John Doe"
            className="bg-zinc-900/50 border-white/10 focus:border-white/30"
            data-testid="name-input"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            value={profile.title || ""}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            placeholder="Full Stack Developer"
            className="bg-zinc-900/50 border-white/10 focus:border-white/30"
            data-testid="title-input"
          />
        </div>

        {/* About */}
        <div className="space-y-2">
          <Label htmlFor="about">About Me</Label>
          <Textarea
            id="about"
            value={profile.about || ""}
            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
            placeholder="Write a brief introduction about yourself..."
            rows={6}
            className="bg-zinc-900/50 border-white/10 focus:border-white/30 resize-none"
            data-testid="about-input"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200"
            data-testid="save-profile-button"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
