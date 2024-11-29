import { TaggedItemList } from "../components/tagged-item-list";
import { useDataStore } from "../lib/data-stores";

const PostsPage: React.FC = () => {
  const posts = useDataStore((state) => state.posts);

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
