import { Copyright, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { SocialLinks } from "./components/ui";
import { getNumPosts, getProfile } from "./lib/content";
import type { Profile } from "./lib/types";
import HomePage from "./pages/home";
import PostPage from "./pages/post";
import PostsPage from "./pages/posts";
import ProjectsPage from "./pages/projects";
import ResumePage from "./pages/resume";

const App = () => {
  const [showPosts, setShowPosts] = useState(false);
  const profile = getProfile();

  useEffect(() => {
    getNumPosts().then((n) => setShowPosts(n > 0));
  }, []);

  if (!profile) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen font-mono ctp-mocha bg-ctp-mantle text-ctp-text flex flex-col">
        <main className="flex-grow max-w-4xl w-full mx-auto px-6 sm:px-12 md:px-8">
          <NavBar profile={profile} showPosts={showPosts} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            {showPosts && (
              <>
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/:slug" element={<PostPage />} />
              </>
            )}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Routes>
        </main>
        <Footer profile={profile} />
      </div>
    </BrowserRouter>
  );
};

const NavBar = ({
  profile,
  showPosts,
}: {
  profile: Profile;
  showPosts: boolean;
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pages = [
    { name: "home", path: "/", show: true },
    { name: "posts", path: "/posts", show: false },
    { name: "projects", path: "/projects", show: true },
    { name: "resume", path: "/resume", show: true },
  ];
  if (showPosts) {
    pages[1].show = true;
  }

  return (
    <header className="pt-4 pb-2 mb-8 border-b border-ctp-surface1">
      <nav className="flex justify-between items-center">
        <Link
          to="/"
          className="text-lg font-bold text-ctp-maroon hover:text-ctp-red transition-colors"
        >
          {profile.username}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 text-md">
          {pages
            .filter((page) => page.show)
            .map((page) => (
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-ctp-yellow p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-ctp-mantle bg-opacity-95">
          <div className="flex flex-col items-center justify-center h-full relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-ctp-yellow p-2"
            >
              <X size={24} />
            </button>
            <ul className="flex flex-col space-y-6 text-xl">
              {pages
                .filter((page) => page.show)
                .map((page) => (
                  <li key={page.name}>
                    <Link
                      to={page.path}
                      onClick={() => setIsMenuOpen(false)}
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
            <div className="absolute bottom-12 flex space-x-6">
              <SocialLinks links={profile.links} color="yellow" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = ({ profile }: { profile: Profile }) => {
  return (
    <footer className="w-full max-w-4xl mx-auto pt-4 pb-2 border-t border-ctp-surface1">
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
