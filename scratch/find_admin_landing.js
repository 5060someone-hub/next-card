import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\Kevin Choe\\.gemini\\antigravity\\brain';

if (!fs.existsSync(brainDir)) {
  console.log('Brain directory does not exist:', brainDir);
  process.exit(1);
}

const conversations = fs.readdirSync(brainDir);
console.log(`Found ${conversations.length} conversation folders.`);

let bestCode = null;
let bestStep = -1;
let bestConv = '';

for (const conv of conversations) {
  const logPath = path.join(brainDir, conv, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(logPath)) continue;

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('AdminLandingEditor.jsx')) continue;
    if (!line.includes('write_to_file') && !line.includes('write_file') && !line.includes('replace_file_content')) continue;

    try {
      const obj = JSON.parse(line);
      
      // Case 1: write_to_file / write_file / replace_file_content tool call
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if ((tc.name === 'write_to_file' || tc.name === 'write_file' || tc.name === 'replace_file_content') && 
              tc.args && 
              tc.args.TargetFile && 
              tc.args.TargetFile.endsWith('AdminLandingEditor.jsx')) {
            
            // For write_to_file or write_file, we get CodeContent
            if (tc.args.CodeContent) {
              const code = tc.args.CodeContent;
              if (!code.includes('find_admin_landing.js') && obj.step_index > bestStep) {
                bestCode = code;
                bestStep = obj.step_index;
                bestConv = conv;
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

if (bestCode) {
  const outputPath = 'C:\\Users\\Kevin Choe\\Desktop\\안티그래피티\\next-card\\src\\pages\\AdminLandingEditor.jsx';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, bestCode, 'utf8');
  console.log(`Successfully recovered and wrote AdminLandingEditor.jsx (recovered via write_to_file/write_file from conv ${bestConv} step ${bestStep}, length ${bestCode.length}) to ${outputPath}`);
} else {
  console.log('Could not find AdminLandingEditor.jsx code in any logs via write_to_file/write_file.');
}





