import { ExternalLink } from "lucide-react";
import { ChevronRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post, Project } from "../lib/types";
import { cn, formatDate } from "../lib/utils";

export const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative pl-2 border-l-4 border-ctp-surface0 py-2",
        "hover:border-ctp-blue hover:bg-ctp-surface0 hover:bg-opacity-50 transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NumberedSection: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className }) => {
  return (
    <Section className={className}>
      <div className="absolute -left-4 -ml-4 text-ctp-overlay0 opacity-50 select-none">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="space-y-2">{children}</div>
    </Section>
  );
};

const TagList: React.FC<{ tags: string[] }> = ({ tags }) => {
  return (
    <>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-ctp-lavender hover:text-ctp-peach transition-colors"
        >
          #{tag.toLowerCase().replace(" ", "-")}
        </span>
      ))}
    </>
  );
};

export const Heading: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  return (
    <h1 className={cn("text-ctp-mauve text-xl font-bold mb-4", className)}>
      {text}
    </h1>
  );
};

export const PostList: React.FC<{
  posts: Post[];
  numPosts?: number;
}> = ({ posts, numPosts }) => {
  if (numPosts) {
    posts = posts.slice(0, numPosts);
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <NumberedSection key={post.slug} index={index}>
          <h2 className="font-mono text-ctp-subtext1 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ctp-subtext0 mx-1" />
            {formatDate(post.publishedOn)} -
            <Link
              to={`/writing/${post.slug}`}
              className="text-ctp-green hover:underline"
            >
              {post.title}
            </Link>
          </h2>
          <p className="text-ctp-subtext0 pl-6">{post.excerpt}</p>
          <div className="flex items-center gap-2 text-sm pl-6">
            <TagList tags={post.tags} />
          </div>
        </NumberedSection>
      ))}
    </div>
  );
};

export const ProjectList: React.FC<{
  projects: Project[];
  numProjects?: number;
}> = ({ projects, numProjects }) => {
  if (numProjects) {
    projects = projects.slice(0, numProjects);
  }

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <NumberedSection key={project.title} index={index}>
          <h2 className="font-mono text-ctp-green flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> {project.title}
          </h2>
          <p className="text-ctp-subtext0 pl-6">{project.description}</p>
          <div className="pl-6 font-mono text-sm text-ctp-subtext0 flex items-center gap-4">
            {project.github && (
              <a
                href={project.github}
                className="inline-flex items-center gap-1 hover:text-ctp-peach transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                <span>source</span>
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                className="inline-flex items-center gap-1 hover:text-ctp-peach transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>demo</span>
              </a>
            )}
            <div className="flex items-center gap-2">
              <TagList tags={project.tags} />
            </div>
          </div>
        </NumberedSection>
      ))}
    </div>
  );
};
