import { ChevronsDown, ChevronsUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PostList } from "../components/lists";
import { Section, Tag } from "../components/ui";
import { useDataStore } from "../lib/data-stores";
import type { Post } from "../lib/types";
import { groupFeaturedItems } from "../lib/utils";

const PostsPage: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const posts = useDataStore((state) => state.posts);

  const [featuredPosts, archivedPosts] = useMemo(
    () => groupFeaturedItems<Post>(posts || []),
    [posts],
  );

  useEffect(() => {
    if (selectedTags.length > 0) {
      const hasMatchingFeatured = featuredPosts.some((p) =>
        p.tags.some((tag) => selectedTags.includes(tag)),
      );
      const hasMatchingArchived = archivedPosts.some((p) =>
        p.tags.some((tag) => selectedTags.includes(tag)),
      );

      if (!hasMatchingFeatured && hasMatchingArchived) {
        setShowArchived(true);
      }
    }
  }, [selectedTags, featuredPosts, archivedPosts]);

  if (!posts || posts.length === 0) return null;

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
    setShowArchived(false);
  };

  const filteredFeaturedPosts =
    selectedTags.length > 0
      ? featuredPosts.filter((p) =>
          p.tags.some((tag) => selectedTags.includes(tag)),
        )
      : featuredPosts;

  const filteredArchivedPosts =
    selectedTags.length > 0
      ? archivedPosts.filter((p) =>
          p.tags.some((tag) => selectedTags.includes(tag)),
        )
      : archivedPosts;

  return (
    <section className="pb-10">
      <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
        <span className="text-ctp-mauve">writing</span>
      </h1>

      <div className="mb-6 mt-4">
        <Section hover={false}>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-2 py-0.5 rounded text-sm ${
                  selectedTags.includes(tag)
                    ? "bg-ctp-surface0 text-ctp-green"
                    : "text-ctp-subtext0"
                } transition-colors`}
              >
                <Tag tag={tag} />
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-ctp-subtext0 hover:text-ctp-red flex items-center py-0.5 text-sm"
              >
                [<X className="h-3 w-3" />]
              </button>
            )}
          </div>
        </Section>
      </div>

      <PostList posts={filteredFeaturedPosts} handleTagClick={handleTagClick} />

      {filteredArchivedPosts.length > 0 && (
        <>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-1 text-ctp-subtext0 hover:text-ctp-text text-sm mt-8 mb-4"
            >
              {showArchived ? (
                <ChevronsUp className="h-4 w-4" />
              ) : (
                <ChevronsDown className="h-4 w-4" />
              )}
              <span>archive ({filteredArchivedPosts.length})</span>
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showArchived ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <PostList
              posts={filteredArchivedPosts}
              startIndex={featuredPosts.length}
              handleTagClick={handleTagClick}
            />
          </div>
        </>
      )}
    </section>
  );
};

export default PostsPage;
