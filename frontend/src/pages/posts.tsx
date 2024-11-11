import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
  Tag,
  Terminal,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useDataStore } from "../lib/data-stores";

const PostsPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const posts = useDataStore((state) => state.posts);

  if (!posts) return null;

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

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

  const filteredPosts =
    selectedTags.length > 0
      ? posts.filter((p) => p.tags.some((tag) => selectedTags.includes(tag)))
      : posts;

  // Sort posts: featured first, then by published date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  // Split posts into featured and archived
  const featuredPosts = sortedPosts.filter((post) => post.featured);
  const archivedPosts = sortedPosts.filter((post) => !post.featured);

  return (
    <>
      <h1 className="text-4xl font-bold mb-8 text-green-400 flex items-center">
        <Terminal className="mr-2" /> Blog Posts
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
            Showing posts with {selectedTags.length === 1 ? "tag" : "tags"}:{" "}
            {selectedTags.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {featuredPosts.map((post) => (
          <div key={post.id} className="border border-gray-700 rounded-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-green-400">
                {post.title}
              </h2>
            </div>
            <p className="text-gray-400 mb-2">
              {new Date(post.published).toLocaleDateString()}
            </p>
            <p className="text-gray-400 mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded-md flex items-center"
                >
                  <Hash className="inline-block w-4 h-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-4">
              <Link
                to={`/blog/${post.slug}`}
                className="text-blue-400 hover:underline inline-flex items-center"
              >
                <ExternalLink className="mr-1 h-5 w-5" /> Read More
              </Link>
            </div>
          </div>
        ))}

        {archivedPosts.length > 0 && (
          <>
            <button
              onClick={() => setShowArchive(!showArchive)}
              type="button"
              className="w-full py-2 px-4 bg-gray-800 text-green-400 rounded-md hover:bg-gray-700 transition-colors mb-8 flex items-center justify-center"
            >
              {showArchive ? (
                <>
                  Hide Archive <ChevronUp className="ml-2" />
                </>
              ) : (
                <>
                  Show Archive <ChevronDown className="ml-2" />
                </>
              )}
            </button>

            {showArchive && (
              <div className="space-y-8">
                {archivedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-700 rounded-md p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-semibold text-green-400">
                        {post.title}
                      </h2>
                    </div>
                    <p className="text-gray-400 mb-2">
                      {new Date(post.published).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded-md flex items-center"
                        >
                          <Hash className="inline-block w-4 h-4 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-blue-400 hover:underline inline-flex items-center"
                      >
                        <ExternalLink className="mr-1 h-5 w-5" /> Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PostsPage;
