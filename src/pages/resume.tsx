import { ExternalLink, FileDown, Github } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import PDF from "../assets/pdf.svg?react";
import {
  Badge,
  BadgeColor,
  CopyButton,
  Heading,
  IconWrapper,
  Section,
  SocialLinks,
  Tag,
  Tooltip,
  TooltipButton,
} from "../components/ui";
import { getProfile, getProjects, getResume } from "../lib/content";
import type {
  Award,
  Education,
  Organization,
  Profile,
  Project,
  Publication,
  Skills,
  WorkExperience,
} from "../lib/types";
import { cn, formatDate, setPageTitle } from "../lib/utils";

const ResumePage: React.FC = () => {
  useEffect(() => {
    setPageTitle("resume");
  }, []);

  const resume = getResume();
  const profile = getProfile();
  const projects = getProjects();
  if (!profile || !resume) return null;

  resume.featuredProjects = projects?.filter((project) => project.featured);

  return (
    <div className="space-y-8">
      <BioSection profile={profile} />
      {resume.education.length > 0 && (
        <EducationSection education={resume.education} />
      )}
      {resume.workExperience.length > 0 && (
        <ExperienceSection experience={resume.workExperience} />
      )}
      {resume.featuredProjects && resume.featuredProjects.length > 0 && (
        <ProjectsSection projects={resume.featuredProjects} />
      )}
      {resume.publications.length > 0 && (
        <PublicationsSection
          publications={resume.publications}
          title="## publications"
        />
      )}
      {resume.abstracts.length > 0 && (
        <PublicationsSection
          publications={resume.abstracts}
          title="## conference abstracts"
        />
      )}
      {Object.keys(resume.skills).length > 0 && (
        <SkillsSection skills={resume.skills} />
      )}
      {resume.awards.length > 0 && <AwardsSection awards={resume.awards} />}
      {resume.organizations.length > 0 && (
        <OrganizationsSection orgs={resume.organizations} />
      )}
    </div>
  );
};

const BioSection: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <section className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">
          {profile.name}
        </h1>
        <div className="flex gap-4">
          <SocialLinks links={profile.links} useIcons={false} />
        </div>
      </div>
      <TooltipButton
        tooltip="Download Resume"
        onClick={() => {
          // TODO: Implement resume download
          console.log("Download resume");
        }}
        className="text-ctp-blue hover:text-ctp-lavender transition-colors pr-4"
      >
        <IconWrapper icon={PDF} size={36} className="fill-ctp-green" />
      </TooltipButton>
    </section>
  );
};

const EducationSection: React.FC<{ education: Education[] }> = ({
  education,
}) => {
  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## education" className="mb-2" />
      <div className="space-y-4">
        {education.map((edu) => (
          <Section key={edu.id} className="pl-6 pr-4">
            <div className="flex justify-between items-center">
              <h3 className="text-ctp-green font-mono">{edu.degree}</h3>
              <p className="text-sm text-ctp-subtext1">{edu.duration}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-ctp-subtext1">{edu.institution}</p>
              <p className="text-sm text-ctp-subtext0">{edu.location}</p>
            </div>
            <p className="text-sm text-ctp-subtext0">{edu.details}</p>
          </Section>
        ))}
      </div>
    </section>
  );
};

