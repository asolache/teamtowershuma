// v5/js/views/DashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';

export default class DashboardView {
    constructor() {
        document.title = "Dashboard de Red | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        // Intentar recuperar el proyecto activo o el último creado
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex; height:100vh; background: var(--bg-dark);">
                        <div style="text-align:center; padding: 4rem; border: 1px dashed #333; border-radius: 20px; background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🛰️</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Frecuencia no detectada</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">Aún no has instanciado ninguna red en este Kernel.</p>
                             <a href="/v5/create" data-link class="btn-lux-primary" style="text-decoration:none; display:inline-block;">➕ Instanciar Proyecto</a>
                        </div>
                    </main>
                </div>
            `;
        }

        this.activeProjectId = project.id;
        const hasAccess = store.canUserViewProject(project.id, activeUserId, globalRole);
        
        if (!hasAccess) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex; background: var(--bg-dark);">
                        <div style="text-align:center; background: rgba(255, 82, 82, 0.05); border: 1px dashed var(--accent-red); padding: 4rem; border-radius: 20px; max-width: 600px; backdrop-filter: blur(10px);">
                            <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🔒</div>
                            <h1 style="color: var(--accent-red); margin-top:0; font-weight:900; letter-spacing:-1px;">ACCESO DENEGADO</h1>
                            <p style="color: #ccc; font-size:1.1rem;">Este Castell es privado. No eres un nodo reconocido en su Colla.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        // --- CÁLCULOS V10 ---
        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience(project.id);
        const isPO = project.ownerId === activeUserId || globalRole === 'ecosystem-owner';
        
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div class="status-ok">✅ Colla completa. Sin vacantes estructurales.</div>`
            : sillasVacias.map(r => `
                <div class="vacante-card">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="font-size:1.8rem; line-height:1; filter:drop-shadow(0 0 5px rgba(255,255,255,0.2));">${this.getIcon(r.levelId)}</div>
                        <div>
                            <div class="vacante-name">${r.name}</div>
                            <div class="vacante-meta">${r.levelId} | FMV: <span style="color:var(--accent-green); font-weight:bold;">${r.fmv}€/h</span></div>
                        </div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}">➕ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        
        // FIX: Variable Tags restaurada
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span class="badge-tag">#${t}</span>`).join('') 
            : `<span class="badge-tag">#VNA</span>`;
        
        // Integración del PageHeader
        const headerConfig = {
            title: project.nombre,
            subtitle: `<span style="font-size:0.65rem; padding:4px 10px; border-radius:12px; border:1px solid var(--accent-blue); color:var(--accent-blue); vertical-align:middle; margin-left:10px; text-transform:uppercase; background:rgba(0,176,255,0.05);">${project.archetype}</span>`,
            tagline: "Resumen Operativo y Cuadro de Mandos"
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; scroll-behavior: smooth;}
                
                /* =========================================================
                   WORKFLOW SCHEMA (EL CICLO DE VALOR) - GRID REPAIR
                   ========================================================= */
                .workflow-schema { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(5,5,8,0.9)); 
                    border: 1px solid var(--glass-border); 
                    border-radius: 20px; 
                    padding: 2.5rem; 
                    margin-bottom: 2rem; 
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
                }
                .schema-step { 
                    display: flex; flex-direction: column; align-items: center; 
                    text-decoration: none; text-align: center; gap: 12px; 
                    flex: 1; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
                    filter: grayscale(40%) opacity(0.8); position: relative; z-index: 2;
                }
                .schema-step:hover { transform: translateY(-5px); filter: grayscale(0%) opacity(1); }
                
                .s-icon { 
                    font-size: 2.5rem; 
                    line-height: normal;
                    overflow: visible; 
                    background: rgba(255,255,255,0.03); 
                    width: 75px; height: 75px; 
                    display: flex; justify-content: center; align-items: center; 
                    border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.4); 
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .schema-step:hover .s-icon { border-color: var(--accent-blue); box-shadow: 0 15px 30px rgba(0,176,255,0.2); }
                
                .s-text { color: white; font-weight: 900; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3;}
                .s-text span { color: var(--accent-blue); font-size: 0.75rem; font-family: var(--font-mono); display: block; margin-top: 4px; font-weight: normal;}
                
                .schema-arrow { 
                    color: rgba(255,255,255,0.1); font-size: 2rem; font-weight: bold; 
                    margin-top: 20px; display: flex; align-items: center; justify-content: center;
                }

