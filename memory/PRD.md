# Resume/CV Website with Admin Panel - PRD

## Original Problem Statement
Build a flexible resume website where the user can daily update their information through an admin panel. The website should showcase projects, experience, skills, and all resume sections. Only the admin can login and update information through the admin panel. Start with blank sections - admin fills in data when ready.

## User Choices
- **Authentication**: Password-only login (simple, single admin)
- **Sections to manage**: Photo, About Me, Experience, Projects, Skills, Education, Certifications, Languages, Social Links, Contact
- **Design**: Dark professional theme (like Emergent website)
- **Project showcase**: Cards with image, title, description, and links

## Architecture
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with Tailwind CSS + Shadcn/UI components
- **Auth**: Password-only with JWT tokens
- **Theme**: "The Obsidian Archive" - Dark academic tech aesthetic

## Core Requirements (Static)
1. Public resume page displays all sections beautifully
2. Admin login with password-only authentication
3. Admin dashboard with sidebar navigation
4. CRUD operations for all resume sections
5. Image upload for profile photo and project images
6. Responsive design for mobile and desktop

## What's Been Implemented (Jan 2026)
- [x] Full backend API with all CRUD endpoints
- [x] Password-only authentication with JWT
- [x] Profile management (photo, name, title, about)
- [x] Experience management with timeline display
- [x] Projects management with card display
- [x] Skills management with categorized groups
- [x] Education management
- [x] Certifications management
- [x] Languages management with proficiency levels
- [x] Social links management (GitHub, LinkedIn, Twitter, etc.)
- [x] Contact information management
- [x] Image upload (base64 storage)
- [x] Dark professional theme with Playfair Display font
- [x] Responsive admin dashboard with sidebar
- [x] Empty state handling for public resume

## User Personas
1. **Admin (You)**: Single user who manages all resume content
2. **Visitors**: Recruiters, employers, professional connections viewing the resume

## Next Action Items / Backlog
### P0 (Critical)
- None - Core functionality complete

### P1 (Important)
- [ ] Change default admin password after first login
- [ ] Add resume download as PDF feature
- [ ] Add SEO meta tags for better visibility

### P2 (Nice to Have)
- [ ] Add analytics to track visitor count
- [ ] Add dark/light theme toggle for public view
- [ ] Add custom domain support
- [ ] Add resume templates/layouts to choose from

## Login Credentials
- **Admin URL**: `/admin`
- **Default Password**: `admin123` (CHANGE THIS!)
