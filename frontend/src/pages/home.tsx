import React from 'react';
import {Link} from 'react-router-dom';
import {Terminal, Code, ChevronRight} from 'lucide-react';

const HomePage: React.FC = () => {
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
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-4 text-green-400">
            John_Doe<span className="animate-blink">_</span>
          </h1>
          <p className="text-xl mb-4">Machine Learning Engineer & SWE</p>
          <p className="max-w-2xl leading-relaxed">
            $ cat about.txt
            <br />
            Passionate about leveraging AI and software engineering to solve
            complex problems. Expertise in machine learning algorithms and
            full-stack development. Creating innovative solutions that make a
            difference.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Terminal className="mr-2" /> Latest_Posts
          </h2>
          <div className="space-y-6">
            {[1, 2, 3].map(post => (
              <div key={post} className="border border-gray-700 p-6 rounded-md">
                <h3 className="text-xl font-semibold mb-2 text-green-400">
                  Blog_Post_Title_{post}.md
                </h3>
                <p className="mb-4">Short excerpt from the blog post...</p>
                <Link
                  to={`/blog/post-${post}`}
                  className="text-blue-400 hover:underline inline-flex items-center"
                >
                  cat full_post <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Code className="mr-2" /> Featured_Projects
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map(project => (
              <div
                key={project}
                className="border border-gray-700 p-6 rounded-md"
              >
                <h3 className="text-xl font-semibold mb-2 text-green-400">
                  Project_Title_{project}.py
                </h3>
                <p className="mb-4">
                  Brief description of the project and its impact...
                </p>
                <Link
                  to={`/projects/${project}`}
                  className="text-blue-400 hover:underline inline-flex items-center"
                >
                  python project_{project}.py{' '}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-700 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p>© {new Date().getFullYear()} John_Doe. All_rights_reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
