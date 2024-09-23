import React from 'react';
import {Link} from 'react-router-dom';
import {Terminal, Code, ChevronRight} from 'lucide-react';

const bio = {
  name: 'tony kabilan okeke',
  title: 'machine learning engineer',
  company: 'moberg analytics',
  bio: `Passionate about leveraging AI and software engineering to solve
  complex problems. Expertise in machine learning algorithms and
  full-stack development. Creating innovative solutions that make a
  difference.`,
};

const latestPosts = [
  {
    id: 1,
    title: 'Exploring Advanced NLP Techniques',
    excerpt:
      'A deep dive into the latest natural language processing methods...',
    slug: 'exploring-advanced-nlp-techniques',
  },
  {
    id: 2,
    title: 'Optimizing ML Models for Production',
    excerpt:
      'Best practices for deploying machine learning models in production environments...',
    slug: 'optimizing-ml-models-for-production',
  },
  {
    id: 3,
    title: 'The Future of AI in Healthcare',
    excerpt:
      'Examining the potential impact of artificial intelligence on medical diagnostics and treatment...',
    slug: 'future-of-ai-in-healthcare',
  },
];

const featuredProjects = [
  {
    id: 1,
    title: 'Predictive Maintenance System',
    description:
      'An ML-powered system for predicting equipment failures in industrial settings, reducing downtime by 30%.',
    slug: 'predictive-maintenance-system',
  },
  {
    id: 2,
    title: 'NLP-driven Chatbot',
    description:
      'A sophisticated chatbot using advanced NLP techniques to provide human-like interactions in customer service.',
    slug: 'nlp-driven-chatbot',
  },
];

const HomePage: React.FC = () => {
  return (
    <>
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-4 text-accent">
          {bio.name}
          <span className="animate-blink">|</span>
        </h1>
        <p className="text-xl mb-4">
          {bio.title}
          {bio.title && <span className="text-accent"> @ {bio.company}</span>}
        </p>
        <p className="max-w-2xl leading-relaxed">
          $ cat about.txt
          <br />
          {bio.bio}
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Terminal className="mr-2" /> Latest_Posts
        </h2>
        <div className="space-y-6">
          {latestPosts.map(post => (
            <div
              key={post.id}
              className="border border-gray-700 p-6 rounded-md"
            >
              <h3 className="text-xl font-semibold mb-2 text-green-400">
                {post.title}.md
              </h3>
              <p className="mb-4">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
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
          {featuredProjects.map(project => (
            <div
              key={project.id}
              className="border border-gray-700 p-6 rounded-md"
            >
              <h3 className="text-xl font-semibold mb-2 text-green-400">
                {project.title}.py
              </h3>
              <p className="mb-4">{project.description}</p>
              <Link
                to={`/projects/${project.slug}`}
                className="text-blue-400 hover:underline inline-flex items-center"
              >
                python {project.title.toLowerCase().replace(/ /g, '_')}.py{' '}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
