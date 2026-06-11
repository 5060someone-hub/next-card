require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { AdminLandingEditor } = require('./src/pages/AdminLandingEditor.jsx');

// AdminLandingEditor is a default export, let's just grab the whole file and eval it if needed,
// but let's try to mock it.
