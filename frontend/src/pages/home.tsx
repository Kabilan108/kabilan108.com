import { ChevronRight, ExternalLink, Github, Hash } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

import { useDataStore } from "../lib/data-stores";

const HomePage: React.FC = () => {
  return (
    <div className="space-y-10">
      <Bio />
      <RecentPosts />
      <FeaturedProjects />
    </div>
  );
};

const Bio: React.FC = () => {
  const profile = useDataStore((state) => state.profile);

  if (!profile) return null;

  return (
    <section className="flex flex-col md:flex-row">
      <div className="flex-1 mr-0 md:mr-8">
        <h1 className="text-4xl font-bold mb-4 text-accent">{profile.name}</h1>
        <p className="text-2xl mb-4">{profile.title}</p>
        <p className="max-w-2xl leading-relaxed">
          <Heading text="cat about.txt" />
          <br />
          {profile.bio}
        </p>
      </div>
      <div className="hidden md:block flex-shrink-0 w-1/3 mt-8 md:mt-0">
        <img
          src={profile.imageUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </section>
  );
};

const RecentPosts: React.FC = () => {
  const posts = useDataStore((state) => state.posts);

  if (!posts) return null;

  const sortedPosts = [...posts]
    .filter((post) => post.featured)
    .sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime(),
    )
    .slice(0, 4);

  return (
    <section>
      <h2 className="font-semibold mb-2 flex items-center">
        <Heading text="cat recent-posts.csv" />
      </h2>
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <div key={post.id} className="border-b border-border pl-4 pb-2">
            <h3 className="text-lg font-semibold mb-2 text-accent">
              {post.title}
            </h3>
            <p className="mb-2">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="text-blue-400 hover:underline inline-flex items-center"
            >
              cat full_post <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturedProjects: React.FC = () => {
  const projects = useDataStore((state) => state.projects);

  if (!projects) return null;

  const sortedProjects = [...projects]
    .filter((project) => project.featured)
    .sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime(),
    )
    .slice(0, 4);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Heading text="cat featured-projects.csv" />
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-700 p-6 rounded-md"
          >
            <h3 className="text-xl font-semibold mb-2 text-green-400">
              {project.title}.py
            </h3>
            <p className="mb-4">{project.description}</p>
            <div className="flex gap-4">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center"
              >
                <Github className="h-5 w-5" />
              </a>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Heading: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Hash className="h-5 w-5 text-highlight" />
      <span className={`text-gray-400 ${className || ""}`}>{text}</span>
    </div>
  );
};

export default HomePage;
