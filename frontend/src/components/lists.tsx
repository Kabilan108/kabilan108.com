import { ChevronRight, Dot, ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";

import type { Post, Project } from "../lib/types";
import { formatDate } from "../lib/utils";
import { NumberedSection, Tag } from "./ui";

interface ListProps<T> {
  items: T[];
  numItems?: number;
  startIndex?: number;
  handleTagClick?: (tag: string) => void;
}

export const PostList: React.FC<ListProps<Post>> = ({
  items: posts,
  numItems: numPosts,
  startIndex = 0,
  handleTagClick,
}) => {
  if (numPosts) {
    posts = posts.slice(0, numPosts);
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {posts.map((post, index) => (
        <NumberedSection key={post.slug} index={startIndex + index}>
          <h2 className="font-mono text-sm md:text-base text-ctp-subtext1 pl-4 sm:pl-0">
            <div className="flex flex-wrap items-center">
              <span className="flex items-center whitespace-nowrap">
                <Dot className="w-6 h-6 text-ctp-subtext0 flex-shrink-0 hidden sm:block" />
                {formatDate(post.publishedOn)}
                <span className="mx-2">-</span>
              </span>
              <Link
                to={`/writing/${post.slug}`}
                className="text-ctp-green hover:underline"
              >
                {post.title}
              </Link>
            </div>
          </h2>
          <p className="text-sm md:text-base text-ctp-subtext0 pl-4 md:pl-6">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm pl-4 md:pl-6">
            {post.tags.map((tag) => (
              <Tag key={tag} tag={tag} handleTagClick={handleTagClick} />
            ))}
          </div>
        </NumberedSection>
      ))}
    </div>
  );
};

export const ProjectList: React.FC<ListProps<Project>> = ({
  items: projects,
  numItems: numProjects,
  startIndex = 0,
  handleTagClick,
}) => {
  if (numProjects) {
    projects = projects.slice(0, numProjects);
  }

  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <NumberedSection key={project.title} index={startIndex + index}>
          <h2 className="font-mono text-sm md:text-base text-ctp-green flex items-center gap-2 pl-4 sm:pl-0">
            <ChevronRight className="w-4 h-4 flex-shrink-0 hidden sm:block" />
            {project.title}
          </h2>
          <p className="text-sm md:text-base text-ctp-subtext0 pl-4 md:pl-6">
            {project.description}
          </p>
          <div className="pl-4 md:pl-6 font-mono text-xs md:text-sm text-ctp-subtext0 flex flex-wrap items-center gap-4">
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
              {project.tags.map((tag) => (
                <Tag key={tag} tag={tag} handleTagClick={handleTagClick} />
              ))}
            </div>
          </div>
        </NumberedSection>
      ))}
    </div>
  );
};
