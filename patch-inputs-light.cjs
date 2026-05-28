const fs = require('fs');

let css = fs.readFileSync('src/pages/LandingPage.css', 'utf8');

// Replace main input styles
css = css.replace(
  /\.contact-group input,[\s\n]*\.contact-group select,[\s\n]*\.contact-group textarea \{\s*background: #374151;\s*border: 1px solid rgba\(255, 255, 255, 0\.1\);\s*border-radius: 12px;\s*padding: 14px 18px;\s*color: white;\s*font-size: 0\.95rem;\s*font-family: inherit;\s*outline: none;\s*transition: all 0\.3s ease;\s*\}/,
  `.contact-group input,
.contact-group select,
.contact-group textarea {
  background: #eef2f6;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 18px;
  color: #0f172a;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
}

/* Chrome autofill fix */
.contact-group input:-webkit-autofill,
.contact-group input:-webkit-autofill:hover, 
.contact-group input:-webkit-autofill:focus, 
.contact-group input:-webkit-autofill:active{
    -webkit-box-shadow: 0 0 0 30px #eef2f6 inset !important;
    -webkit-text-fill-color: #0f172a !important;
    transition: background-color 5000s ease-in-out 0s;
}`
);

// Replace placeholder styles
css = css.replace(
  /\.contact-group input::placeholder,[\s\n]*\.contact-group textarea::placeholder \{\s*color: rgba\(255, 255, 255, 0\.5\);\s*\}/,
  `.contact-group input::placeholder,
.contact-group textarea::placeholder {
  color: #94a3b8;
}`
);

// Replace focus styles
css = css.replace(
  /\.contact-group input:focus,[\s\n]*\.contact-group select:focus,[\s\n]*\.contact-group textarea:focus \{\s*border-color: var\(--primary-color\);\s*box-shadow: 0 0 0 3px rgba\(219, 39, 119, 0\.15\);\s*background: #4b5563;\s*\}/,
  `.contact-group input:focus,
.contact-group select:focus,
.contact-group textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.15);
  background: #ffffff;
}`
);

// Replace select dropdown icon color
css = css.replace(
  /stroke='%23f8fafc'/g,
  `stroke='%23475569'`
);

fs.writeFileSync('src/pages/LandingPage.css', css, 'utf8');
console.log('patched light inputs');
