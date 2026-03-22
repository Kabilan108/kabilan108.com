import { useEffect, useState } from "react";
import type { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { MD } from "../components/md";
import { Tag } from "../components/ui";
import { getPostBySlug } from "../lib/content";
import type { Post } from "../lib/types";
import { formatDate, setPageTitle } from "../lib/utils";

const PostPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | undefined>();

  useEffect(() => {
    if (!slug) {
      navigate("/posts");
      return;
    }

    getPostBySlug(slug).then((fetchedPost) => {
      if (!fetchedPost) {
        navigate("/posts");
        return;
      }
      setPost(fetchedPost);
    });
  }, [slug, navigate]);

  useEffect(() => {
    if (post) {
      setPageTitle(post.title);
    }
    return () => setPageTitle();
  }, [post]);

  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-ctp-mauve mb-2">{post.title}</h1>
      <div className="flex flex-wrap gap-2 mb-2">
        {post.tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </div>
      <div className="text-ctp-subtext0 text-sm mb-6 border-b border-ctp-surface0 pb-2">
        {formatDate(post.date)}
      </div>
      <MD content={post.content} />
    </article>
  );
};

export default PostPage;
