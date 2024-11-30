export interface TaggedItem {
  id: number;
  title: string;
  tags: string[];
  featured: boolean;
  date: Date;
}

export interface Profile {
  name: string;
  username: string;
  title: string;
  bio: string;
  imageUrl: string;
  location: string;
  links: {
    [key in LinkType]: string;
  };
}

export enum LinkType {
  EMAIL = "email",
  GITHUB = "github",
  X = "x_dot_com",
  LINKEDIN = "linkedin",
  MAL = "myanimelist",
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  tags: string[];
  featured: boolean;
  content: string;
}

export interface Project extends TaggedItem {
  description: string;
  github: string;
  demo?: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  details: string;
  location: string;
}

export interface Publication {
  id: number;
  title: string;
  journal: string;
  authors: string[];
  me: number;
  publishedOn: Date;
  isPublished: boolean;
  citation: string;
  url?: string;
  pdfPath: string;
}

export interface WorkExperience {
  id: number;
  position: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  responsibilities: string[];
}

export interface Skills {
  [key: string]: string[];
}

export interface Award {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description?: string;
  amount?: number;
}

export interface Organization {
  id: number;
  name: string;
  position: string;
  duration: string;
}

export interface Resume {
  education: Education[];
  workExperience: WorkExperience[];
  publications: Publication[];
  abstracts: Publication[];
  skills: Skills;
  awards: Award[];
  organizations: Organization[];
  featuredProjects?: Project[];
  pdfPath: string;
}
