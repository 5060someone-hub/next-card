const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('import.meta.env.VITE_API_URL')) {
        const newContent = content.replace(/import\.meta\.env\.VITE_API_URL/g, "(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')");
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Updated', fullPath);
        }
      }
    }
  }
}

replaceInDir('src');
console.log('Done!');
