from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import hashlib
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'resume-admin-secret-key-2024')
ALGORITHM = "HS256"

# Admin password (hashed)
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH', hashlib.sha256('admin123'.encode()).hexdigest())

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ===================== MODELS =====================

class ProfileModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    photo_url: Optional[str] = None
    name: Optional[str] = None
    title: Optional[str] = None
    about: Optional[str] = None

class ExperienceModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    description: str
    location: Optional[str] = None

class ProjectModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    tech_stack: List[str] = []

class SkillModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    skills: List[str] = []

class EducationModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    institution: str
    degree: str
    field: str
    start_year: str
    end_year: Optional[str] = None
    description: Optional[str] = None

class CertificationModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    issuer: str
    date: str
    credential_url: Optional[str] = None

class LanguageModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    proficiency: str

class SocialLinkModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    url: str
    icon: Optional[str] = None

class ContactModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str

# ===================== AUTH =====================

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(request: LoginRequest):
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if password_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = jwt.encode(
        {"admin": True, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return LoginResponse(token=token, message="Login successful")

@api_router.post("/admin/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    _: dict = Depends(verify_token)
):
    global ADMIN_PASSWORD_HASH
    if hashlib.sha256(old_password.encode()).hexdigest() != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid current password")
    
    ADMIN_PASSWORD_HASH = hashlib.sha256(new_password.encode()).hexdigest()
    return {"message": "Password changed successfully"}

# ===================== PROFILE =====================

@api_router.get("/profile", response_model=ProfileModel)
async def get_profile():
    profile = await db.profile.find_one({}, {"_id": 0})
    if not profile:
        return ProfileModel()
    return ProfileModel(**profile)

@api_router.put("/admin/profile", response_model=ProfileModel)
async def update_profile(profile: ProfileModel, _: dict = Depends(verify_token)):
    await db.profile.update_one({}, {"$set": profile.model_dump()}, upsert=True)
    return profile

# ===================== EXPERIENCE =====================

@api_router.get("/experience", response_model=List[ExperienceModel])
async def get_experiences():
    experiences = await db.experience.find({}, {"_id": 0}).to_list(100)
    return [ExperienceModel(**exp) for exp in experiences]

@api_router.post("/admin/experience", response_model=ExperienceModel)
async def create_experience(exp: ExperienceModel, _: dict = Depends(verify_token)):
    doc = exp.model_dump()
    await db.experience.insert_one(doc)
    return exp

@api_router.put("/admin/experience/{exp_id}", response_model=ExperienceModel)
async def update_experience(exp_id: str, exp: ExperienceModel, _: dict = Depends(verify_token)):
    exp.id = exp_id
    await db.experience.update_one({"id": exp_id}, {"$set": exp.model_dump()})
    return exp

@api_router.delete("/admin/experience/{exp_id}")
async def delete_experience(exp_id: str, _: dict = Depends(verify_token)):
    await db.experience.delete_one({"id": exp_id})
    return {"message": "Deleted"}

# ===================== PROJECTS =====================

@api_router.get("/projects", response_model=List[ProjectModel])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return [ProjectModel(**p) for p in projects]

@api_router.post("/admin/projects", response_model=ProjectModel)
async def create_project(project: ProjectModel, _: dict = Depends(verify_token)):
    doc = project.model_dump()
    await db.projects.insert_one(doc)
    return project

@api_router.put("/admin/projects/{project_id}", response_model=ProjectModel)
async def update_project(project_id: str, project: ProjectModel, _: dict = Depends(verify_token)):
    project.id = project_id
    await db.projects.update_one({"id": project_id}, {"$set": project.model_dump()})
    return project

@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, _: dict = Depends(verify_token)):
    await db.projects.delete_one({"id": project_id})
    return {"message": "Deleted"}

# ===================== SKILLS =====================

@api_router.get("/skills", response_model=List[SkillModel])
async def get_skills():
    skills = await db.skills.find({}, {"_id": 0}).to_list(100)
    return [SkillModel(**s) for s in skills]

@api_router.post("/admin/skills", response_model=SkillModel)
async def create_skill(skill: SkillModel, _: dict = Depends(verify_token)):
    doc = skill.model_dump()
    await db.skills.insert_one(doc)
    return skill

@api_router.put("/admin/skills/{skill_id}", response_model=SkillModel)
async def update_skill(skill_id: str, skill: SkillModel, _: dict = Depends(verify_token)):
    skill.id = skill_id
    await db.skills.update_one({"id": skill_id}, {"$set": skill.model_dump()})
    return skill

@api_router.delete("/admin/skills/{skill_id}")
async def delete_skill(skill_id: str, _: dict = Depends(verify_token)):
    await db.skills.delete_one({"id": skill_id})
    return {"message": "Deleted"}

# ===================== EDUCATION =====================

@api_router.get("/education", response_model=List[EducationModel])
async def get_education():
    education = await db.education.find({}, {"_id": 0}).to_list(100)
    return [EducationModel(**e) for e in education]

@api_router.post("/admin/education", response_model=EducationModel)
async def create_education(edu: EducationModel, _: dict = Depends(verify_token)):
    doc = edu.model_dump()
    await db.education.insert_one(doc)
    return edu

@api_router.put("/admin/education/{edu_id}", response_model=EducationModel)
async def update_education(edu_id: str, edu: EducationModel, _: dict = Depends(verify_token)):
    edu.id = edu_id
    await db.education.update_one({"id": edu_id}, {"$set": edu.model_dump()})
    return edu

@api_router.delete("/admin/education/{edu_id}")
async def delete_education(edu_id: str, _: dict = Depends(verify_token)):
    await db.education.delete_one({"id": edu_id})
    return {"message": "Deleted"}

# ===================== CERTIFICATIONS =====================

@api_router.get("/certifications", response_model=List[CertificationModel])
async def get_certifications():
    certs = await db.certifications.find({}, {"_id": 0}).to_list(100)
    return [CertificationModel(**c) for c in certs]

@api_router.post("/admin/certifications", response_model=CertificationModel)
async def create_certification(cert: CertificationModel, _: dict = Depends(verify_token)):
    doc = cert.model_dump()
    await db.certifications.insert_one(doc)
    return cert

@api_router.put("/admin/certifications/{cert_id}", response_model=CertificationModel)
async def update_certification(cert_id: str, cert: CertificationModel, _: dict = Depends(verify_token)):
    cert.id = cert_id
    await db.certifications.update_one({"id": cert_id}, {"$set": cert.model_dump()})
    return cert

@api_router.delete("/admin/certifications/{cert_id}")
async def delete_certification(cert_id: str, _: dict = Depends(verify_token)):
    await db.certifications.delete_one({"id": cert_id})
    return {"message": "Deleted"}

# ===================== LANGUAGES =====================

@api_router.get("/languages", response_model=List[LanguageModel])
async def get_languages():
    langs = await db.languages.find({}, {"_id": 0}).to_list(100)
    return [LanguageModel(**lang) for lang in langs]

@api_router.post("/admin/languages", response_model=LanguageModel)
async def create_language(lang: LanguageModel, _: dict = Depends(verify_token)):
    doc = lang.model_dump()
    await db.languages.insert_one(doc)
    return lang

@api_router.put("/admin/languages/{lang_id}", response_model=LanguageModel)
async def update_language(lang_id: str, lang: LanguageModel, _: dict = Depends(verify_token)):
    lang.id = lang_id
    await db.languages.update_one({"id": lang_id}, {"$set": lang.model_dump()})
    return lang

@api_router.delete("/admin/languages/{lang_id}")
async def delete_language(lang_id: str, _: dict = Depends(verify_token)):
    await db.languages.delete_one({"id": lang_id})
    return {"message": "Deleted"}

# ===================== SOCIAL LINKS =====================

@api_router.get("/social-links", response_model=List[SocialLinkModel])
async def get_social_links():
    links = await db.social_links.find({}, {"_id": 0}).to_list(100)
    return [SocialLinkModel(**link) for link in links]

@api_router.post("/admin/social-links", response_model=SocialLinkModel)
async def create_social_link(link: SocialLinkModel, _: dict = Depends(verify_token)):
    doc = link.model_dump()
    await db.social_links.insert_one(doc)
    return link

@api_router.put("/admin/social-links/{link_id}", response_model=SocialLinkModel)
async def update_social_link(link_id: str, link: SocialLinkModel, _: dict = Depends(verify_token)):
    link.id = link_id
    await db.social_links.update_one({"id": link_id}, {"$set": link.model_dump()})
    return link

@api_router.delete("/admin/social-links/{link_id}")
async def delete_social_link(link_id: str, _: dict = Depends(verify_token)):
    await db.social_links.delete_one({"id": link_id})
    return {"message": "Deleted"}

# ===================== CONTACT =====================

@api_router.get("/contact", response_model=ContactModel)
async def get_contact():
    contact = await db.contact.find_one({}, {"_id": 0})
    if not contact:
        return ContactModel()
    return ContactModel(**contact)

@api_router.put("/admin/contact", response_model=ContactModel)
async def update_contact(contact: ContactModel, _: dict = Depends(verify_token)):
    await db.contact.update_one({}, {"$set": contact.model_dump()}, upsert=True)
    return contact

# ===================== IMAGE UPLOAD =====================

@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...), _: dict = Depends(verify_token)):
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    content_type = file.content_type or 'image/jpeg'
    data_url = f"data:{content_type};base64,{base64_image}"
    return {"url": data_url}

# ===================== FULL RESUME DATA =====================

@api_router.get("/resume")
async def get_full_resume():
    profile = await db.profile.find_one({}, {"_id": 0}) or {}
    experiences = await db.experience.find({}, {"_id": 0}).to_list(100)
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    skills = await db.skills.find({}, {"_id": 0}).to_list(100)
    education = await db.education.find({}, {"_id": 0}).to_list(100)
    certifications = await db.certifications.find({}, {"_id": 0}).to_list(100)
    languages = await db.languages.find({}, {"_id": 0}).to_list(100)
    social_links = await db.social_links.find({}, {"_id": 0}).to_list(100)
    contact = await db.contact.find_one({}, {"_id": 0}) or {}
    
    return {
        "profile": profile,
        "experiences": experiences,
        "projects": projects,
        "skills": skills,
        "education": education,
        "certifications": certifications,
        "languages": languages,
        "social_links": social_links,
        "contact": contact
    }

# ===================== HEALTH CHECK =====================

@api_router.get("/")
async def root():
    return {"message": "Resume API is running"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
