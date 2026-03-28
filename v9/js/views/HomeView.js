// v9/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js';

export default class HomeView {
    constructor() {
        document.title = "Singularidad | TeamTowers V9";
        this.synapticInstance = null;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        // 1. CÁLCULO DE TELEMETRÍA GLOBAL (Tokens y Euros)
        const telemetry = state.telemetry || [];
        const globalStats = { totalCost: 0, totalTokens: 0, byEngine: {} };

        telemetry.forEach(t => {
            const cost = t.costInDollars || 0; 
            const tokens = (t.tokens?.prompt_tokens || 0) + (t.tokens?.completion_tokens || 0);
            
            globalStats.totalCost += cost;
            globalStats.totalTokens += tokens;

            const engine = t.engine || 'Desconocido';
            if (!globalStats.byEngine[engine]) globalStats.byEngine[engine] = { cost: 0, tokens: 0 };
            globalStats.byEngine[engine].cost += cost;
            globalStats.byEngine[engine].tokens += tokens;
        });

        // Renderizado del Desglose por Motor IA
        let enginesHtml = '';
        if (Object.keys(globalStats.byEngine).length > 0) {
            for (const [engine, stats] of Object.entries(globalStats.byEngine)) {
                let icon = '🧠';
                if(engine.includes('openai')) icon = '🟢';
                if(engine.includes('anthropic')) icon = '🟠';
                if(engine.includes('gemini')) icon = '🔵';
                if(engine.includes('deepseek')) icon = '🟣';

                enginesHtml += `
                    <div class="engine-stat-pill">
                        <span class="engine-name">${icon} ${engine.toUpperCase()}</span>
                        <div class="engine-metrics">
                            <span class="engine-tokens">${stats.tokens.toLocaleString()} tk</span>
                            <span class="engine-cost">€${stats.cost.toFixed(3)}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            enginesHtml = `<div style="color:#666; font-size:0.8rem; font-style:italic;">Aún no hay consumo cognitivo registrado en la matriz. Opera en el Omni-Paper para encender los medidores.</div>`;
        }

        // 2. CÁLCULO DE PROYECTOS Y ECOSISTEMAS
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        let projectsHtml = '';
        if (userProjects.length === 0) {
            projectsHtml = `
                <div class="empty-state-panel">
                    <span style="font-size:4rem; display:block; margin-bottom:1rem; opacity:0.8;">🌌</span>
                    <h3 style="color:white; margin:0 0 10px 0; font-size:1.5rem;">El Vacio Cuántico</h3>
                    <p style="color:#888; margin-bottom:20px;">No estás asignado a ningún ecosistema. ¿Forjamos una nueva matriz de valor?</p>
                    <button class="btn-primary" data-action="go-create">➕ Iniciar Génesis (Nuevo Proyecto)</button>
                </div>
            `;
        } else {
            projectsHtml = userProjects.map(p => {
                const wos = p.work_orders || [];
                const activeWos = wos.filter(w => w.status === 'pinged' || w.status === 'reported').length;
                const closedWos = wos.filter(w => w.status === 'consolidated').length;
                
                const totalSlices = (p.ledger || []).reduce((sum, tx) => sum + (tx.slices || 0), 0);
                
                const projTelemetry = telemetry.filter(t => t.projectId === p.id).reduce((acc, t) => {
                    acc.cost += t.costInDollars || 0;
                    acc.tokens += (t.tokens?.prompt_tokens || 0) + (t.tokens?.completion_tokens || 0);
                    return acc;
                }, { cost: 0, tokens: 0 });

                return `
                    <div class="project-card">
                        <div class="pc-header">
                            <h3 class="pc-title">${p.nombre}</h3>
                            <span class="pc-badge">${p.activeSprintId ? 'Sprint Activo' : 'Standby'}</span>
                        </div>
                        <p class="pc-desc">${p.presentation || 'Sin visión fundacional definida.'}</p>
                        
                        <div class="pc-metrics-grid">
                            <div class="pc-metric">
                                <span class="pcm-label">Work Orders</span>
                                <span class="pcm-value" style="color:var(--accent-blue)">${activeWos} Act / ${closedWos} Fin</span>
                            </div>
                            <div class="pc-metric">
                                <span class="pcm-label">Slices Minados</span>
                                <span class="pcm-value" style="color:var(--accent-orange)">${Math.round(totalSlices).toLocaleString()} 🍕</span>
                            </div>
                            <div class="pc-metric">
                                <span class="pcm-label">Combustión IA</span>
                                <span class="pcm-value" style="color:var(--accent-green)">€${projTelemetry.cost.toFixed(3)}</span>
                            </div>
                            <div class="pc-metric">
                                <span class="pcm-label">Carga Cognitiva</span>
                                <span class="pcm-value" style="color:#aaa">${projTelemetry.tokens.toLocaleString()} tk</span>
                            </div>
                        </div>

                        <div class="pc-actions">
                            <button class="pc-btn primary" data-action="go-kanban" data-id="${p.id}">⚡ Operar Ecosistema (PULL)</button>
                            ${(state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId) ? 
                                `<button class="pc-btn secondary" data-action="go-vna" data-id="${p.id}">⚙️ Matriz VNA</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        const headerConfig = {
            title: "Singularidad V9",
            subtitle: "Centro de Mando",
            tagline: "El latido del ecosistema. Desde aquí observas la gravedad Casteller, la telemetría financiera y accedes a La Forja.",
            tabs: []
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-home { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .home-container { width: 100%; max-width: 1400px; display: flex; flex-direction: column; gap: 2rem; margin-top: 1.5rem; padding-bottom: 8rem; flex: 1;}

                /* ==================================================================== */
                /* 🔥 HERO DASHBOARD (EL OJO DEL CÓRTEX) */
                /* ==================================================================== */
                .hero-dashboard { display: grid; grid-template-columns: 400px 1fr; gap: 20px; background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 24px; padding: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); min-height: 400px;}
                
                .hero-metrics { display: flex; flex-direction: column; padding: 20px; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.05); }
                .hero-title { font-size: 2rem; font-weight: 900; margin: 0 0 10px 0; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px;}
                .hero-subtitle { color: #888; font-size: 0.95rem; line-height: 1.5; margin-bottom: 25px;}

                .global-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;}
                .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 5px; text-align: center; transition: 0.3s;}
                .stat-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); border-color: rgba(255,255,255,0.1);}
                .stat-label { font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .stat-value { font-size: 1.5rem; font-weight: 900; font-family: var(--font-mono); color: white;}

                .engine-breakdown { display: flex; flex-direction: column; gap: 8px; margin-bottom: auto;}
                .eb-title { font-size: 0.75rem; color: var(--accent-blue); text-transform: uppercase; font-weight: bold; margin-bottom: 5px; border-bottom: 1px dashed rgba(0,176,255,0.3); padding-bottom: 5px;}
                .engine-stat-pill { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid #333; padding: 8px 12px; border-radius: 8px;}
                .engine-name { font-size: 0.85rem; color: #ccc; font-weight: bold; display: flex; align-items: center; gap: 8px;}
                .engine-metrics { display: flex; gap: 15px; align-items: center; font-family: var(--font-mono); font-size: 0.8rem;}
                .engine-tokens { color: #888; }
                .engine-cost { color: var(--accent-green); font-weight: bold; }

                .btn-hero-forja { margin-top: 25px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; text-align: center; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(224,64,251,0.2); display: block; width: 100%; box-sizing: border-box;}
                .btn-hero-forja:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(224,64,251,0.4); filter: brightness(1.2);}

                .hero-3d-wrapper { border-radius: 16px; overflow: hidden; background: #000; position: relative; border: 1px solid #333; box-shadow: inset 0 0 50px rgba(0,176,255,0.1);}
                #homeCanvasMount { width: 100%; height: 100%; }

                /* ==================================================================== */
                /* 🔥 RADAR DE ECOSISTEMAS (PROJECT CARDS) */
                /* ==================================================================== */
                .section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 1rem;}
                .section-title { font-size: 1.5rem; color: white; font-weight: 900; margin: 0; letter-spacing: -0.5px;}
                .btn-new-project { background: transparent; border: 1px dashed var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-new-project:hover { background: rgba(0,230,118,0.1); }

                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px;}
                .project-card { background: linear-gradient(180deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,1) 100%); border: 1px solid var(--glass-border); border-top: 4px solid var(--accent-blue); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 15px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .project-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,176,255,0.15); border-color: rgba(0,176,255,0.3);}
                
                .pc-header { display: flex; justify-content: space-between; align-items: flex-start;}
                .pc-title { font-size: 1.3rem; color: white; font-weight: 900; margin: 0;}
                .pc-badge { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);}
                
                .pc-desc { font-size: 0.9rem; color: #888; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
                
                .pc-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px solid #333;}
                .pc-metric { display: flex; flex-direction: column; gap: 4px;}
                .pcm-label { font-size: 0.65rem; color: #666; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .pcm-value { font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono);}

                .pc-actions { display: flex; gap: 10px; margin-top: auto; padding-top: 10px;}
                .pc-btn { flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; font-size: 0.9rem; cursor: pointer; transition: 0.2s; text-align: center;}
                .pc-btn.primary { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue);}
                .pc-btn.primary:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.3);}
                .pc-btn.secondary { background: transparent; border: 1px solid #555; color: #aaa;}
                .pc-btn.secondary:hover { border-color: white; color: white;}

                .empty-state-panel { width: 100%; text-align: center; padding: 4rem; background: rgba(255,255,255,0.02); border: 1px dashed #444; border-radius: 20px;}

                @media (max-width: 1024px) {
                    .hero-dashboard { grid-template-columns: 1fr; }
                    .hero-3d-wrapper { min-height: 400px; }
                }
                @media (max-width: 768px) {
                    .workspace-home { padding: 90px 1rem 120px 1rem; }
                    .projects-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                <main class="workspace-home">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="home-container">
                        
                        <div class="hero-dashboard">
                            <div class="hero-metrics">
                                <h2 class="hero-title">El Ojo del Córtex</h2>
                                <p class="hero-subtitle">Telemetría financiera y cognitiva de la Colmena Antigravity en tiempo real.</p>
                                
                                <div class="global-stats-grid">
                                    <div class="stat-card">
                                        <span class="stat-label">Combustión Neuronal</span>
                                        <span class="stat-value" style="color:var(--accent-purple)">${globalStats.totalTokens.toLocaleString()}</span>
                                    </div>
                                    <div class="stat-card">
                                        <span class="stat-label">Inversión API (Total)</span>
                                        <span class="stat-value" style="color:var(--accent-green)">€${globalStats.totalCost.toFixed(3)}</span>
                                    </div>
                                </div>

                                <div class="engine-breakdown">
                                    <div class="eb-title">Desglose Cognitivo por Motor</div>
                                    ${enginesHtml}
                                </div>

                                <button class="btn-hero-forja" data-action="go-lms">🧠 Entrar a La Forja (LMS)</button>
                            </div>
                            <div class="hero-3d-wrapper" id="homeCanvasMount">
                                </div>
                        </div>

                        <div class="section-header">
                            <h3 class="section-title">Nodos de Valor (Ecosistemas Activos)</h3>
                            ${state.session.role === 'ecosystem-owner' ? `<button class="btn-new-project" data-action="go-create">➕ Nuevo Génesis</button>` : ''}
                        </div>
                        <div class="projects-grid">
                            ${projectsHtml}
                        </div>

                    </div>
                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        // 🔥 INYECTOR DE ENRUTAMIENTO SPA (Zero Fricción - No recarga la página)
        const triggerSPA = (url) => {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('data-link', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // 🔥 INICIAR META-GRAFO 3D (VISTA GLOBAL)
        const mountPoint = document.getElementById('homeCanvasMount');
        if (mountPoint) {
            this.synapticInstance = new SynapticCanvas(mountPoint, { agentId: null, isVnaMode: false });
            await this.synapticInstance.render();
        }

        // 🔥 LISTENERS DE BOTONES BLINDADOS CON SPA
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const projId = e.currentTarget.dataset.id;
                
                // Guardamos el proyecto activo para que las vistas hijas sepan dónde están
                if (projId) {
                    localStorage.setItem('tt_active_project', projId);
                }

                // Enrutamiento nativo del ecosistema V9
                if (action === 'go-kanban') triggerSPA('/v9/project');
                else if (action === 'go-vna') triggerSPA('/v9/edit');
                else if (action === 'go-create') triggerSPA('/v9/create');
                else if (action === 'go-lms') triggerSPA('/v9/lms');
            });
        });
    }

    destroy() {
        if (this.synapticInstance && this.synapticInstance.destroy) {
            this.synapticInstance.destroy();
        }
    }
}
