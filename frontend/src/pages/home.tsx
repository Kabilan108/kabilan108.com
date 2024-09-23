import React from 'react';
import {Link} from 'react-router-dom';
import {ChevronRight} from 'lucide-react';

const bio = {
  name: 'tony kabilan okeke',
  title: 'machine learning engineer',
  bio: `Passionate about leveraging AI and software engineering to solve
  complex problems. Expertise in machine learning algorithms and
  full-stack development. Creating innovative solutions that make a
  difference.`,
  imageUrl: 'https://images.kabilan108.com/profile.jpeg',
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
    <div className="space-y-10">
      <Bio />
      <RecentPosts />
      <FeaturedProjects />
    </div>
  );
};

const Bio: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row">
      <div className="flex-1 mr-0 md:mr-8">
        <h1 className="text-4xl font-bold mb-4 text-accent">{bio.name}</h1>
        <p className="text-2xl mb-4">{bio.title}</p>
        <p className="max-w-2xl leading-relaxed">
          <Code text="cat about.txt" />
          <br />
          {bio.bio}
        </p>
      </div>
      <div className="hidden md:block flex-shrink-0 w-1/3 mt-8 md:mt-0">
        <img
          src={bio.imageUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </section>
  );
};

const RecentPosts: React.FC = () => {
  return (
    <section>
      <h2 className="font-semibold mb-2 flex items-center">
        <Code text="cat recent-posts.csv" />
      </h2>
      <div className="space-y-4">
        {latestPosts.map(post => (
          <div key={post.id} className="border-b border-border pl-4 pb-2">
            <h3 className="text-lg font-semibold mb-2 text-accent">
              {post.title}
            </h3>
            <p className="mb-2">{post.excerpt}</p>
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
  );
};

const FeaturedProjects: React.FC = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Code text="cat featured-projects.csv" />
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
  );
};

const Code: React.FC<{text: string}> = ({text}) => {
  return (
    <span className="text-command text-xl">
      $ {text}
      <span className="animate-blink font-extrabold">▋</span>
    </span>
  );
};

export default HomePage;