                /* =========================================================
                   PRESENTACIÓN Y TAGS COMPACTOS
                   ========================================================= */
                .presentation-box { 
                    margin-bottom: 2rem; background: rgba(255,255,255,0.015); padding: 1.5rem 2rem; 
                    border-radius: 16px; border: 1px solid var(--glass-border); 
                    position: relative; border-left: 4px solid var(--accent-purple); backdrop-filter: blur(10px);
                }
                .presentation-text { color: #ccc; font-size: 1rem; line-height: 1.6; overflow: hidden; transition: max-height 0.4s ease; font-family: var(--font-main);}
                .presentation-text.collapsed { max-height: 75px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
                .btn-read-more { background: none; border: none; color: var(--accent-purple); font-weight: 900; cursor: pointer; padding: 10px 0 0 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;}
                .badge-tag { font-family: var(--font-mono); font-size: 0.7rem; color: #888; border: 1px solid #333; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; background: rgba(0,0,0,0.5); font-weight: bold;}

                /* =========================================================
                   KPIS COMPACTAS (DENSE GRID)
                   ========================================================= */
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; margin-bottom: 2.5rem; }
                .kpi-card { background: linear-gradient(145deg, rgba(0,0,0,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); padding: 1.5rem 1rem; border-radius: 16px; text-align: center; transition: 0.3s; box-shadow: inset 0 2px 10px rgba(255,255,255,0.01);}
                .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.1);}
                .kpi-val { font-size: 2.2rem; font-weight: 900; display: block; margin-bottom: 5px; font-family: var(--font-mono); line-height: 1;}
                .kpi-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                /* =========================================================
                   PANELES INFERIORES
                   ========================================================= */
                .content-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; }
                
                .panel-box { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; backdrop-filter: blur(10px);}
                .panel-title { color: white; margin-top: 0; font-size: 1.3rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;}
                
