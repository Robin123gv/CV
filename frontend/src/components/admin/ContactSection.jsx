import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Save, Loader2, Mail, Phone, MapPin } from "lucide-react";

export default function ContactSection({ api, getAuthHeaders }) {
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    location: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await axios.get(`${api}/contact`);
      setContact(response.data);
    } catch (error) {
      console.error("Error fetching contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${api}/admin/contact`, contact, getAuthHeaders());
      toast.success("Contact info updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update contact info");
    } finally {
      setSaving(false);
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
    <div data-testid="contact-section">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
        <p className="text-zinc-500">How people can reach you</p>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-500" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={contact.email || ""}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="you@example.com"
            className="bg-zinc-900/50 border-white/10 focus:border-white/30"
            data-testid="contact-email-input"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-zinc-500" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contact.phone || ""}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="bg-zinc-900/50 border-white/10 focus:border-white/30"
            data-testid="contact-phone-input"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-500" />
            Location
          </Label>
          <Input
            id="location"
            value={contact.location || ""}
            onChange={(e) => setContact({ ...contact, location: e.target.value })}
            placeholder="San Francisco, CA"
            className="bg-zinc-900/50 border-white/10 focus:border-white/30"
            data-testid="contact-location-input"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200"
            data-testid="save-contact-button"
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
