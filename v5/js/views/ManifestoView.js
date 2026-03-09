// v5/js/views/ManifestoView.js
import { SOS_CODEX } from '../data/codex.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ManifestoView {
    constructor() {
        document.title = "Códice SOS | TeamTowers";
    }

    async getHtml() {
        let frameworksHtml = SOS_CODEX.frameworks.map(f => `
            <div class="framework-card">
                <h3>${f.name}</h3>
                <div class="author">Inspirado por: <strong>${f.author}</strong></div>
                <p>${f.description}</p>
                <div class="tags">
                    ${f.keywords.map(k => `<span class="tag">${k}</span>`).join('')}
                </div>
            </div>
        `).join('');

        let standardsHtml = SOS_CODEX.standards.map(s => `
            <li style="margin-bottom: 15px; font-size: 1rem;">
                <strong style="color: var(--accent-purple);">${s.name}:</strong> 
                <span style="color: var(--text-muted);">${s.desc}</span>
            </li>
        `).join('');

        return `
            <style>
                .codex-workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
                .codex-container { max-width: 1000px; width: 100%; }
                
                .framework-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 2rem; }
                
                .framework-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 2rem; border-radius: var(--border-radius-lg); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;}
                .framework-card:hover { transform: translateY(-5px); border-color: var(--accent-blue); box-shadow: 0 10px 30px rgba(0, 176, 255, 0.1); background: rgba(0, 176, 255, 0.02); }
                
                .framework-card h3 { margin-top: 0; font-size: 1.4rem; font-family: var(--font-mono); color: var(--accent-blue); margin-bottom: 5px;}
                .framework-card .author { font-size: 0.8rem; color: var(--accent-green); text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 1px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px;}
                .framework-card p { color: #ccc; line-height: 1.6; font-size: 0.95rem; flex: 1;}
                
                .framework-card .tags { margin-top: 1.5rem; display: flex; gap: 8px; flex-wrap: wrap; }
                .framework-card .tag { background: rgba(255,255,255,0.05); border: 1px solid #444; color: #aaa; font-size: 0.7rem; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; font-weight: bold;}
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/manifesto')}
                
                <main class="codex-workspace">
                    <div class="codex-container">
                        <div class="view-header" style="text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--glass-border);">
                            <div style="font-size: 4rem; margin-bottom: 10px;">🏛️</div>
                            <h1 style="font-size: 3rem; margin-bottom: 15px;">${SOS_CODEX.title}</h1>
                            <p style="font-size: 1.1rem; max-width: 800px; margin: 0 auto; color: var(--text-muted); line-height: 1.6;">
                                ${SOS_CODEX.description}
                            </p>
                        </div>

                        <h2 style="font-size: 1.8rem; color: white;">Modelos Fundacionales <span style="color: #666; font-size: 1rem; font-weight: normal;">(Powered By)</span></h2>
                        <div class="framework-grid">
                            ${frameworksHtml}
                        </div>

                        <div style="margin-top: 4rem; background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 3rem;">
                            <h2 style="color: var(--accent-purple); margin-top: 0; font-size: 1.8rem;">Principios Técnicos</h2>
                            <ul style="margin-top: 1.5rem; padding-left: 20px;">
                                ${standardsHtml}
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
    }
}
