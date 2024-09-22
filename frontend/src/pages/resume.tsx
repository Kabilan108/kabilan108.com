import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
  Terminal,
  Briefcase,
  GraduationCap,
  Award,
  Download,
  Book,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WorkExperience {
  position: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  institution: string;
  duration: string;
  details: string;
}

interface Publication {
  title: string;
  journal: string;
  authors: string[];
}

const ResumePage: React.FC = () => {
  const [showFullCV, setShowFullCV] = useState<boolean>(false);

  const toggleCV = () => setShowFullCV(!showFullCV);

  const workExperiences: WorkExperience[] = [
    {
      position: 'Senior_Machine_Learning_Engineer',
      company: 'TechCorp Inc.',
      duration: '2020 - Present',
      responsibilities: [
        'Led development of advanced ML models for predictive analytics',
        'Improved model accuracy by 25% through innovative feature engineering',
        'Mentored junior engineers and conducted knowledge sharing sessions',
      ],
    },
    // Add more work experiences here
  ];

  const education: Education[] = [
    {
      degree: 'M.S._Computer_Science',
      institution: 'Stanford University',
      duration: '2016 - 2018',
      details: 'Specialization in Machine Learning and Artificial Intelligence',
    },
    // Add more education details here
  ];

  const publications: Publication[] = [
    {
      title:
        '"Advanced Machine Learning Techniques for Predictive Maintenance"',
      journal: 'Journal of Artificial Intelligence, 2022',
      authors: ['John Doe', 'Jane Smith', 'Robert Johnson'],
    },
    // Add more publications here
  ];

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 flex items-center">
            <Terminal className="mr-2" /> John_Doe.resume-cv
            <span className="animate-blink">_</span>
          </h1>
          <div className="space-x-4">
            <a
              href="#"
              className="bg-green-600 text-gray-900 px-4 py-2 rounded hover:bg-green-500 inline-flex items-center transition-colors"
            >
              <Download className="mr-2 h-5 w-5" /> Resume PDF
            </a>
            <a
              href="#"
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
            {workExperiences.map((work, index) => (
              <div
                key={index}
                className="border border-gray-700 rounded-md p-4"
              >
                <h3 className="text-xl font-semibold text-green-400">
                  {work.position}
                </h3>
                <p className="text-gray-400">
                  {work.company} | {work.duration}
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-400">
                  {work.responsibilities.map((res, resIndex) => (
                    <li key={resIndex}>{res}</li>
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
          {education.map((edu, index) => (
            <div
              key={index}
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
          <div className="flex flex-wrap gap-2">
            {[
              'Python',
              'TensorFlow',
              'PyTorch',
              'Scikit-learn',
              'JavaScript',
              'React',
              'Node.js',
              'SQL',
              'Git',
              'Docker',
              'AWS',
            ].map((skill, index) => (
              <span
                key={index}
                className="bg-gray-800 text-green-400 px-3 py-1 rounded-md text-sm border border-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Toggle for Full CV */}
        <button
          onClick={toggleCV}
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
                {publications.map((pub, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-md p-4"
                  >
                    <h3 className="text-xl font-semibold text-green-400">
                      {pub.title}
                    </h3>
                    <p className="text-gray-400">{pub.journal}</p>
                    <p>Authors: {pub.authors.join(', ')}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Add more CV sections here (e.g., Conferences, Awards, etc.) */}
          </>
        )}
      </main>

      <footer className="border-t border-gray-700 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p>© {new Date().getFullYear()} John_Doe. All_rights_reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ResumePage;
