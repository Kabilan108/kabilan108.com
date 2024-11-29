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
      <div className="min-h-screen font-mono ctp-mocha bg-ctp-mantle text-ctp-text">
        <main className="max-w-4xl mx-auto p-4">
          <NavBar profile={profile} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/writing" element={<PostsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Routes>
          <Footer profile={profile} />
        </main>
      </div>
    </BrowserRouter>
  );
};

const NavBar = ({ profile }: { profile: Profile }) => {
  const location = useLocation();
  const pages = [
    { name: "home", path: "/" },
    { name: "writing", path: "/writing" },
    { name: "projects", path: "/projects" },
    { name: "resume", path: "/resume" },
  ];

  return (
    <header className="py-2 mb-8 border-b border-ctp-surface1">
      <nav className="flex justify-between items-center">
        <Link
          to="/"
          className="text-lg font-bold text-ctp-maroon hover:text-ctp-red transition-colors"
        >
          {profile.username}
        </Link>
        <ul className="flex space-x-6 text-md">
          {pages.map((page) => (
            <li key={page.name}>
              <Link
                to={page.path}
                className={`hover:text-ctp-peach transition-colors ${
                  location.pathname === page.path
                    ? "text-ctp-peach border-b border-ctp-peach"
                    : "text-ctp-yellow"
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
    <footer className="mt-10">
      <p className="flex items-center justify-center text-sm text-ctp-subtext0">
        <Copyright className="mr-1 h-4 w-4 mr-2" /> {new Date().getFullYear()}
        {" -"}
        <Link to="/" className="ml-2">
          {profile.username}
        </Link>
      </p>
    </footer>
  );
};

export default App;
