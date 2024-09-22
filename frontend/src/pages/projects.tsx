import React, {useState} from 'react';

import {Link} from 'react-router-dom';
import {Terminal, Github, ExternalLink, Tag} from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tags: string[];
  github: string;
  demo?: string;
}

const ProjectsPage: React.FC = () => {
  const projects: Project[] = [
    {
      title: 'Predictive_Maintenance_ML',
      description:
        'Machine learning model to predict equipment failures, reducing downtime by 30%.',
      tags: ['Python', 'TensorFlow', 'Scikit-learn'],
      github: 'https://github.com/johndoe/predictive-maintenance',
      demo: 'https://demo.predictive-maintenance.com',
    },
    {
      title: 'Realtime_Data_Pipeline',
      description:
        'Scalable data pipeline using Apache Kafka and Spark for processing millions of events per second.',
      tags: ['Scala', 'Apache Kafka', 'Apache Spark'],
      github: 'https://github.com/johndoe/realtime-pipeline',
    },
    {
      title: 'NLP_Chatbot',
      description:
        'AI-powered chatbot capable of understanding and responding to complex queries in multiple languages.',
      tags: ['Python', 'NLTK', 'Transformer Models'],
      github: 'https://github.com/johndoe/nlp-chatbot',
      demo: 'https://chatbot-demo.johndoe.com',
    },
  ];

  const [filteredTag, setFilteredTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));

  const filteredProjects = filteredTag
    ? projects.filter(p => p.tags.includes(filteredTag))
    : projects;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-mono">
      <header className="border-b border-gray-700">
        <nav className="container mx-auto px-6 py-4">
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                ~/home
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="hover:text-green-400 transition-colors"
              >
                ~/projects
              </Link>
            </li>
            <li>
              <Link
                to="/resume"
                className="hover:text-green-400 transition-colors"
              >
                ~/resume
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-green-400 flex items-center">
          <Terminal className="mr-2" /> Projects
          <span className="animate-blink">_</span>
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-blue-400">
            <Tag className="mr-2 h-6 w-6" /> Filters
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => setFilteredTag(tag === filteredTag ? null : tag)}
                className={`px-3 py-1 rounded-md text-sm ${
                  tag === filteredTag
                    ? 'bg-green-500 text-gray-900'
                    : 'bg-gray-800 text-green-400 hover:bg-green-600'
                } transition-colors`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {filteredProjects.map((project, index) => (
            <div key={index} className="border border-gray-700 rounded-md p-6">
              <h2 className="text-2xl font-semibold mb-2 text-green-400">
                {project.title}.py
              </h2>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-800 text-blue-400 text-sm px-2 py-1 rounded-md flex items-center"
                  >
                    <Tag className="inline-block w-4 h-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex space-x-4">
                <a
                  href={project.github}
                  className="text-blue-400 hover:underline inline-flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-1 h-5 w-5" /> View Source
                </a>
                {project.demo && (
                  <a
                    href={project.demo}
                    className="text-blue-400 hover:underline inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-5 w-5" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-700 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p>© {new Date().getFullYear()} John_Doe. All_rights_reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProjectsPage;
