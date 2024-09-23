import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import HomePage from './pages/home';
import ResumePage from './pages/resume';
import ProjectsPage from './pages/projects';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text font-mono">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

const Header = () => {
  const location = useLocation();
  const pages = [
    {name: 'home', path: '/'},
    {name: 'projects', path: '/projects'},
    {name: 'resume', path: '/resume'},
  ];

  return (
    <header className="border-b border-border">
      <nav className="container mx-auto px-6 py-4">
        <ul className="flex space-x-6">
          {pages.map(page => (
            <li key={page.name}>
              <Link
                to={page.path}
                className={`hover:text-accent transition-colors ${
                  location.pathname === page.path ? 'text-accent' : ''
                }`}
              >
                ~/{page.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-border mt-10">
      <div className="container mx-auto px-6 py-4">
        <p>
          © {new Date().getFullYear()} Tony Kabilan Okeke. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default App;
