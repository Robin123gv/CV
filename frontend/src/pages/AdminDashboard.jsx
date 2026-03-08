import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  User, Briefcase, FolderOpen, Code2, GraduationCap, 
  Award, Globe, Link2, Mail, LogOut, Menu, X, Eye
} from "lucide-react";

// Sections
import ProfileSection from "../components/admin/ProfileSection";
import ExperienceSection from "../components/admin/ExperienceSection";
import ProjectsSection from "../components/admin/ProjectsSection";
import SkillsSection from "../components/admin/SkillsSection";
import EducationSection from "../components/admin/EducationSection";
import CertificationsSection from "../components/admin/CertificationsSection";
import LanguagesSection from "../components/admin/LanguagesSection";
import SocialLinksSection from "../components/admin/SocialLinksSection";
import ContactSection from "../components/admin/ContactSection";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const navItems = [
  { path: "", icon: User, label: "Profile", end: true },
  { path: "experience", icon: Briefcase, label: "Experience" },
  { path: "projects", icon: FolderOpen, label: "Projects" },
  { path: "skills", icon: Code2, label: "Skills" },
  { path: "education", icon: GraduationCap, label: "Education" },
  { path: "certifications", icon: Award, label: "Certifications" },
  { path: "languages", icon: Globe, label: "Languages" },
  { path: "social-links", icon: Link2, label: "Social Links" },
  { path: "contact", icon: Mail, label: "Contact" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    toast.success("Logged out successfully");
    navigate("/admin");
  };

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
  });

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="admin-dashboard">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center text-white"
        data-testid="mobile-menu-button"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar fixed md:static inset-y-0 left-0 z-40 w-64 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200`}
        data-testid="admin-sidebar"
      >
        <div className="h-full flex flex-col p-4">
          {/* Header */}
          <div className="mb-8 pt-8 md:pt-0">
            <h1 className="font-heading text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-1">Manage your resume</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "active" : ""}`
                }
                data-testid={`nav-${item.path || "profile"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-item"
              data-testid="view-resume-link"
            >
              <Eye className="w-4 h-4" />
              View Resume
            </a>
            <button
              onClick={handleLogout}
              className="admin-nav-item w-full text-left text-red-400 hover:text-red-300"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-auto" data-testid="admin-main-content">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route index element={<ProfileSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="experience" element={<ExperienceSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="projects" element={<ProjectsSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="skills" element={<SkillsSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="education" element={<EducationSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="certifications" element={<CertificationsSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="languages" element={<LanguagesSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="social-links" element={<SocialLinksSection api={API} getAuthHeaders={getAuthHeaders} />} />
            <Route path="contact" element={<ContactSection api={API} getAuthHeaders={getAuthHeaders} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
