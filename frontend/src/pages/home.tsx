import type React from "react";

import { Link } from "react-router-dom";
import { Heading, PostList, ProjectList, Section } from "../components";
import { useDataStore } from "../lib/data-stores";
import type { Post, Profile, Project } from "../lib/types";
import { groupFeaturedItems } from "../lib/utils";

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <Bio />
      <Writing />
      <Projects />
    </div>
  );
};

const Bio: React.FC = () => {
  const profile: Profile | null = useDataStore((state) => state.profile);
  if (!profile) return null;

  return (
    <section className="flex flex-col md:flex-row pb-10 border-b border-ctp-surface1">
      <div className="flex-1 mr-0 md:mr-8">
        <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
          <span className="text-ctp-mauve">{profile.name}</span>
        </h1>
        <div>
          <Section className="text-lg text-ctp-green pl-6">
            {profile.title}
          </Section>
          <Section className="text-base text-ctp-subtext0 pl-6">
            {profile.bio}
          </Section>
        </div>
      </div>
      <div className="hidden md:block flex-shrink-0 xl:w-1/3 w-1/4 mt-8 md:mt-0">
        <img
          src={profile.imageUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-lg border border-ctp-surface0"
        />
      </div>
    </section>
  );
};

const Writing: React.FC = () => {
  const posts: Post[] | null = useDataStore((state) => state.posts);
  if (!posts || posts.length === 0) return null;
  const [featuredPosts] = groupFeaturedItems<Post>(posts, 4);

  return (
    <section className="pb-10 border-b border-ctp-surface1">
      <Link to="/writing">
        <Heading text="## writing" />
      </Link>
      <PostList posts={featuredPosts} />
    </section>
  );
};

const Projects: React.FC = () => {
  const projects: Project[] | null = useDataStore((state) => state.projects);
  if (!projects) return null;
  const [featuredProjects] = groupFeaturedItems<Project>(projects, 4);

  return (
    <section className="pb-10">
      <Link to="/projects">
        <Heading text="## stuff i've built" />
      </Link>
      <ProjectList projects={featuredProjects} />
    </section>
  );
};

export default HomePage;
