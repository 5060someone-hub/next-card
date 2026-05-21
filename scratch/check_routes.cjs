const http = require('http');

function getRoutes() {
  return new Promise((resolve, reject) => {
    // We can fetch from local server to see if any custom endpoint is exposed, or we can just parse index.js.
    // Let's import the file and inspect its app routes if we can.
    // But since it calls app.listen, importing it might try to start a second server.
    // So let's just inspect index.js content programmatically.
    const fs = require('fs');
    const content = fs.readFileSync('server/index.js', 'utf8');
    const matches = content.match(/app\.(get|post|put|delete)\(['"`]([^'"`]+)/g);
    resolve(matches);
  });
}

getRoutes().then(console.log).catch(console.error);
