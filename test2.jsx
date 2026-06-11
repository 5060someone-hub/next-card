import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AdminLandingEditor from './src/pages/AdminLandingEditorMocked.jsx';

console.log("Starting render test...");
try {
  const html = renderToString(
    <MemoryRouter initialEntries={['/?tab=why']}>
      <AdminLandingEditor />
    </MemoryRouter>
  );
  console.log("Render successful!");
} catch (e) {
  console.error("Render failed:", e);
}
