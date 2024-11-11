from pydantic import BaseModel, HttpUrl, EmailStr, RootModel

from datetime import datetime
from enum import Enum
from typing import Any


class LinkType(str, Enum):
    EMAIL = "email"
    GITHUB = "github"
    X = "x"
    LINKEDIN = "linkedin"


class Links(BaseModel):
    email: EmailStr
    github: HttpUrl
    x: HttpUrl
    linkedin: HttpUrl


class Profile(BaseModel):
    name: str
    username: str
    title: str
    bio: str
    image_url: HttpUrl
    location: str
    links: dict[LinkType, str]


class Post(BaseModel):
    id: int
    title: str
    excerpt: str
    slug: str
    tags: list[str]
    published: datetime
    featured: bool
    content: str | None = None


class Project(BaseModel):
    id: int
    title: str
    description: str
    tags: list[str]
    github: HttpUrl
    demo: HttpUrl | None = None
    featured: bool
    published: datetime


class Education(BaseModel):
    id: int
    degree: str
    institution: str
    duration: str
    details: str


class Publication(BaseModel):
    id: int
    title: str
    journal: str
    authors: list[str]
    published: datetime
    featured: bool
    bibtex: str
    citation: str
    doi_url: HttpUrl
    pdf_url: HttpUrl | None = None


class WorkExperience(BaseModel):
    id: int
    position: str
    company: str
    start_date: datetime
    end_date: datetime | None = None
    responsibilities: list[str]


class Skills(RootModel[dict[str, list[str]]]):
    pass


class Award(BaseModel):
    id: int
    title: str
    date: datetime
    description: str | None = None


class Organization(BaseModel):
    id: int
    name: str
    position: str
    duration: str


class Resume(BaseModel):
    profile: Profile
    education: list[Education]
    work_experience: list[WorkExperience]
    publications: list[Publication]
    abstracts: list[Publication]
    skills: Skills
    awards: list[Award]
    organizations: list[Organization]


class ServerResponse(BaseModel):
    message: str | None = None
    data: Any | None = None
