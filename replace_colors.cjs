
const fs = require('fs');
let css = fs.readFileSync('./src/pages/AdminLandingEditor.css', 'utf-8');

// Colors
css = css.replace(/background: #0f172a/g, 'background: #f8fafc');
css = css.replace(/color: #f8fafc/g, 'color: #0f172a');
css = css.replace(/rgba\(15, 23, 42, 0.95\)/g, 'rgba(255, 255, 255, 0.95)');
css = css.replace(/rgba\(255,255,255,0.07\)/g, 'rgba(0,0,0,0.08)');
css = css.replace(/rgba\(255,255,255,0.06\)/g, 'rgba(0,0,0,0.08)');
css = css.replace(/rgba\(255,255,255,0.05\)/g, 'rgba(0,0,0,0.06)');
css = css.replace(/rgba\(255,255,255,0.1\)/g, 'rgba(0,0,0,0.1)');
css = css.replace(/rgba\(255,255,255,0.15\)/g, 'rgba(0,0,0,0.15)');
css = css.replace(/rgba\(255, 255, 255, 0.08\)/g, 'rgba(0, 0, 0, 0.08)');
css = css.replace(/background: #1e293b/g, 'background: #ffffff');
css = css.replace(/color: #94a3b8/g, 'color: #475569');
css = css.replace(/color: #64748b/g, 'color: #64748b'); // keep or make darker
css = css.replace(/background: rgba\(0,0,0,0.2\)/g, 'background: rgba(0,0,0,0.03)');
css = css.replace(/background: #334155/g, 'background: #e2e8f0');
css = css.replace(/color: white/g, 'color: white'); // for primary buttons keep white
css = css.replace(/\.btn-upload \{[\s\S]*?color: white;/g, (match) => match.replace('color: white;', 'color: #0f172a;'));

fs.writeFileSync('./src/pages/AdminLandingEditor.css', css);

