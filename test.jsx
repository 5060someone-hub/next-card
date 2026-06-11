import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminLandingEditor from './src/pages/AdminLandingEditor';

const App = () => (
  <BrowserRouter>
    <AdminLandingEditor />
  </BrowserRouter>
);

const root = createRoot(document.getElementById('root'));
root.render(<App />);
