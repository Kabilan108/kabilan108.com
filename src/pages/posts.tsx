import { useEffect, useState } from "react";
import type { FC } from "react";
import { TaggedItemList } from "../components/tagged-item-list";
import { getPosts } from "../lib/content";
import type { Post } from "../lib/types";
import { setPageTitle } from "../lib/utils";

const PostsPage: FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const data = await getPosts();
      setPosts(data);
      setIsLoading(false);
    };

    loadPosts();
  }, []);

  useEffect(() => {
    setPageTitle("posts");
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!posts || posts.length === 0) return null;

  return (
    <section className="pb-10">
      <h1 className="text-2xl font-bold mb-4">
        <span className="text-ctp-mauve">posts</span>
      </h1>
      <div className="space-y-6">
        <TaggedItemList items={posts} type="post" />
      </div>
    </section>
  );
};

export default PostsPage;