                /* VACANTES */
                .vacantes-list { max-height: 350px; overflow-y: auto; padding-right: 5px;}
                .vacante-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 1.2rem; border-radius: 12px; margin-bottom: 12px; transition: transform 0.2s;}
                .vacante-card:hover { transform: translateX(5px); border-color: #555; background: rgba(255,255,255,0.02);}
                .vacante-name { color: white; font-weight: 900; font-size: 1rem; letter-spacing: 0.5px;}
                .vacante-meta { font-size: 0.8rem; color: #888; font-family: var(--font-mono); margin-top: 4px; }
                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 900; transition: all 0.2s; text-transform: uppercase; letter-spacing: 1px;}
                .btn-invite:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.3);}

                /* BOTONES IA PREMIUM */
                .btn-ai-action { width: 100%; padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(224, 64, 251, 0.3); background: linear-gradient(145deg, rgba(15,10,20,0.8), rgba(0,0,0,0.9)); color: white; text-align: left; cursor: pointer; transition: all 0.3s; margin-bottom: 15px; position: relative; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.5);}
                .btn-ai-action::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: 0.5s; }
                .btn-ai-action:hover::before { left: 100%; }
                .btn-ai-action:hover { border-color: var(--accent-purple); transform: translateY(-3px); box-shadow: 0 15px 30px rgba(224,64,251,0.15);}
                .btn-ai-action strong { color: var(--accent-purple); display: block; font-size: 1.05rem; margin-bottom: 5px; font-weight: 900; letter-spacing: 0.5px;}
                .btn-ai-action span { color: #aaa; font-size: 0.85rem; line-height: 1.5; display: block;}

                .status-ok { padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; color: var(--accent-green); text-align: center; font-weight: bold; font-size: 0.95rem;}

                /* BOTONES GLOBALES */
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; padding: 12px 24px; font-weight: 900; border-radius: 10px; border:none; cursor: pointer; transition: 0.3s; font-size: 1rem; box-shadow: 0 5px 15px rgba(0,176,255,0.2);}
                .btn-lux-primary:hover { filter: brightness(1.2); box-shadow: 0 8px 25px rgba(224, 64, 251, 0.4); transform: translateY(-2px);}

                /* MODAL IA */
                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 4000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px);}
                .modal-ia-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 20px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-top: 4px solid var(--accent-purple);}
                .modal-ia-body { padding: 30px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; font-family: inherit;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                
                /* =========================================================
                   RESPONSIVE MOBILE (GRID IPAD/MOVIL)
                   ========================================================= */
                @media (max-width: 1100px) { 
                    .content-row { grid-template-columns: 1fr; } 
                    .kpi-grid { grid-template-columns: 1fr 1fr; } 
                }
                @media (max-width: 768px) {
                    .workspace { padding: 90px 1.2rem 3rem 1.2rem; }
                    
                    /* Grid 2x2 para el Workflow Schema */
                    .workflow-schema { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 2rem 1.5rem; 
                        padding: 2rem 1.5rem;
                        background: rgba(0,0,0,0.6);
                    }
                    .schema-arrow { display: none; } /* Ocultar flechas en grid */
                    .schema-step { filter: grayscale(0%) opacity(1); } /* Mejor visibilidad */
                    .s-icon { width: 60px; height: 60px; font-size: 2rem; border-radius: 16px; margin-bottom: 10px;}
                    .s-text { font-size: 0.8rem; }
                    .s-text span { font-size: 0.65rem; }

                    .panel-box { padding: 1.5rem; }
                    .vacante-card { flex-direction: column; align-items: stretch; gap: 15px;}
                    .btn-invite { width: 100%; padding: 12px; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="workflow-schema">
                        <a href="/v5/map" data-link class="schema-step" title="Diseña la topología de la red">
                            <div class="s-icon">🕸️</div>
                            <div class="s-text">1. Diseñar<br><span>(Mapa VNA)</span></div>
                        </a>
                        <div class="schema-arrow">→</div>
                        <a href="/v5/project" data-link class="schema-step" title="Pide y asigna trabajo">
                            <div class="s-icon">📋</div>
                            <div class="s-text">2. Asignar<br><span>(Kanban)</span></div>
                        </a>
                        <div class="schema-arrow">→</div>
                        <a href="/v5/focus" data-link class="schema-step" title="Ejecuta con Proof of Work">
                            <div class="s-icon">🍅</div>
                            <div class="s-text">3. Ejecutar<br><span>(Focus Mode)</span></div>
                        </a>
                        <div class="schema-arrow">→</div>
                        <a href="/v5/ledger" data-link class="schema-step" title="Acumula Slices inmutables">
                            <div class="s-icon">⚖️</div>
                            <div class="s-text">4. Cobrar<br><span>(Ledger Equity)</span></div>
                        </a>
                    </div>

                    <div class="presentation-box">
                        <div style="display:flex; gap: 10px; margin-bottom: 15px; flex-wrap:wrap;">
                            ${tagsHtml}
                        </div>
                        <div class="presentation-text collapsed" id="pitchText">
                            ${pitchText.replace(/\n/g, '<br>')}
                        </div>
                        <button class="btn-read-more" id="btnTogglePitch">Expandir Manifiesto ▾</button>
                    </div>

                    <section class="kpi-grid">
                        <div class="kpi-card" style="border-bottom: 3px solid var(--accent-green);">
                            <span class="kpi-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</span>
                            <span class="kpi-lbl">Slices Minados</span>
                        </div>
                        <div class="kpi-card" style="border-bottom: 3px solid var(--accent-blue);">
                            <span class="kpi-val" style="color: var(--accent-blue);">${totalHours.toFixed(1)}h</span>
                            <span class="kpi-lbl">Trabajo Auditado</span>
                        </div>
                        <div class="kpi-card" style="border-bottom: 3px solid ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">
                            <span class="kpi-val" style="color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">${resilience}%</span>
                            <span class="kpi-lbl">Salud Estructural</span>
                        </div>
                        <div class="kpi-card" style="border-bottom: 3px solid #888;">
                            <span class="kpi-val" style="color: white;">${project.usuarios ? project.usuarios.length : 1}</span>
                            <span class="kpi-lbl">Nodos Humanos</span>
                        </div>
                    </section>

                    <div class="content-row">
                        <div class="panel-box">
                            <h2 class="panel-title">🎯 Mercado Interno (Vacantes)</h2>
                            <p style="color:#888; font-size:0.85rem; margin-bottom:1.5rem; line-height:1.4;">Roles vitales diseñados en la arquitectura que aún no tienen un talento humano asignado.</p>
                            <div class="vacantes-list">
                                ${vacantesHtml}
                            </div>
                        </div>

                        <div class="panel-box" style="border-color: rgba(224, 64, 251, 0.3); background: linear-gradient(180deg, rgba(20, 10, 25, 0.8), rgba(10, 5, 15, 0.9));">
                            <h2 class="panel-title" style="color:var(--accent-purple);">🔮 Orquestador Legal IA</h2>
                            <p style="color:#aaa; font-size:0.85rem; margin-bottom:2rem; line-height:1.4;">Agentes cognitivos para auditar el estado del proyecto y emitir pactos de socios en tiempo real.</p>
                            
                            <button class="btn-ai-action" id="btnAIAuditor">
                                <strong>🧠 Auditoría VNA & Equity</strong>
                                <span>Analiza flujos, detecta cuellos de botella y evalúa el balance entre PoW y Capital.</span>
                            </button>

                            <button class="btn-ai-action" id="btnAILegal">
                                <strong>⚖️ Emitir Pacto de Socios</strong>
                                <span>Redacta un contrato legal dinámico desglosando la Cap Table basada en el Ledger.</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:20px 30px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.2rem; color:var(--accent-purple); font-weight:900; text-transform:uppercase; letter-spacing:1px;">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem; transition:0.2s;">✖</button>
                    </div>
                    <div class="modal-ia-body" id="aiModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid #333; display:flex; justify-content:flex-end; background:rgba(0,0,0,0.5);">
                        <button class="btn-lux-primary" id="btnDownloadPDF" style="display:none;">⬇️ DESCARGAR INFORME (.TXT)</button>
                    </div>
                </div>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
        
        if (!this.activeProjectId) return;
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);

        // -- LÓGICA ACORDEÓN PITCH --
        const pitchEl = document.getElementById('pitchText');
        const btnToggle = document.getElementById('btnTogglePitch');
        if (pitchEl && btnToggle) {
            btnToggle.addEventListener('click', () => {
                const isCollapsed = pitchEl.classList.contains('collapsed');
                pitchEl.classList.toggle('collapsed');
                btnToggle.innerText = isCollapsed ? 'Contraer Manifiesto ▴' : 'Expandir Manifiesto ▾';
            });
        }

        // -- INVITACIONES --
        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.target.getAttribute('data-rolename');
                const email = prompt(`Invitar mercenario para el rol [${roleName}]. Introduce su email o Wallet:`);
                if (email) {
                    alert(`Invitación enviada a ${email}. Pendiente de integración P2P.`);
                }
            });
        });

        // -- MÓDULO IA --
        const modal = document.getElementById('aiModal');
        const modalBody = document.getElementById('aiModalBody');
        const modalTitle = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');

        document.getElementById('aiModalClose').onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            if (provider !== 'custom' && !apiKey) return alert("⚠️ Configura tu API Key en Configuración Global antes de invocar al Orquestador.");

            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation: pulse 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Leyendo el Ledger Inmutable...</p></div>`;
            btnDownload.style.display = 'none';
            modalTitle.innerText = type === 'audit' ? 'Auditoría VNA & Equity' : 'Pacto de Socios (Slicing Pie)';

            // EXTRACCIÓN PROFUNDA V10
            const harvest = store.calculateHarvest(project.id) || [];
            const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
            
            let capTableDetails = ["El Ledger está vacío. Aún no se ha minado Equity (Slices)."];
            if (harvest.length > 0 && totalSlices > 0) {
                capTableDetails = harvest.map(h => {
                    const u = state.globalUsers?.find(gu => gu.id === (h.user || h.userId));
                    const userName = u ? u.name : (h.user || h.userId || 'Desconocido');
                    const percent = ((h.slices / totalSlices) * 100).toFixed(2);
                    return `- Socio: ${userName} | Participación: ${percent}% | Capital: ${Number(h.slices).toFixed(2)} Slices`;
                });
            }

            const realLedger = (project.ledger || []).map(l => {
                const u = state.globalUsers?.find(gu => gu.id === l.userId);
                const userName = u ? u.name : (l.userId || 'Sistema');
                const isCap = l.isCapital || l.roleId === 'capital' || String(l.entregable || l.description).includes('[Capital');
                
                if (isCap) {
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} inyectó CAPITAL FINANCIERO o IP ("${l.description || l.entregable}"). Slices generados: +${l.valorCongelado}.`;
                } else {
                    const role = project.roles?.find(r => r.id === l.roleId);
                    const roleName = role ? `${role.levelId} ${role.name}` : 'Aportación Operativa'; 
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} ejecutó TRABAJO (PoW) como ${roleName}. Entregable: "${l.description || l.entregable}" (${l.horas || 0}h). Slices generados: +${l.valorCongelado}.`;
                }
            });

            const allFlows = [...(project.vna_flows || []), ...(project.transactions || [])];
            const vnaFlows = allFlows.map(tx => {
                const roleFrom = project.roles.find(r => r.id === tx.from);
                const roleTo = project.roles.find(r => r.id === tx.to);
                const nameFrom = roleFrom ? `${roleFrom.name} (${roleFrom.levelId})` : 'Nodo Externo';
                const nameTo = roleTo ? `${roleTo.name} (${roleTo.levelId})` : 'Nodo Externo';
                return `[${(tx.tipo || 'tangible').toUpperCase()}] ${nameFrom} ---> ${tx.template || tx.entregable} (${tx.estimatedHours || tx.horas}h) ---> ${nameTo}`;
            });

            const dataPayload = {
                nombre_ecosistema: project.nombre,
                arquetipo_gobernanza: project.archetype,
                vision_fundacional: project.presentation || project.prompt || "Sin definir",
                nodos_activos_roles: project.roles.map(r => `- ${r.levelId}: ${r.name} (Guardián: ${r.guardian || 'N/A'} | Multiplicador de Riesgo: ${r.multiplier}x)`),
                flujos_vna_diseñados: vnaFlows.length > 0 ? vnaFlows : ["Sin flujos."],
                cap_table_actual: capTableDetails,
                registro_aportaciones_reales: realLedger.length > 0 ? realLedger : ["No hay transacciones registradas en el ledger todavía."]
            };

            let systemPrompt = state.config?.globalPrompt || "Eres un Master Architect de DAOs.";
            
            if (type === 'audit') {
                systemPrompt += `\nMisión: Eres un Auditor VNA y experto en economía Slicing Pie.
                REGLAS CRÍTICAS DEL MODELO DE EQUIDAD:
                1. El modelo premia el RIESGO. Las inyecciones de CAPITAL asumen máximo riesgo y generan grandes Slices. Es legítimo, nunca lo consideres desproporcionado.
                2. El TRABAJO asume riesgo de tiempo.
                INSTRUCCIONES: Revisa el 'registro_aportaciones_reales' y la 'cap_table_actual'. Identifica nodos inversores vs operativos. Evalúa si hay un buen equilibrio o cuellos de botella. Formato texto plano legible.`;
            } else {
                systemPrompt += `\nMisión: Eres un Abogado Notarial Web3 experto en Slicing Pie.
                Redacta un "Pacto de Socios" formal basado estrictamente en los datos recibidos.
                1. Menciona la Visión Fundacional.
                2. Usa la "cap_table_actual" para la cláusula de PARTICIPACIÓN ACTUAL.
                3. Usa el "registro_aportaciones_reales" para un Anexo desglosando de dónde salen los Slices de cada socio (Capital vs Trabajo). Formato notarial, texto claro.`;
            }

            try {
                let text = "";
                if (provider === 'deepseek') {
                    const res = await fetch(`https://api.deepseek.com/chat/completions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: "deepseek-chat",
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }]
                        })
                    });
                    if (!res.ok) throw new Error("Error en API DeepSeek");
                    const data = await res.json();
                    text = data.choices[0].message.content;
                } else if (provider === 'openai') {
                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: "gpt-4o-mini",
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }]
                        })
                    });
                    if (!res.ok) throw new Error("Error en API OpenAI");
                    const data = await res.json();
                    text = data.choices[0].message.content;
                } else if (provider === 'gemini') {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nJSON: ${JSON.stringify(dataPayload)}` }] }] })
                    });
                    if (!res.ok) throw new Error("Error en API Gemini");
                    const data = await res.json();
                    text = data.candidates[0].content.parts[0].text;
                } else if (provider === 'custom') {
                    const customUrl = localStorage.getItem('tt_ai_custom_url') || 'http://localhost:1234/v1/chat/completions';
                    const res = await fetch(customUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ prompt: systemPrompt, data: dataPayload })
                    });
                    if (!res.ok) throw new Error("Error en Endpoint Custom");
                    const data = await res.json();
                    text = typeof data === 'string' ? data : JSON.stringify(data);
                }

                modalBody.innerHTML = `<div style="white-space:pre-wrap; font-family:var(--font-main);">${text.replace(/\n/g, '<br>')}</div>`;
                
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const b = new Blob([text], {type:"text/plain"});
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href=u; a.download=`${type}_${project.nombre.replace(/ /g,'_')}.txt`; a.click();
                };
            } catch (e) { 
                modalBody.innerHTML = `
                    <div style="text-align:center; padding:2rem;">
                        <div style="font-size:3rem; margin-bottom:1rem;">⚠️</div>
                        <h3 style="color:var(--accent-red);">Fallo de Conexión Neural</h3>
                        <p style="color:#888;">${e.message}</p>
                    </div>`; 
            }
        };

        document.getElementById('btnAIAuditor')?.addEventListener('click', () => runAI('audit'));
        document.getElementById('btnAILegal')?.addEventListener('click', () => runAI('legal'));
    }
}
