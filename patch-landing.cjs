const fs = require('fs');
let c = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

c = c.replace(
  `import { ChevronRight, ArrowRight, ShieldCheck, Zap, Share2, Layers, Search, BarChart3, Check } from 'lucide-react';`,
  `import { ChevronRight, ArrowRight, ShieldCheck, Zap, Share2, Layers, Search, BarChart3, Check } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';`
);

c = c.replace(
  `export default function LandingPage() {\n  const [content, setContent] = useState(null);\n  const [settings, setSettings] = useState({});`,
  `export default function LandingPage() {\n  const [content, setContent] = useState(null);\n  const [settings, setSettings] = useState({});\n  const navigate = useNavigate();`
);

const btnStr = `</div>\n              <div style={{ textAlign: 'center', marginTop: '3rem' }}>\n                <button onClick={() => navigate('/samples')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>\n                  👉 실제 동작하는 등급별 샘플 명함 체험하기\n                </button>\n              </div>\n            </div>\n          </section>`;

c = c.replace(
  `</div>\n            </div>\n          </section>`,
  btnStr
);

fs.writeFileSync('src/pages/LandingPage.jsx', c, 'utf8');
console.log('patched landing');
