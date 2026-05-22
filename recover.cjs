const fs = require('fs');
const path = require('path');
const historyPath = path.join(process.env.APPDATA, 'Code', 'User', 'History');
if (!fs.existsSync(historyPath)) { console.log('No history'); process.exit(0); }

const dirs = fs.readdirSync(historyPath);
let recoveredCount = 0;
for (const dir of dirs) {
  const dirPath = path.join(historyPath, dir);
  const entriesPath = path.join(dirPath, 'entries.json');
  if (fs.existsSync(entriesPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
      if (data.resource && data.resource.includes('next-card') && data.resource.includes('src')) {
        let filePath = decodeURIComponent(data.resource).replace('file:///', '').replace(/\\//g, '\\\\');
        // Handle Windows paths
        if (filePath.startsWith('c%3A')) filePath = filePath.replace('c%3A', 'c:');
        if (filePath.startsWith('C%3A')) filePath = filePath.replace('C%3A', 'C:');
        if (filePath.startsWith('c:')) filePath = filePath.replace('c:', 'C:');
        if (filePath.startsWith('C%3A')) filePath = filePath.replace('C%3A', 'C:');
        
        if (data.entries && data.entries.length > 0) {
          data.entries.sort((a, b) => b.timestamp - a.timestamp);
          
          let validContent = null;
          for (const entry of data.entries) {
            const entryFilePath = path.join(dirPath, entry.id);
            if (fs.existsSync(entryFilePath)) {
              const content = fs.readFileSync(entryFilePath, 'utf8');
              if (!content.includes("|| 'http://127.0.0.1:5000'") && !content.includes("모듈?")) {
                validContent = content;
                break;
              }
            }
          }
          if (validContent) {
            console.log('Recovering', filePath);
            fs.writeFileSync(filePath, validContent, 'utf8');
            recoveredCount++;
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
console.log('Recovered', recoveredCount, 'files.');
