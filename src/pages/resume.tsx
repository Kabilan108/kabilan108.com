import { useEffect } from "react";

import {
  Badge,
  BadgeColor,
  CopyButton,
  DownloadButton,
  Heading,
  Section,
  SocialLinks,
  Tooltip,
} from "../components/ui";
import { getProfile, getResume } from "../lib/content";
import type {
  Award,
  Education,
  Organization,
  PublicationAsset,
  Profile,
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
  if (!profile || !resume) return null;

  return (
    <div className="space-y-8">
      <BioSection profile={profile} pdfPath={resume.pdfPath} />
      {resume.education.length > 0 && <EducationSection education={resume.education} />}
      {resume.workExperience.length > 0 && <ExperienceSection experience={resume.workExperience} />}
      {resume.publications.length > 0 && (
        <PublicationsSection publications={resume.publications} title="## publications" />
      )}
      {resume.abstracts.length > 0 && (
        <PublicationsSection publications={resume.abstracts} title="## conference abstracts" />
      )}
      {Object.keys(resume.skills).length > 0 && <SkillsSection skills={resume.skills} />}
      {resume.awards.length > 0 && <AwardsSection awards={resume.awards} />}
      {resume.organizations.length > 0 && <OrganizationsSection orgs={resume.organizations} />}
    </div>
  );
};

const BioSection: React.FC<{ profile: Profile; pdfPath: string }> = ({ profile, pdfPath }) => {
  return (
    <section className="flex justify-between items-start pr-4">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-ctp-mauve">{profile.name}</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <SocialLinks links={profile.links} useIcons={false} />
        </div>
      </div>
      <DownloadButton url={pdfPath} tooltip="Download PDF" color="blue" size={36} />
    </section>
  );
};

const EducationSection: React.FC<{ education: Education[] }> = ({ education }) => {
  const sortedEducation = [...education].sort(
    (a, b) => getDurationSortKey(b.duration) - getDurationSortKey(a.duration),
  );

  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## education" className="mb-2" />
      <div className="space-y-4">
        {sortedEducation.map((edu) => (
          <Section key={edu.id} className="pl-6 pr-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h3 className="text-ctp-green font-mono">{edu.degree}</h3>
              <p className="text-sm text-ctp-subtext1 mt-1 sm:mt-0">{edu.duration}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 sm:mt-0">
              <p className="text-ctp-subtext1">{edu.institution}</p>
              <p className="text-sm text-ctp-subtext0 mt-1 sm:mt-0">{edu.location}</p>
            </div>
            <p className="text-sm text-ctp-subtext0 mt-2">{edu.details}</p>
          </Section>
        ))}
      </div>
    </section>
  );
};

