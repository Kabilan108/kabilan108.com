import { Buffer } from "buffer";
import matter from "gray-matter";

import type { Post, Profile, Project, Resume } from "./types";

globalThis.Buffer = Buffer;

type JsonContent = {
  [key: string]: Profile | Project[] | Resume;
};

interface Frontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  featured: boolean;
}

interface MarkdownFile {
  default: string;
}

const jsonFiles = import.meta.glob<JsonContent>("/content/*.json", {
  eager: true,
});

const postFiles = import.meta.glob<MarkdownFile>("/content/posts/**/*.md", {
  eager: true,
});

export function getProfile(): Profile {
  const profileData = jsonFiles["/content/profile.json"];
  return profileData.default as Profile;
}

export function getProjects(): Project[] {
  const projectsData = jsonFiles["/content/projects.json"];
  return (projectsData.default as Project[]).map((project) => ({
    ...project,
    date: new Date(project.date),
  }));
}

export function getResume(): Resume {
  const resumeData = jsonFiles["/content/resume.json"];
  const resume = resumeData.default as Resume;
  const formattedResume = {
    ...resume,
    awards: resume.awards.map((award) => ({
      ...award,
      startDate: new Date(award.startDate),
      endDate: award.endDate ? new Date(award.endDate) : null,
    })),
    workExperience: resume.workExperience.map((work) => ({
      ...work,
      startDate: new Date(work.startDate),
      endDate: work.endDate ? new Date(work.endDate) : null,
    })),
    publications: resume.publications.map((publication) => ({
      ...publication,
      publishedOn: new Date(publication.publishedOn),
    })),
    abstracts: resume.abstracts.map((abstract) => ({
      ...abstract,
      publishedOn: new Date(abstract.publishedOn),
    })),
  };
  return formattedResume;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await Promise.all(
    Object.entries(postFiles).map(async ([path, file], index) => {
      const rawContent = await fetch(file.default).then((r) => r.text());
      const { data, content } = matter(rawContent);
      const frontmatter = data as Frontmatter;
      return {
        id: index,
        slug: path.replace("/content/posts/", "").replace(".md", ""),
        title: frontmatter.title,
        date: new Date(frontmatter.date),
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags,
        featured: frontmatter.featured,
        content: content,
      };
    }),
  );
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Helper function to load all data at once if needed
export async function loadAllData() {
  return {
    profile: getProfile(),
    projects: getProjects(),
    resume: getResume(),
    posts: getPosts(),
  };
}

// Add this new function to get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
