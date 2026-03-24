import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PostList, ProjectList } from "../components/lists";
import { Heading, Section, SocialLinks } from "../components/ui";
import { getPosts, getProfile, getProjects } from "../lib/content";
import type { Post, Profile, Project } from "../lib/types";
import { groupFeaturedItems } from "../lib/utils";
import { setPageTitle } from "../lib/utils";

const HomePage: React.FC<{ onSccmOpen: () => void }> = ({ onSccmOpen }) => {
  useEffect(() => {
    setPageTitle();
  }, []);

  return (
    <div className="space-y-8">
      <Bio onSccmClick={onSccmOpen} />
      <Posts />
      <Projects />
    </div>
  );
};

const Bio: React.FC<{ onSccmClick: () => void }> = ({ onSccmClick }) => {
  const profile: Profile | null = getProfile();
  if (!profile) return null;

  return (
    <section className="flex flex-col md:flex-row pb-10 border-b border-ctp-surface1">
      <div className="flex-1 mr-0 md:mr-8">
        <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
          <span className="text-ctp-mauve">{profile.name}</span>
        </h1>
        <div className="space-y-4">
          <Section className="text-lg text-ctp-green pl-6 pb-1 pt-1">
            <span>{profile.title}</span>
            <button
              type="button"
              onClick={onSccmClick}
              className="mt-1 flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-ctp-teal/10 text-ctp-teal hover:bg-ctp-teal/20 transition-colors w-fit md:inline-flex md:ml-3 md:mt-0"
            >
              presenting at sccm 2026 &rarr;
            </button>
          </Section>
          <Section className="text-sm sm:text-base text-ctp-subtext0 pl-6 space-y-4">
            <p>{profile.bio}</p>
            <div className="flex flex-wrap gap-4">
              <SocialLinks links={profile.links} useIcons={false} />
            </div>
          </Section>
        </div>
      </div>
      <div className="w-2/3 mx-auto md:w-1/4 xl:w-1/3 md:mx-0 shrink-0 mt-8 md:mt-0">
        <img
          src={profile.imageUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-lg border border-ctp-surface0"
        />
      </div>
    </section>
  );
};

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  if (!posts || posts.length === 0) return null;
  const [featuredPosts] = groupFeaturedItems<Post>(posts, 4);
  if (featuredPosts.length === 0) return null;

  return (
    <section className="pb-10 border-b border-ctp-surface1">
      <Link to="/posts">
        <Heading text="## latest posts" />
      </Link>
      <PostList items={featuredPosts} />
    </section>
  );
};

const Projects: React.FC = () => {
  const projects: Project[] | null = getProjects();
  if (!projects) return null;
  const [featuredProjects] = groupFeaturedItems<Project>(projects, 5);

  return (
    <section className="pb-10">
      <Link to="/projects">
        <Heading text="## stuff i've built" />
      </Link>
      <ProjectList items={featuredProjects} />
    </section>
  );
};

export default HomePage;