const ExperienceSection: React.FC<{ experience: WorkExperience[] }> = ({
  experience,
}) => {
  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## experience" className="mb-2" />
      <div className="space-y-4">
        {experience.map((exp) => (
          <Section key={exp.id} className="pl-6 pr-4">
            <div className="flex justify-between items-center">
              <h3 className="text-ctp-green font-mono">{exp.position}</h3>
              <p className="text-sm text-ctp-subtext0">
                {formatDate(exp.startDate, "medium")} -{" "}
                {exp.endDate ? formatDate(exp.endDate, "medium") : "Present"}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-ctp-subtext1">{exp.company}</p>
              <p className="text-sm text-ctp-subtext0">{exp.location}</p>
            </div>
            <ul className="list-disc pl-4 text-sm text-ctp-subtext0 mt-2 space-y-2">
              {exp.responsibilities.map((resp) => (
                <li key={resp} className="[&>p]:inline">
                  <p>{resp}</p>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </div>
    </section>
  );
};

const ProjectsSection: React.FC<{ projects: Project[] }> = ({ projects }) => {
  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## projects" className="mb-2" />
      <div className="space-y-4">
        {projects.map((project) => (
          <Section key={project.id} className="pl-6 pr-4 text-sm">
            <p className="text-ctp-green">{project.title}</p>
            <p className="text-ctp-subtext1">{project.description}</p>
            <div className="flex justify-between items-center mt-0">
              <div className="flex gap-4">
                {project.tags.map((tag) => (
                  <Tag key={tag} tag={tag} />
                ))}
              </div>
              <div className="flex gap-4">
                {project.github && (
                  <TooltipButton
                    tooltip="Source Code"
                    onClick={() => window.open(project.github, "_blank")}
                    className="text-ctp-blue hover:text-ctp-pink transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </TooltipButton>
                )}
                {project.demo && (
                  <TooltipButton
                    tooltip="Demo"
                    onClick={() => window.open(project.demo, "_blank")}
                    className="text-ctp-blue hover:text-ctp-pink transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </TooltipButton>
                )}
              </div>
            </div>
          </Section>
        ))}
      </div>
    </section>
  );
};

const PublicationsSection: React.FC<{
  publications: Publication[];
  title: string;
}> = ({ publications, title }) => {
  const PublicationItem: React.FC<{ pub: Publication }> = ({ pub }) => {
    return (
      <Section key={pub.id} className="pl-6 pr-4 text-sm">
        {!pub.isPublished && (
          <Tooltip
            tooltip="paper is pending review by journal"
            className="mb-2"
          >
            <Badge color={BadgeColor.Peach}>under review</Badge>
          </Tooltip>
        )}
        <Link
          to={pub.url || ""}
          className={cn(
            "text-ctp-yellow",
            pub.url && "hover:text-ctp-pink transition-colors",
          )}
          target={pub.url ? "_blank" : "_self"}
          rel={pub.url ? "noopener noreferrer" : "self"}
        >
          {pub.title}
        </Link>
        <p className="text-ctp-subtext0">
          {pub.authors.map((author, index) => (
            <span key={author}>
              {index > 0 && ", "}
              <span
                className={`italic ${index === pub.me - 1 ? "text-ctp-sky font-bold" : ""}`}
              >
                {author}
              </span>
            </span>
          ))}
        </p>
        <div className="flex justify-between items-center mt-0 gap-4">
          <div className="flex gap-4">
            <p className="text-ctp-subtext1">
              {pub.journal} ({formatDate(pub.publishedOn, "medium")})
            </p>
          </div>
          <div className="flex gap-4">
            {pub.pdfPath && (
              <TooltipButton
                tooltip="Download PDF"
                onClick={() => window.open(pub.pdfPath, "_blank")}
                className="text-ctp-blue hover:text-ctp-pink transition-colors"
              >
                <FileDown className="w-5 h-5" />
              </TooltipButton>
            )}
            {pub.citation && (
              <CopyButton
                text={pub.citation}
                tooltip="Copy citation"
                color="blue"
                size={5}
              />
            )}
          </div>
        </div>
      </Section>
    );
  };

  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text={title} className="mb-2" />
      <div className="space-y-4">
        {publications.map((pub) => (
          <PublicationItem key={pub.id} pub={pub} />
        ))}
      </div>
    </section>
  );
};

const SkillsSection: React.FC<{ skills: Skills }> = ({ skills }) => {
  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## skills" className="mb-2" />
      {Object.entries(skills).map(([category, skills], index) => {
        const colors = Object.values(BadgeColor);
        const color = colors[index % colors.length];
        return (
          <Section
            key={category}
            className="pl-6 pr-4 py-1 gap-4 flex items-baseline"
          >
            <h3 className={`text-ctp-${color} font-mono font-semibold`}>
              {category}:
            </h3>
            <div className="flex flex-wrap gap-2 items-baseline">
              {skills.map((skill) => (
                <Badge key={skill} color={color}>
                  {skill.toLocaleLowerCase()}
                </Badge>
              ))}
            </div>
          </Section>
        );
      })}
    </section>
  );
};

const AwardsSection: React.FC<{ awards: Award[] }> = ({ awards }) => {
  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## awards" className="mb-2" />
      <div className="space-y-4">
        {awards.map((award) => (
          <Section key={award.id} className="pl-6 pr-4 py-1">
            <div className="flex justify-between items-center">
              <div className="flex justify-left items-center gap-4 text-ctp-green">
                {award.title}
                {award.amount && (
                  <p className="text-ctp-peach">
                    ${award.amount.toLocaleString("en-US").replace(/,/g, "_")}
                  </p>
                )}
              </div>
              <p className="text-sm text-ctp-subtext0">
                {formatDate(award.startDate, "medium")}
                {award.endDate && <> - {formatDate(award.endDate, "medium")}</>}
              </p>
            </div>
            {award.description && (
              <p className="text-sm text-ctp-subtext0">{award.description}</p>
            )}
          </Section>
        ))}
      </div>
    </section>
  );
};

const OrganizationsSection: React.FC<{ orgs: Organization[] }> = ({ orgs }) => {
  return (
    <section className="pb-10">
      <Heading text="## organizations" className="mb-2" />
      <div className="space-y-4">
        {orgs.map((org) => (
          <Section
            key={org.id}
            className="pl-6 pr-4 py-1 flex justify-between items-center"
          >
            <div className="flex justify-left items-center gap-2">
              <h3 className="text-ctp-green">{org.name}</h3>-{" "}
              <p className="text-ctp-subtext1">{org.position}</p>
            </div>
            <p className="text-sm text-ctp-subtext0">{org.duration}</p>
          </Section>
        ))}
      </div>
    </section>
  );
};

export default ResumePage;
