import { Copyright } from "lucide-react";
import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useDataStore } from "./lib/data-stores";
import type { Profile } from "./lib/types";
import HomePage from "./pages/home";
import PostsPage from "./pages/posts";
import ProjectsPage from "./pages/projects";
import ResumePage from "./pages/resume";

const App = () => {
  const fetchData = useDataStore((state) => state.fetchData);
  const profile = useDataStore((state) => state.profile);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!profile) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text font-mono">
        <main className="container max-w-3xl mx-auto">
          <Header profile={profile} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Routes>
          <Footer profile={profile} />
        </main>
      </div>
    </BrowserRouter>
  );
};

const Header = ({ profile }: { profile: Profile }) => {
  const location = useLocation();
  const pages = [
    { name: "home", path: "/" },
    { name: "projects", path: "/projects" },
    { name: "posts", path: "/posts" },
    { name: "resume", path: "/resume" },
  ];

  return (
    <header className="py-4 mb-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-lg font-bold text-accent">
          {profile.username}
        </Link>
        <ul className="flex space-x-6 text-md">
          {pages.map((page) => (
            <li key={page.name}>
              <Link
                to={page.path}
                className={`hover:text-accent transition-colors ${
                  location.pathname === page.path ? "text-accent underline" : ""
                }`}
              >
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

const Footer = ({ profile }: { profile: Profile }) => {
  return (
    <footer className="mt-16">
      <div className="container mx-auto py-4 text-center">
        <p className="flex items-center justify-center">
          <Copyright className="mr-1 h-4 w-4 mr-2" /> {new Date().getFullYear()}{" "}
          <Link to="/" className="underline ml-1">
            {profile.username}
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default App;
