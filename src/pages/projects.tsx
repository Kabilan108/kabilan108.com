import { TaggedItemList } from "../components/tagged-item-list";
import { getProjects } from "../lib/content";

const ProjectsPage: React.FC = () => {
  const projects = getProjects();
  if (!projects || projects.length === 0) return null;

  return (
    <section className="pb-10">
      <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
        <span className="text-ctp-mauve">projects</span>
      </h1>
      <TaggedItemList items={projects} type="project" />
    </section>
  );
};

export default ProjectsPage;