const ExperienceSection: React.FC<{ experience: WorkExperience[] }> = ({ experience }) => {
  const sortedExperience = [...experience].sort((a, b) => getDateSortKey(b) - getDateSortKey(a));

  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## experience" className="mb-2" />
      <div className="space-y-4">
        {sortedExperience.map((exp) => (
          <Section key={exp.id} className="pl-6 pr-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h3 className="text-ctp-green font-mono">{exp.position}</h3>
              <p className="text-sm text-ctp-subtext0 mt-1 sm:mt-0">
                {formatDate(exp.startDate, "medium")} -{" "}
                {exp.endDate ? formatDate(exp.endDate, "medium") : "Present"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 sm:mt-0">
              <p className="text-ctp-subtext1">{exp.company}</p>
              <p className="text-sm text-ctp-subtext0 mt-1 sm:mt-0">{exp.location}</p>
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

const PublicationsSection: React.FC<{
  publications: Publication[];
  title: string;
}> = ({ publications, title }) => {
  const assetTooltip = (asset: PublicationAsset): string => {
    const normalized = asset.label.toLowerCase();
    if (normalized === "abstract") return "Open abstract PDF";
    if (normalized === "poster") return "Open poster PDF";
    if (normalized === "research snapshot") return "Open research snapshot PDF";
    return `Open ${normalized}`;
  };

  const PublicationItem: React.FC<{ pub: Publication }> = ({ pub }) => {
    return (
      <Section key={pub.id} className="pl-6 pr-4 text-sm">
        {!pub.isPublished && (
          <Tooltip tooltip="paper is pending review by journal" className="mb-2">
            <Badge color={BadgeColor.Peach}>under review</Badge>
          </Tooltip>
        )}
        <a
          href={pub.url || "#"}
          className={cn("text-ctp-yellow", pub.url && "hover:text-ctp-pink transition-colors")}
          target={pub.url ? "_blank" : "_self"}
          rel={pub.url ? "noopener noreferrer" : "self"}
        >
          {pub.title}
        </a>
        <p className="text-ctp-subtext0">
          {pub.authors.map((author, index) => (
            <span key={author}>
              {index > 0 && ", "}
              <span className={`italic ${index === pub.me - 1 ? "text-ctp-sky font-bold" : ""}`}>
                {author}
              </span>
            </span>
          ))}
        </p>
        {pub.highlights && pub.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pub.highlights.map((highlight) => (
              <Badge key={highlight} color={BadgeColor.Green}>
                {highlight}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mt-2">
          <div className="flex gap-4">
            <p className="text-ctp-subtext1">
              {pub.journal} ({formatDate(pub.publishedOn, "medium")})
            </p>
          </div>
          <div className="flex flex-nowrap gap-2 items-center shrink-0">
            {pub.assets?.map((asset) => (
              <DownloadButton
                key={`${pub.id}-${asset.label}-${asset.url}`}
                url={asset.url}
                tooltip={assetTooltip(asset)}
                color="blue"
                size={5}
              />
            ))}
            {pub.pdfPath && (
              <DownloadButton url={pub.pdfPath} tooltip="Download PDF" color="blue" size={5} />
            )}
            {pub.citation && (
              <CopyButton text={pub.citation} tooltip="Copy citation" color="blue" size={5} />
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
        {publications
          .sort((a, b) => b.publishedOn.getTime() - a.publishedOn.getTime())
          .map((pub) => (
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
            className="pl-6 pr-4 py-2 sm:py-1 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4"
          >
            <h3 className={`text-ctp-${color} font-mono font-semibold`}>{category}:</h3>
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
  const sortedAwards = [...awards].sort(
    (a, b) =>
      getDateSortKey({ startDate: b.startDate, endDate: b.endDate }) -
      getDateSortKey({ startDate: a.startDate, endDate: a.endDate }),
  );

  return (
    <section className="pb-6 border-b border-ctp-surface1">
      <Heading text="## awards" className="mb-2" />
      <div className="space-y-4">
        {sortedAwards.map((award) => (
          <Section key={award.id} className="pl-6 pr-4 py-2 sm:py-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
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
              <p className="text-sm text-ctp-subtext0 mt-2 sm:mt-0">{award.description}</p>
            )}
          </Section>
        ))}
      </div>
    </section>
  );
};

const OrganizationsSection: React.FC<{ orgs: Organization[] }> = ({ orgs }) => {
  const sortedOrgs = [...orgs].sort(
    (a, b) => getDurationSortKey(b.duration) - getDurationSortKey(a.duration),
  );

  return (
    <section className="pb-10">
      <Heading text="## organizations" className="mb-2" />
      <div className="space-y-4">
        {sortedOrgs.map((org) => (
          <Section key={org.id} className="pl-6 pr-4 py-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <div className="flex justify-left items-center gap-2">
                <h3 className="text-ctp-green">{org.name}</h3>-{" "}
                <p className="text-ctp-subtext1">{org.position}</p>
              </div>
              <p className="text-sm text-ctp-subtext0">{org.duration}</p>
            </div>
          </Section>
        ))}
      </div>
    </section>
  );
};

const monthIndex: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseMonthYear(value: string): Date | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "present") {
    return new Date("9999-12-31");
  }

  const [month, year] = normalized.split(/\s+/);
  const monthValue = monthIndex[month];
  const yearValue = Number.parseInt(year ?? "", 10);

  if (monthValue === undefined || Number.isNaN(yearValue)) {
    return null;
  }

  return new Date(yearValue, monthValue, 1);
}

function getDurationSortKey(duration: string): number {
  const end = duration.split("-").at(-1);
  return parseMonthYear(end ?? "")?.getTime() ?? 0;
}

function getDateSortKey(item: { startDate: Date; endDate: Date | null }): number {
  return (item.endDate ?? item.startDate).getTime();
}

export default ResumePage;
