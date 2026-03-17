// v8/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class HomeView {
    constructor() {
        document.title = "Matriz Global | TeamTowers V13";
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        // Filtrar proyectos accesibles
        const userProjects = state.projects.filter(p => 
            globalRole === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        // ==========================================
        // CÁLCULOS DE TELEMETRÍA GLOBAL
        // ==========================================
        let globalCost = 0;
        let globalTokens = 0;
        let globalAiSlices = 0;
        let providerStats = {
            deepseek: { cost: 0, tokens: 0, calls: 0 },
            openai: { cost: 0, tokens: 0, calls: 0 },
            gemini: { cost: 0, tokens: 0, calls: 0 }
        };

        userProjects.forEach(p => {
            // Slices Minados por IA
            (p.ledger || []).forEach(tx => {
                const user = state.globalUsers.find(u => u.id === tx.userId);
                if (user && user.profile?.isAi) {
                    globalAiSlices += (tx.fmv || 50) * (tx.multiplier || 1) * (tx.horas || 1); 
                }
            });

            // Gasto de Tokens
            (p.telemetry || []).forEach(t => {
                globalCost += t.costInDollars || 0;
                const tks = (t.tokens?.total_tokens || t.tokens?.prompt_tokens + t.tokens?.completion_tokens) || 0;
                globalTokens += tks;

                if (providerStats[t.engine]) {
                    providerStats[t.engine].cost += t.costInDollars || 0;
                    providerStats[t.engine].tokens += tks;
                    providerStats[t.engine].calls += 1;
                }
            });
        });

        const globalREC = globalCost > 0 ? (globalAiSlices / globalCost) : 0;

        // Generador de Tarjetas de Proyecto
        let projectsHtml = '';
        if (userProjects.length === 0) {
            projectsHtml = `
                <div style="text-align:center; padding: 4rem; background: rgba(0,0,0,0.3); border: 1px dashed var(--glass-border); border-radius: 20px; grid-column: 1 / -1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px rgba(0,176,255,0.4));">🌌</div>
                    <h3 style="color:white; margin:0; font-weight:900; font-size:1.5rem;">El vacío cuántico</h3>
                    <p style="color:#888; margin-top:10px;">No estás conectado a ningún Castell (Red VNA).</p>
                    <a href="/v8/create" data-link class="btn-primary" style="display:inline-block; margin-top:20px; text-decoration:none;">➕ Instanciar Nueva Red</a>
                </div>
            `;
        } else {
            projectsHtml = userProjects.map(p => {
                const rolesCount = p.roles ? p.roles.filter(r=>!r.isArchived).length : 0;
                const flowsCount = p.vna_flows ? p.vna_flows.length : (p.transactions ? p.transactions.length : 0);
                const isOwner = p.ownerId === activeUserId;
                
                return `
                    <div class="project-card" data-id="${p.id}">
                        <div class="project-header">
                            <h3 class="project-title">${p.nombre}</h3>
                            ${isOwner ? `<span class="badge-owner">OWNER</span>` : `<span class="badge-member">NODO</span>`}
                        </div>
                        <div class="project-arch">${p.archetype || 'Red VNA'}</div>
                        
                        <div class="project-metrics">
                            <div class="metric"><span class="icon">🪑</span> <b>${rolesCount}</b> Sillas</div>
                            <div class="metric"><span class="icon">🕸️</span> <b>${flowsCount}</b> Tuberías</div>
                            <div class="metric"><span class="icon">👥</span> <b>${p.usuarios ? p.usuarios.length : 1}</b> Nodos</div>
                        </div>
                        
                        <div class="project-footer">
                            <button class="btn-enter" data-id="${p.id}">Acceder al Kernel &rarr;</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const headerConfig = {
            title: "Matriz Global",
            subtitle: "Telemetría",
            tagline: "Monitorización de Arbitraje Cognitivo y gestión de Ecosistemas.",
            magicActions: [
                { id: 'new_net', label: 'Nueva Red', icon: '➕', isAi: false }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-home { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; position: relative; scroll-behavior: smooth; box-sizing: border-box;}
                
                /* TELEMETRY WIDGETS */
                .telemetry-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;}
                .tel-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);}
                .tel-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: var(--glass-border); }
                .tel-card.c-purple::before { background: var(--accent-purple); box-shadow: 0 0 15px var(--accent-purple); }
                .tel-card.c-green::before { background: var(--accent-green); box-shadow: 0 0 15px var(--accent-green); }
                .tel-card.c-red::before { background: var(--accent-red); box-shadow: 0 0 15px var(--accent-red); }
                .tel-card.c-blue::before { background: var(--accent-blue); box-shadow: 0 0 15px var(--accent-blue); }
                
                .tel-label { font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; display:flex; align-items:center; gap:8px;}
                .tel-value { font-size: 2.2rem; color: white; font-weight: 900; font-family: var(--font-mono); line-height: 1;}
                .tel-sub { font-size: 0.8rem; color: #666; margin-top: 8px;}

                /* ENGINE COMPARISON BARS */
                .engine-comparison { background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 3rem;}
                .engine-header { color: white; font-weight: 900; margin-bottom: 1.5rem; font-size: 1.2rem; display:flex; align-items:center; gap:10px;}
                .engine-row { display: flex; align-items: center; margin-bottom: 15px; gap: 15px;}
                .engine-name { width: 100px; color: #aaa; font-weight: bold; font-size: 0.9rem; text-transform: uppercase;}
                .engine-bar-track { flex: 1; background: rgba(255,255,255,0.05); height: 12px; border-radius: 6px; overflow: hidden; position: relative;}
                .engine-bar-fill { height: 100%; border-radius: 6px; }
                .engine-stats { width: 150px; text-align: right; color: white; font-family: var(--font-mono); font-size: 0.9rem; font-weight: bold;}
                
                /* PROJECT GRID */
                .projects-section-title { color: white; font-size: 1.5rem; font-weight: 900; margin-bottom: 1.5rem; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between;}
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; padding-bottom: 4rem;}
                
                .project-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; transition: all 0.3s; cursor: default; backdrop-filter: blur(10px);}
                .project-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(0,176,255,0.3); transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.5);}
                
                .project-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;}
                .project-title { color: white; font-size: 1.3rem; font-weight: 900; margin: 0; line-height: 1.2; word-break: break-word; flex:1;}
                .badge-owner { background: rgba(0,230,118,0.1); color: var(--accent-green); border: 1px solid rgba(0,230,118,0.3); font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-family: var(--font-mono); letter-spacing: 1px;}
                .badge-member { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid rgba(0,176,255,0.3); font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-family: var(--font-mono); letter-spacing: 1px;}
                
                .project-arch { color: var(--accent-purple); font-size: 0.8rem; text-transform: uppercase; font-weight: bold; margin-bottom: 1.5rem; letter-spacing: 1px;}
                
                .project-metrics { display: flex; gap: 15px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; border: 1px solid #222;}
                .metric { color: #aaa; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; flex:1; justify-content:center;}
                .metric b { color: white; font-family: var(--font-mono); font-size: 1rem;}
                
                .project-footer { margin-top: auto; display:flex;}
                .btn-enter { width: 100%; background: transparent; border: 1px solid #555; color: white; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size:0.9rem;}
                .project-card:hover .btn-enter { background: var(--accent-blue); color: black; border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.4);}

                @media (max-width: 768px) {
                    .workspace-home { padding: 90px 1rem 120px 1rem; }
                    .telemetry-grid { grid-template-columns: 1fr; }
                    .engine-row { flex-direction: column; align-items: flex-start; gap: 5px;}
                    .engine-bar-track { width: 100%; }
                    .engine-stats { text-align: left; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace-home">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="telemetry-grid">
                        <div class="tel-card c-purple">
                            <div class="tel-label"><span>🧠</span> Ratio (REC) Global</div>
                            <div class="tel-value">${globalREC > 0 ? globalREC.toFixed(0) + 'x' : '0'}</div>
                            <div class="tel-sub">Retorno de Eficiencia Cognitiva</div>
                        </div>
                        <div class="tel-card c-green">
                            <div class="tel-label"><span>💎</span> Arbitraje (Slicing Pie)</div>
                            <div class="tel-value">€${Math.round(globalAiSlices).toLocaleString()}</div>
                            <div class="tel-sub">Valor humano minado por IA</div>
                        </div>
                        <div class="tel-card c-red">
                            <div class="tel-label"><span>💸</span> Gasto API Consolidado</div>
                            <div class="tel-value">$${globalCost.toFixed(3)}</div>
                            <div class="tel-sub">Coste estructural computacional</div>
                        </div>
                        <div class="tel-card c-blue">
                            <div class="tel-label"><span>⚡</span> Tokens Ingeridos</div>
                            <div class="tel-value">${(globalTokens / 1000).toFixed(1)}k</div>
                            <div class="tel-sub">Total Input + Output</div>
                        </div>
                    </div>

                    <div class="engine-comparison">
                        <div class="engine-header">🔋 Desempeño por Motor LLM (Inversión)</div>
                        
                        <div class="engine-row">
                            <div class="engine-name" style="color:var(--accent-blue);">DeepSeek</div>
                            <div class="engine-bar-track">
                                <div class="engine-bar-fill" style="width: ${globalCost > 0 ? (providerStats.deepseek.cost / globalCost)*100 : 0}%; background:var(--accent-blue);"></div>
                            </div>
                            <div class="engine-stats">$${providerStats.deepseek.cost.toFixed(3)} <span style="color:#666;">(${providerStats.deepseek.calls} txs)</span></div>
                        </div>

                        <div class="engine-row">
                            <div class="engine-name" style="color:var(--accent-green);">OpenAI</div>
                            <div class="engine-bar-track">
                                <div class="engine-bar-fill" style="width: ${globalCost > 0 ? (providerStats.openai.cost / globalCost)*100 : 0}%; background:var(--accent-green);"></div>
                            </div>
                            <div class="engine-stats">$${providerStats.openai.cost.toFixed(3)} <span style="color:#666;">(${providerStats.openai.calls} txs)</span></div>
                        </div>

                        <div class="engine-row">
                            <div class="engine-name" style="color:var(--accent-orange);">Gemini</div>
                            <div class="engine-bar-track">
                                <div class="engine-bar-fill" style="width: ${globalCost > 0 ? (providerStats.gemini.cost / globalCost)*100 : 0}%; background:var(--accent-orange);"></div>
                            </div>
                            <div class="engine-stats">$${providerStats.gemini.cost.toFixed(3)} <span style="color:#666;">(${providerStats.gemini.calls} txs)</span></div>
                        </div>
                    </div>

                    <div class="projects-section-title">
                        <span>Castells Activos</span>
                    </div>
                    
                    <div class="projects-grid">
                        ${projectsHtml}
                    </div>

                </main>

                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        // Magic Button (Instanciar Red)
        window.addEventListener('ph-magic-action', (e) => {
            if (e.detail.actionId === 'new_net') {
                window.location.href = '/v8/create';
            }
        });

        // Navegación rápida al Dashboard de un Proyecto Específico
        document.querySelectorAll('.btn-enter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = e.target.getAttribute('data-id');
                if (projectId) {
                    localStorage.setItem('tt_active_project', projectId);
                    window.location.href = '/v8/dashboard';
                }
            });
        });
    }
}
