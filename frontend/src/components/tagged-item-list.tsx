import { ChevronsDown, ChevronsUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Post, Project } from "../lib/types";
import { groupFeaturedItems } from "../lib/utils";
import { PostList, ProjectList } from "./lists";
import { Section, Tag } from "./ui";

// Base interface for items that can be tagged
interface TaggedItem {
  id: number;
  title: string;
  tags: string[];
  featured: boolean;
  publishedOn: Date;
}

// Type guard to check if an item is a Post
function isPost(item: TaggedItem): item is Post {
  return "excerpt" in item && "slug" in item;
}

// Type guard to check if an item is a Project
function isProject(item: TaggedItem): item is Project {
  return "description" in item && "github" in item;
}

interface TaggedItemListProps {
  items: Post[] | Project[];
  type: "post" | "project";
}

export function TaggedItemList({ items, type }: TaggedItemListProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const [featuredItems, archivedItems] = useMemo(
    () => groupFeaturedItems<Post | Project>(items),
    [items],
  );

  useEffect(() => {
    if (selectedTags.length > 0) {
      const hasMatchingFeatured = featuredItems.some((item) =>
        item.tags.some((tag) => selectedTags.includes(tag)),
      );
      const hasMatchingArchived = archivedItems.some((item) =>
        item.tags.some((tag) => selectedTags.includes(tag)),
      );

      if (!hasMatchingFeatured && hasMatchingArchived) {
        setShowArchived(true);
      }
    }
  }, [selectedTags, featuredItems, archivedItems]);

  const allTags = Array.from(new Set(items.flatMap((item) => item.tags)));

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

  const filteredFeaturedItems =
    selectedTags.length > 0
      ? featuredItems.filter((item) =>
          item.tags.some((tag) => selectedTags.includes(tag)),
        )
      : featuredItems;

  const filteredArchivedItems =
    selectedTags.length > 0
      ? archivedItems.filter((item) =>
          item.tags.some((tag) => selectedTags.includes(tag)),
        )
      : archivedItems;

  const renderList = (items: (Post | Project)[], startIndex = 0) => {
    if (type === "post") {
      if (!items.every(isPost)) {
        throw new Error("Invalid item type: expected Post[]");
      }
      return (
        <PostList
          items={items}
          startIndex={startIndex}
          handleTagClick={handleTagClick}
        />
      );
    }

    if (!items.every(isProject)) {
      throw new Error("Invalid item type: expected Project[]");
    }
    return (
      <ProjectList
        items={items}
        startIndex={startIndex}
        handleTagClick={handleTagClick}
      />
    );
  };

  return (
    <>
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

      {renderList(filteredFeaturedItems)}

      {filteredArchivedItems.length > 0 && (
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
              <span>archive ({filteredArchivedItems.length})</span>
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showArchived ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {renderList(filteredArchivedItems, featuredItems.length)}
          </div>
        </>
      )}
    </>
  );
}