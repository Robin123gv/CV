import { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, Briefcase, FolderOpen, Code2, GraduationCap, 
  Award, Globe, Link2, Mail, Phone, MapPin, 
  ExternalLink, Github, Linkedin, Twitter, Instagram
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getSocialIcon = (platform) => {
  const icons = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    instagram: Instagram,
  };
  return icons[platform?.toLowerCase()] || Link2;
};

export default function ResumePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await axios.get(`${API}/resume`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const { profile, experiences, projects, skills, education, certifications, languages, social_links, contact } = data || {};
  const hasContent = profile?.name || experiences?.length || projects?.length;

  if (!hasContent) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6" data-testid="empty-resume">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-zinc-900 flex items-center justify-center">
            <User className="w-10 h-10 text-zinc-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-4">Resume Coming Soon</h1>
          <p className="text-zinc-500 mb-8">This resume is being set up. Check back later for updates.</p>
          <a 
            href="/admin" 
            className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
            data-testid="admin-link"
          >
            Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="resume-page">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center p-6 md:p-12 lg:p-24" data-testid="hero-section">
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <div className="order-2 md:order-1 flex justify-center md:justify-start animate-fade-in-up">
              <div className="photo-container w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border border-white/10">
                {profile?.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt={profile?.name || "Profile"} 
                    className="w-full h-full object-cover"
                    data-testid="profile-photo"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <User className="w-24 h-24 text-zinc-700" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Info */}
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500 mb-4 animate-fade-in-up">
                Portfolio
              </p>
              <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-[0.9] mb-6 animate-fade-in-up animation-delay-100" data-testid="profile-name">
                {profile?.name || "Your Name"}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 mb-6 animate-fade-in-up animation-delay-200" data-testid="profile-title">
                {profile?.title || "Your Title"}
              </p>
              {social_links?.length > 0 && (
                <div className="flex gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-300">
                  {social_links.map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                        data-testid={`social-link-${link.platform}`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {profile?.about && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24" data-testid="about-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">About Me</h2>
            </div>
            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed" data-testid="about-text">
              {profile.about}
            </p>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experiences?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-zinc-950/50" data-testid="experience-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Experience</h2>
            </div>
            <div className="timeline space-y-12">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-8" data-testid={`experience-item-${exp.id}`}>
                  <div className="timeline-dot"></div>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{exp.position}</h3>
                      <p className="text-blue-400">{exp.company}</p>
                    </div>
                    <p className="font-mono text-sm text-zinc-500">
                      {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    </p>
                  </div>
                  {exp.location && (
                    <p className="text-sm text-zinc-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" /> {exp.location}
                    </p>
                  )}
                  <p className="text-zinc-400 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24" data-testid="projects-section">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Projects</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="project-card group rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all hover-lift"
                  data-testid={`project-card-${project.id}`}
                >
                  <div className="aspect-video relative">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-zinc-700" />
                      </div>
                    )}
                    <div className="overlay"></div>
                    <div className="content">
                      <div className="flex gap-3">
                        {project.live_url && (
                          <a 
                            href={project.live_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors"
                          >
                            Live Demo
                          </a>
                        )}
                        {project.github_url && (
                          <a 
                            href={project.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors flex items-center gap-2"
                          >
                            <Github className="w-4 h-4" /> Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{project.description}</p>
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-zinc-950/50" data-testid="skills-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <Code2 className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Skills</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skillGroup) => (
                <div key={skillGroup.id} data-testid={`skill-group-${skillGroup.id}`}>
                  <h3 className="text-lg font-semibold text-white mb-4">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24" data-testid="education-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Education</h2>
            </div>
            <div className="space-y-8">
              {education.map((edu) => (
                <div key={edu.id} className="p-6 rounded-xl bg-zinc-900/30 border border-white/5" data-testid={`education-item-${edu.id}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{edu.degree} in {edu.field}</h3>
                      <p className="text-blue-400">{edu.institution}</p>
                    </div>
                    <p className="font-mono text-sm text-zinc-500">
                      {edu.start_year} - {edu.end_year || "Present"}
                    </p>
                  </div>
                  {edu.description && <p className="text-zinc-400 mt-3">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-zinc-950/50" data-testid="certifications-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <Award className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Certifications</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-5 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all" data-testid={`certification-item-${cert.id}`}>
                  <h3 className="font-semibold text-white mb-1">{cert.name}</h3>
                  <p className="text-sm text-zinc-400 mb-2">{cert.issuer}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-zinc-500">{cert.date}</p>
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Languages Section */}
      {languages?.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24" data-testid="languages-section">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <Globe className="w-5 h-5 text-blue-500" />
              <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {languages.map((lang) => (
                <div key={lang.id} className="px-5 py-3 rounded-full bg-zinc-900/50 border border-white/5" data-testid={`language-item-${lang.id}`}>
                  <span className="text-white font-medium">{lang.name}</span>
                  <span className="text-zinc-500 ml-2">({lang.proficiency})</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Footer */}
      <footer className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-zinc-950 border-t border-white/5 relative" data-testid="contact-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8">Get In Touch</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors" data-testid="contact-email">
                <Mail className="w-5 h-5" /> {contact.email}
              </a>
            )}
            {contact?.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors" data-testid="contact-phone">
                <Phone className="w-5 h-5" /> {contact.phone}
              </a>
            )}
            {contact?.location && (
              <span className="flex items-center gap-2 text-zinc-400" data-testid="contact-location">
                <MapPin className="w-5 h-5" /> {contact.location}
              </span>
            )}
          </div>
        </div>
        {/* Small admin link in bottom right corner */}
        <a 
          href="/admin" 
          className="absolute bottom-4 right-4 text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors"
          data-testid="footer-admin-link"
        >
          Admin
        </a>
      </footer>
    </div>
  );
}
