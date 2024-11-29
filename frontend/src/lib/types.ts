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
}

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  publishedOn: Date;
  featured: boolean;
  content?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  github: string;
  demo?: string;
  featured: boolean;
  publishedOn: Date;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  details: string;
}

// TODO: support unpublished publications
export interface Publication {
  id: number;
  title: string;
  journal: string;
  authors: string[];
  published: Date;
  featured: boolean;
  bibtex: string;
  citation: string;
  doiUrl: string;
  pdfUrl?: string;
}

export interface WorkExperience {
  id: number;
  position: string;
  company: string;
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
  date: Date;
  description?: string;
}

export interface Organization {
  id: number;
  name: string;
  position: string;
  duration: string;
}

// TODO: add featured publications
export interface Resume {
  education: Education[];
  workExperience: WorkExperience[];
  publications: Publication[];
  abstracts: Publication[];
  skills: Skills;
  awards: Award[];
  organizations: Organization[];
}
