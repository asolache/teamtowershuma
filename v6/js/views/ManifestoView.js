// v5/js/views/ManifestoView.js
import { SOS_CODEX } from '../data/codex.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ManifestoView {
    constructor() {
        document.title = "Manifiesto SOS | TeamTowers";
    }

    async getHtml() {
        const headerConfig = {
            title: "Códice SOS",
            subtitle: "Manifesto",
            tagline: "Los fundamentos teóricos detrás del Exoesqueleto Cognitivo."
        };

        const frameworksHtml = SOS_CODEX.frameworks.map(f => `
            <div class="framework-card">
                <div class="card-id-badge">${f.id.toUpperCase()}</div>
                <h3>${f.name}</h3>
                <div class="author-label">Inspirado por: <strong>${f.author}</strong></div>
                <p class="framework-p">${f.description}</p>
                <div class="keyword-tags">
                    ${f.keywords.map(k => `<span class="k-pill">#${k}</span>`).join('')}
                </div>
            </div>
        `).join('');

        const standardsHtml = SOS_CODEX.standards.map(s => `
            <div class="standard-row">
                <div class="s-indicator"></div>
                <div>
                    <strong class="s-name">${s.name}</strong> 
                    <p class="s-desc">${s.desc}</p>
                </div>
            </div>
        `).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); }
                .codex-workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; }
                .codex-container { max-width: 1100px; margin: 0 auto; padding-bottom: 5rem; }
                
                /* HERO INTRO */
                .manifesto-hero { text-align: left; margin: 2rem 0 4rem 0; animation: fadeIn 0.8s ease-out; }
                .manifesto-hero h1 { font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; color: white; margin-bottom: 1rem; }
                .manifesto-hero p { font-size: 1.25rem; color: var(--text-muted); max-width: 800px; line-height: 1.6; }

                /* GRID */
                .framework-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem; }
                
                .framework-card { 
                    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); 
                    border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 24px; 
                    position: relative; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    display: flex; flex-direction: column; backdrop-filter: blur(10px);
                }
                .framework-card:hover { transform: translateY(-8px); border-color: var(--accent-blue); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                
                .card-id-badge { position: absolute; top: 20px; right: 25px; font-family: var(--font-mono); font-size: 0.65rem; color: var(--accent-purple); font-weight: 900; letter-spacing: 2px; opacity: 0.6; }
                .framework-card h3 { font-size: 1.6rem; color: white; margin: 0 0 10px 0; font-weight: 800; letter-spacing: -0.5px; }
                .author-label { font-size: 0.75rem; color: var(--accent-green); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5rem; font-weight: bold; }
                .framework-p { color: #aaa; line-height: 1.7; font-size: 1rem; flex: 1; }
                
                .keyword-tags { margin-top: 2rem; display: flex; gap: 8px; flex-wrap: wrap; }
                .k-pill { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); font-size: 0.7rem; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-family: var(--font-mono); border: 1px solid rgba(0,176,255,0.1); }

                /* STANDARDS */
                .standards-section { margin-top: 5rem; background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3.5rem; }
                .standards-section h2 { font-size: 2rem; font-weight: 900; color: white; margin-top: 0; margin-bottom: 2.5rem; letter-spacing: -1px; }
                .standard-row { display: flex; gap: 20px; margin-bottom: 2rem; align-items: flex-start; }
                .s-indicator { width: 4px; height: 40px; background: var(--accent-purple); border-radius: 4px; flex-shrink: 0; }
                .s-name { color: var(--accent-purple); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; }
                .s-desc { color: #888; font-size: 1rem; margin: 5px 0 0 0; line-height: 1.5; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .codex-workspace { padding: 80px 1.5rem 100px 1.5rem; }
                    .manifesto-hero h1 { font-size: 2.5rem; }
                    .standards-section { padding: 2rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/manifesto')}
                
                <main class="codex-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="codex-container">
                        <section class="manifesto-hero">
                            <h1>🏛️ El Manifiesto</h1>
                            <p>${SOS_CODEX.description}</p>
                        </section>

                        <div class="framework-grid">
                            ${frameworksHtml}
                        </div>

                        <section class="standards-section">
                            <h2>Principios Técnicos & Estándares</h2>
                            <div class="standards-list">
                                ${standardsHtml}
                            </div>
                        </section>
                    </div>
                </main>

                ${BottomNav.getHtml('/manifesto')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
    }
}
