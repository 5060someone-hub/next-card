const fs = require('fs');

let server = fs.readFileSync('server/index.js', 'utf8');

// 1. Schema
server = server.replace(
  `name: { type: String, required: true },`,
  `name: { type: String, required: true },\n  tags: { type: [String], default: [] },`
);

// 2. POST
server = server.replace(
  `const { name, description, price, features, sampleUrl } = req.body;`,
  `const { name, description, price, features, sampleUrl, tags } = req.body;`
);
server = server.replace(
  `name, \n    description,`,
  `name, \n    description,\n    tags: Array.isArray(tags) ? tags : [],`
);
// Handling CRLF for POST just in case
server = server.replace(
  `name, \r\n    description,`,
  `name, \r\n    description,\r\n    tags: Array.isArray(tags) ? tags : [],`
);

// 3. PUT
server = server.replace(
  `const { name, description, price, features, sampleUrl } = req.body;`,
  `const { name, description, price, features, sampleUrl, tags } = req.body;` // Might replace both POST and PUT, which is fine if I didn't make it global, but replace only does first match. Let's do it globally.
);
// Replace all occurrences of destructuring
server = server.replaceAll(
  `const { name, description, price, features, sampleUrl } = req.body;`,
  `const { name, description, price, features, sampleUrl, tags } = req.body;`
);
// Replace PUT specific
server = server.replace(
  `name, \n      description,`,
  `name, \n      description, \n      tags: Array.isArray(tags) ? tags : [],`
);
server = server.replace(
  `name, \r\n      description,`,
  `name, \r\n      description, \r\n      tags: Array.isArray(tags) ? tags : [],`
);

fs.writeFileSync('server/index.js', server, 'utf8');
console.log('patched server');
