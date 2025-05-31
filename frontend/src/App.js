import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectForm from './components/ProjectForm';
import CollectionViewer from './components/CollectionViewer';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectForm />} />
        <Route path="/collection" element={<CollectionViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
