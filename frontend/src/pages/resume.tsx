import {
  Award,
  Book,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Download,
  GraduationCap,
  Terminal,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useDataStore } from "../lib/data-stores";

const ResumePage: React.FC = () => {
  const [showFullCV, setShowFullCV] = useState<boolean>(false);
  const toggleCV = () => setShowFullCV(!showFullCV);

  const resume = useDataStore((state) => state.resume);

  if (!resume) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 flex items-center">
          <Terminal className="mr-2" />
          {resume.bio.name}
          <span className="animate-blink">_</span>
        </h1>
        <div className="space-x-4">
          <a
            href="#download-resume-pdf"
            className="bg-green-600 text-gray-900 px-4 py-2 rounded hover:bg-green-500 inline-flex items-center transition-colors"
          >
            <Download className="mr-2 h-5 w-5" /> Resume PDF
          </a>
          <a
            href="#download-full-cv-pdf"
            className="bg-blue-600 text-gray-900 px-4 py-2 rounded hover:bg-blue-500 inline-flex items-center transition-colors"
          >
            <Download className="mr-2 h-5 w-5" /> Full CV PDF
          </a>
        </div>
      </div>

      {/* Resume Sections */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-400">
          <Briefcase className="mr-2 h-6 w-6" /> Work_Experience
        </h2>
        <div className="space-y-6">
          {resume.workExperience.map((work) => (
            <div
              key={work.id}
              className="border border-gray-700 rounded-md p-4"
            >
              <h3 className="text-xl font-semibold text-green-400">
                {work.position}
              </h3>
              <p className="text-gray-400">
                {work.company} | {work.startDate.toLocaleDateString()} -{" "}
                {work.endDate?.toLocaleDateString() || "Present"}
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-400">
                {work.responsibilities.map((res) => (
                  <li key={res}>{res}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-400">
          <GraduationCap className="mr-2 h-6 w-6" /> Education
        </h2>
        {resume.education.map((edu) => (
          <div
            key={edu.id}
            className="border border-gray-700 rounded-md p-4 mb-6"
          >
            <h3 className="text-xl font-semibold text-green-400">
              {edu.degree}
            </h3>
            <p className="text-gray-400">
              {edu.institution} | {edu.duration}
            </p>
            <p>{edu.details}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-400">
          <Award className="mr-2 h-6 w-6" /> Skills
        </h2>
        <div className="space-y-4">
          {Object.entries(resume.skills).map(([category, skills]) => (
            <div key={category} className="flex items-center">
              <h3 className="text-md font-medium text-gray-400 w-56">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2 flex-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-800 text-green-400 px-2 py-1 rounded-md text-sm border border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toggle for Full CV */}
      <button
        onClick={toggleCV}
        type="button"
        className="w-full py-2 px-4 bg-gray-800 text-green-400 rounded-md hover:bg-gray-700 transition-colors mb-8 flex items-center justify-center"
      >
        {showFullCV ? (
          <>
            Hide Full CV <ChevronUp className="ml-2" />
          </>
        ) : (
          <>
            Show Full CV <ChevronDown className="ml-2" />
          </>
        )}
      </button>

      {/* Full CV Sections */}
      {showFullCV && (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-400">
              <Book className="mr-2 h-6 w-6" /> Publications
            </h2>
            <div className="space-y-4">
              {resume.publications.map((pub) => (
                <div
                  key={pub.id}
                  className="border border-gray-700 rounded-md p-4"
                >
                  <h3 className="text-xl font-semibold text-green-400">
                    {pub.title}
                  </h3>
                  <p className="text-gray-400">{pub.journal}</p>
                  <p>Authors: {pub.authors.join(", ")}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Add more CV sections here (e.g., Conferences, Awards, etc.) */}
        </>
      )}
    </>
  );
};

export default ResumePage;
