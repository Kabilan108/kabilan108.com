import {BrowserRouter, Routes, Route} from 'react-router-dom';

import HomePage from './pages/home';
import ResumePage from './pages/resume';
import ProjectsPage from './pages/projects';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/resume" element={<ResumePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
