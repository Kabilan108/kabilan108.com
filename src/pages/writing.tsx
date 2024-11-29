import { useEffect, useState } from "react";

import { TaggedItemList } from "../components/tagged-item-list";
import { getPosts } from "../lib/content";
import type { Post } from "../lib/types";

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="pb-10">
      <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
        <span className="text-ctp-mauve">writing</span>
      </h1>
      <TaggedItemList items={posts} type="post" />
    </section>
  );
};

export default PostsPage;
