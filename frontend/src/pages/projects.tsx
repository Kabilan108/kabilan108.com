import { ExternalLink, Github, Tag, Terminal, X } from "lucide-react";
import { useState } from "react";

import { useDataStore } from "../lib/data-stores";
import type { Project } from "../lib/types";

const ProjectsPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const projects: Project[] | null = useDataStore((state) => state.projects);

  const allTags = projects
    ? Array.from(new Set(projects.flatMap((p) => p.tags)))
    : [];

  if (!projects) return null;

  const handleTagClick = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag],
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const filteredProjects =
    selectedTags.length > 0
      ? projects.filter((p) => p.tags.some((tag) => selectedTags.includes(tag)))
      : projects;

  return (
    <>
      <h1 className="text-4xl font-bold mb-8 text-green-400 flex items-center">
        <Terminal className="mr-2" /> Projects
        <span className="animate-blink">_</span>
      </h1>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center text-blue-400">
            <Tag className="mr-2 h-6 w-6" /> Filters
          </h2>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-400 hover:text-red-400 flex items-center"
            >
              <X className="mr-1 h-4 w-4" /> Clear filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedTags.includes(tag)
                  ? "bg-green-500 text-gray-900"
                  : "bg-gray-800 text-green-400 hover:bg-green-600"
              } transition-colors`}
            >
              {tag}
            </button>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            Showing projects with {selectedTags.length === 1 ? "tag" : "tags"}:{" "}
            {selectedTags.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {filteredProjects.map((project) => (
          <div
            key={project.title}
            className="border border-gray-700 rounded-md p-6"
          >
            <h2 className="text-2xl font-semibold mb-2 text-green-400">
              {project.title}.py
            </h2>
            <p className="text-gray-400 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded-md flex items-center"
                >
                  <Tag className="inline-block w-4 h-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-4">
              <a
                href={project.github}
                className="text-blue-400 hover:underline inline-flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-1 h-5 w-5" /> View Source
              </a>
              {project.demo && (
                <a
                  href={project.demo}
                  className="text-blue-400 hover:underline inline-flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-5 w-5" /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProjectsPage;
