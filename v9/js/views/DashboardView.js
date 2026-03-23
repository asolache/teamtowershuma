// v9/js/views/DashboardView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { MapRenderer } from '../components/MapRenderer.js'; 
import { LedgerRenderer } from '../components/LedgerRenderer.js'; 
import { Orchestrator } from '../core/Orchestrator.js'; 

export default class DashboardView {
    constructor() {
        document.title = "Dashboard de Red | TeamTowers V9";
        this.activeProjectId = null;
        this.currentTab = 'overview';
    }

    async getHtml() {
        await store.init();

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                        <div class="glass-panel" style="text-align:center; padding: 4rem; max-width: 500px;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1; filter: drop-shadow(0 0 20px rgba(0,176,255,0.3));">🛰️</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Radar Vacío</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">Aún no has instanciado ninguna red en este Kernel.</p>
                             <a href="/v9/create" data-link class="btn-primary" style="text-decoration:none;">➕ Instanciar Proyecto</a>
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
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                        <div class="glass-panel" style="text-align:center; border: 1px dashed var(--accent-red); padding: 4rem; max-width: 600px; background: rgba(255, 82, 82, 0.05);">
                            <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🔒</div>
                            <h1 style="color: var(--accent-red); margin-top:0; font-weight:900; letter-spacing:-1px;">ACCESO DENEGADO</h1>
                            <p style="color: #ccc; font-size:1.1rem;">Este Ecosistema es privado. No eres un nodo reconocido en su topología.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.totalSlices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience ? store.calculateResilience(project.id) : (project.vna_flows?.length > 3 ? 95 : 60);
        
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        let aiGrossValue = 0; 
        let realApiCost = 0;  
        let totalTokens = 0;

        (project.ledger || []).forEach(tx => {
            const user = state.globalUsers.find(u => u.id === tx.userId);
            if (user && user.profile?.isAi) {
                aiGrossValue += (tx.fmv || 50) * (tx.multiplier || 1) * (tx.horas || 1); 
            }
        });

        if (project.telemetry && project.telemetry.length > 0) {
            project.telemetry.forEach(log => {
                realApiCost += log.costInDollars || 0;
                totalTokens += (log.tokens?.total_tokens || log.tokens?.prompt_tokens + log.tokens?.completion_tokens) || 0;
            });
        }
        const recRatio = realApiCost > 0 ? (aiGrossValue / realApiCost) : 0;
        
        const projectUsers = project.usuarios || [];
        const aisInProject = projectUsers.map(u => state.globalUsers.find(gu => gu.id === u.id)).filter(u => u && u.profile?.isAi);
        const aiAvatarsHtml = aisInProject.length > 0 
            ? aisInProject.map(ai => `<div class="ai-avatar-badge" title="${ai.name} (${ai.id})">🤖</div>`).join('')
            : `<div style="color:#888; font-size:0.8rem; font-style:italic;">No hay Agentes IA en la Colla.</div>`;

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div style="padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; color: var(--accent-green); text-align: center; font-weight: bold;">✅ Arquitectura completa. Sin vacantes estructurales.</div>`
            : sillasVacias.map(r => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: 12px; margin-bottom: 12px; transition: 0.3s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--glass-border)'">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="font-size:1.8rem; line-height:1; filter:drop-shadow(0 0 5px rgba(255,255,255,0.2));">${this.getIcon(r.levelId)}</div>
                        <div>
                            <div style="color: white; font-weight: 900; font-size: 1rem;">${r.name}</div>
                            <div style="font-size: 0.8rem; color: #888; font-family: var(--font-mono); margin-top: 4px;">${r.levelId} | FMV: <span style="color:var(--accent-green); font-weight:bold;">${r.fmv}€/h</span></div>
                        </div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}" style="background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 900; transition: all 0.2s; text-transform: uppercase;">➕ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span style="font-family: var(--font-mono); font-size: 0.7rem; color: #888; border: 1px solid #333; padding: 4px 10px; border-radius: 6px; background: rgba(0,0,0,0.5);">#${t}</span>`).join('') 
            : `<span style="font-family: var(--font-mono); font-size: 0.7rem; color: #888; border: 1px solid #333; padding: 4px 10px; border-radius: 6px; background: rgba(0,0,0,0.5);">#VNA</span>`;
        
        const headerConfig = {
            title: project.nombre,
            subtitle: project.archetype, 
            tagline: "Ojo del Castell (Centro de Mando)",
            tabs: [
                { id: 'overview', label: '📊 Resumen Operativo', active: this.currentTab === 'overview' },
                { id: 'market', label: '🎯 Mercado Interno', active: this.currentTab === 'market', badge: sillasVacias.length || null },
                { id: 'settings', label: '⚙️ Configuración', active: this.currentTab === 'settings' }
            ],
            magicActions: [
                { id: 'audit', label: 'Auditoría VNA & Equity', icon: '🧠', isAi: true, tokens: 150 },
                { id: 'legal', label: 'Emitir Pacto Socios', icon: '⚖️', isAi: true, tokens: 300 }
            ]
        };

        return `
            <style>
                ${MapRenderer.getStyles()}
                ${LedgerRenderer.getStyles()}

                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-dash { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .dash-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; margin-bottom: 2.5rem; align-items: start;}
                
                .dash-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(15px); display: flex; flex-direction: column; height: 100%; box-sizing: border-box;}
                .panel-title { color: white; font-size: 1.2rem; font-weight: 900; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; display:flex; justify-content:space-between; align-items:center; text-transform:uppercase; letter-spacing:1px;}
                
                .presentation-text { color: #ccc; font-size: 1rem; line-height: 1.6; font-style: italic; border-left: 3px solid var(--accent-purple); padding-left: 15px; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 10; -webkit-box-orient: vertical; overflow: hidden;}
                
                .btn-open-paper { background: linear-gradient(135deg, rgba(224,64,251,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-purple); color: white; padding: 12px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; display:flex; justify-content:center; align-items:center; gap:10px; width: 100%; font-size: 0.95rem; margin-bottom: 10px;}
                .btn-open-paper:hover { background: var(--accent-purple); box-shadow: 0 0 20px rgba(224,64,251,0.4); transform: translateY(-2px);}
                
                .btn-evolve { background: transparent; border: 1px dashed var(--accent-orange); color: var(--accent-orange); padding: 10px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; width: 100%; font-size: 0.85rem;}
                .btn-evolve:hover { background: rgba(255, 171, 64, 0.1); }

                .mini-map-container { width: 100%; height: 300px; position: relative; border-radius:16px; border:1px solid #333; overflow:hidden; margin-bottom: 2rem;}

                .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }
                .kpi-card { background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); padding: 1.5rem 1rem; border-radius: 16px; text-align: center; transition: 0.3s; }
                .kpi-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.02); }
                .kpi-val { font-size: 2.2rem; font-weight: 900; display: block; margin-bottom: 5px; font-family: var(--font-mono); line-height: 1;}
                .kpi-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                .ai-arbitrage-panel { background: rgba(0,0,0,0.4); border: 1px dashed var(--accent-blue); padding: 1.5rem; border-radius: 16px; display: flex; flex-direction:column; gap: 15px;}
                .ai-stat-row { display: flex; align-items: center; justify-content: space-between;}
                .ai-stat-lbl { font-size: 0.7rem; color: #aaa; text-transform: uppercase; font-weight: bold;}
                .ai-stat-val { font-size: 1.4rem; font-weight: 900; font-family: var(--font-mono); color: white; }
                .ai-avatar-badge { width: 35px; height: 35px; border-radius: 50%; background: var(--accent-purple); display:flex; justify-content:center; align-items:center; font-size: 1.2rem; border: 2px solid #111; margin-left: -10px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);}
                .ai-avatar-badge:first-child { margin-left: 0; }

                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 4000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px);}
                .modal-ia-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 20px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-top: 4px solid var(--accent-purple);}
                
                @media (max-width: 1024px) { .dash-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) { .workspace-dash { padding: 90px 1rem 120px 1rem; } .dash-panel { padding: 1.5rem; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace-dash">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-overview" class="tab-content ${this.currentTab === 'overview' ? 'active' : ''}">
                        <div class="dash-grid">
                            <div>
                                <div class="dash-panel" style="border-top: 4px solid var(--accent-purple); margin-bottom: 2rem;">
                                    <div class="panel-title"><span>📖 Propósito Fundacional</span> <div style="display:flex; gap:5px;">${tagsHtml}</div></div>
                                    <div class="presentation-text" id="pitchText">${pitchText.replace(/\n/g, '<br>')}</div>
                                    
                                    <button class="btn-open-paper" id="btnOpenPaper">📝 Desarrollar en Omni-Paper (Usenet)</button>
                                    <button class="btn-evolve" id="btnEvolveVision">✨ Meta-Cognición: Evolucionar Ecosistema (@genesi_ai)</button>
                                </div>

                                <div class="dash-panel" style="border-top: 4px solid var(--accent-blue); padding:0;">
                                    <div class="panel-title" style="padding: 2rem 2rem 0 2rem; border:none; margin-bottom:1rem;">🕸️ Topología del Ecosistema</div>
                                    <div class="mini-map-container" id="dashMapContainer">
                                        <div class="map-canvas map-svg-layer" id="dashMapCanvas">
                                            <svg id="dashMapSvg">
                                                <defs>
                                                    <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                                    <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                                </defs>
                                                <g id="dashMapPaths"></g>
                                            </svg>
                                        </div>
                                    </div>
                                    <div style="padding: 0 2rem 2rem 2rem;">
                                        <a href="/v9/map" data-link style="color:var(--accent-blue); font-size:0.9rem; text-decoration:none; font-weight:bold;">Modificar Arquitectura &rarr;</a>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="dash-panel" style="border-top: 4px solid var(--accent-green); margin-bottom: 2rem;">
                                    <div class="panel-title">🤖 Enjambre IA Activo</div>
                                    <div style="display:flex; margin-bottom:1rem;">
                                        ${aiAvatarsHtml}
                                    </div>
                                    <div class="ai-arbitrage-panel">
                                        <div class="ai-stat-row">
                                            <span class="ai-stat-lbl">Tokens Consumidos</span>
                                            <span class="ai-stat-val" style="color:var(--accent-blue);">${(totalTokens / 1000).toFixed(1)}k</span>
                                        </div>
                                        <div class="ai-stat-row">
                                            <span class="ai-stat-lbl">Gasto API (USD)</span>
                                            <span class="ai-stat-val" style="color:var(--accent-red);">$${realApiCost.toFixed(4)}</span>
                                        </div>
                                        <div class="ai-stat-row" style="border-top: 1px dashed #444; padding-top: 15px; margin-top: 5px;">
                                            <span class="ai-stat-lbl" style="color:var(--accent-green);">Valor (Slices) IA</span>
                                            <span class="ai-stat-val" style="color:var(--accent-green);">€${aiGrossValue.toLocaleString()}</span>
                                        </div>
                                        <div class="ai-stat-row">
                                            <span class="ai-stat-lbl" style="color:var(--accent-purple);">Ratio (REC)</span>
                                            <span class="ai-stat-val" style="color:var(--accent-purple);">${recRatio > 0 ? recRatio.toFixed(0) + 'x' : '0'}</span>
                                        </div>
                                    </div>
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
                                        <span class="kpi-lbl">Nodos en Colla</span>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div class="dash-panel" style="border-top: 4px solid var(--accent-green); padding:0; overflow:hidden;">
                            <div class="panel-title" style="padding: 2rem 2rem 0 2rem; border:none; margin-bottom:1rem;">⚖️ Distribución de Equidad</div>
                            <div id="dashLedgerContainer" style="padding: 0 2rem 2rem 2rem;"></div>
                            <div style="background: rgba(0,230,118,0.1); padding: 15px 2rem; text-align:right;">
                                <a href="/v9/ledger" data-link style="color:var(--accent-green); font-size:0.9rem; text-decoration:none; font-weight:bold;">Ir a la Notaría (Ledger Completo) &rarr;</a>
                            </div>
                        </div>
                    </div>

                    <div id="tab-market" class="tab-content ${this.currentTab === 'market' ? 'active' : ''}">
                        <div class="glass-panel" style="padding:3rem;">
                            <h2 style="color: white; margin-top: 0; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-weight: 900; text-transform: uppercase;">🎯 Mercado Interno (Vacantes)</h2>
                            <p style="color:#888; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">Roles vitales diseñados en la arquitectura que aún no tienen un talento humano o IA asignado.</p>
                            <div>${vacantesHtml}</div>
                        </div>
                    </div>

                    <div id="tab-settings" class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}">
                         <div class="glass-panel" style="padding:3rem; text-align:center;">
                            <h2 style="color: var(--text-muted); margin-top:0;">Módulo de Configuración de Red</h2>
                            <p style="color:#888;">Gobernanza, APIs multimodales y Padrón gestionados en la Consola Global.</p>
                            <a href="/v9/settings" data-link class="btn-primary" style="display:inline-block; margin-top:2rem; text-decoration:none;">Ir al Panteón Global</a>
                         </div>
                    </div>
                </main>
            </div>

            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:20px 30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.2rem; color:var(--accent-purple); font-weight:900; text-transform:uppercase; letter-spacing:1px;">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem; transition:0.2s;">✖</button>
                    </div>
                    <div style="padding: 30px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.7; white-space: pre-wrap;" id="aiModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; gap: 15px; background:rgba(0,0,0,0.5);">
                        <button class="btn-primary" id="btnAcceptEvolution" style="display:none; background:var(--accent-green); color:black; border:none; padding:10px 20px; border-radius:12px; font-weight:bold; cursor:pointer;">✅ Aplicar y Aprender (Meta-Cognición)</button>
                        <button class="btn-primary" id="btnDownloadPDF" style="display:none; background:var(--accent-purple); color:white; border:none; padding:10px 20px; border-radius:12px; font-weight:bold; cursor:pointer;">⬇️ DESCARGAR INFORME (.TXT)</button>
                    </div>
                </div>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        if (!this.activeProjectId) return;
        
        Sidebar.initListeners();
        PageHeader.execute();
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if(!project) return;

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        const dashMapCanvas = document.getElementById('dashMapCanvas');
        const dashMapPaths = document.getElementById('dashMapPaths');
        if (dashMapCanvas && dashMapPaths && project.roles) {
            const mr = new MapRenderer(dashMapCanvas, dashMapPaths, { 
                isMacro: true, isHeatmap: false, markerSuffix: 'vis', trimSize: 20
            });
            mr.setData(project.roles, project.vna_flows || []);
        }

        const dashLedgerContainer = document.getElementById('dashLedgerContainer');
        if (dashLedgerContainer) {
            const lr = new LedgerRenderer(dashLedgerContainer, { projectId: project.id, showHistory: false });
            lr.render();
        }

        const btnOpenPaper = document.getElementById('btnOpenPaper');
        if (btnOpenPaper) {
            btnOpenPaper.addEventListener('click', async () => {
                const newHash = 'wo_research_' + Math.random().toString(36).substr(2, 9);
                await store.dispatch({
                    type: 'SPAWN_WORK_ORDER',
                    payload: {
                        projectId: this.activeProjectId,
                        workOrder: {
                            hash: newHash, flowId: null, status: 'pinged', realHours: 0, sprintId: project.activeSprintId,
                            comentario: `Investigación y Desarrollo del Manifiesto / Prompt del proyecto.`,
                            soc_checklist: [], assigneeId: state.session.activeUserId 
                        }
                    }
                });
                window.location.href = `/v9/paper?hash=${newHash}`;
            });
        }

        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.target.getAttribute('data-rolename');
                const email = prompt(`Invitar mercenario o Agente IA para el rol [${roleName}]. Introduce email o Alias (@id):`);
                if (email) alert(`Invitación enviada a ${email}. Pendiente de integración P2P.`);
            });
        });

        // =========================================================
        // 🔥 LÓGICA DE ORÁCULOS IA & META-COGNICIÓN
        // =========================================================
        const modal = document.getElementById('aiModal');
        const modalBody = document.getElementById('aiModalBody');
        const modalTitle = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');
        const btnAcceptEvo = document.getElementById('btnAcceptEvolution');
        const modalCloseBtn = document.getElementById('aiModalClose');

        // Variable global para almacenar el JSON procesado si es el modo Evolución
        let latestEvolutionData = null;

        if (modalCloseBtn) modalCloseBtn.onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            if (!modal) return;
            
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            if (provider !== 'custom' && !apiKey) return alert("⚠️ Configura tu API Key en la Consola (Pantheon) antes de invocar al Orquestador.");

            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation: pulse 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Analizando el Córtex del Proyecto...</p></div>`;
            btnDownload.style.display = 'none';
            btnAcceptEvo.style.display = 'none';
            
            let titleText = 'Procesando...';
            if (type === 'audit') titleText = 'Auditoría VNA & Equity';
            if (type === 'legal') titleText = 'Pacto de Socios (Slicing Pie)';
            if (type === 'evolve') titleText = 'Meta-Cognición: Evolución del Proyecto';
            modalTitle.innerText = titleText;

            const harvest = store.calculateHarvest(project.id) || [];
            const totalSlices = harvest.reduce((sum, h) => sum + h.totalSlices, 0);
            
            let capTableDetails = ["El Ledger está vacío."];
            if (harvest.length > 0 && totalSlices > 0) {
                capTableDetails = harvest.map(h => {
                    const u = store.getState().globalUsers?.find(gu => gu.id === (h.user || h.userId));
                    const userName = u ? u.name : (h.user || h.userId || 'Desconocido');
                    return `- Nodo: ${userName} | Equidad: ${((h.totalSlices / totalSlices) * 100).toFixed(2)}%`;
                });
            }

            const dataPayload = {
                nombre_ecosistema: project.nombre,
                arquetipo_gobernanza: project.archetype,
                vision_actual: project.presentation || project.prompt || "Sin definir",
                roles_y_tuberias: `Roles: ${project.roles.length}. Flujos Activos: ${project.vna_flows.length}`,
                work_orders_completadas: project.work_orders.filter(w => w.status === 'consolidated').length,
                horas_invertidas: (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0),
                cap_table: capTableDetails
            };

            let systemPrompt = "Eres un Master Architect de Ecosistemas VNA.";
            let isEvolveMode = false;

            if (type === 'audit') {
                systemPrompt += `\nEvalúa si la topología y distribución de Slices refleja un ecosistema sano basado en la teoría Slicing Pie.`;
            } else if (type === 'legal') {
                systemPrompt += `\nRedacta un Pacto de Socios formal (Smart Contract / Legal Draft) basado en el Cap Table adjunto.`;
            } else if (type === 'evolve') {
                isEvolveMode = true;
                // 🔥 EL BUCLE META-COGNITIVO
                systemPrompt += `
                    El proyecto ha avanzado. Evalúa el "Data Payload" actual y tu objetivo es la META-OPTIMIZACIÓN.
                    Devuelve UNICAMENTE un objeto JSON estricto con las siguientes claves:
                    1. "new_vision": Versión mejorada, expandida y técnica de la visión fundacional basándote en el progreso.
                    2. "optimized_genesi_prompt": Un nuevo System Prompt detallado para ti mismo (@genesi_ai). Debe contener instrucciones mucho más precisas sobre cómo mapear mejor los roles, flujos tangibles/intangibles, SOPs y SOCs para ESTE proyecto específico en futuros Sprints.
                    3. "soc_reliability_assessment": Análisis cualitativo. ¿Los SOCs actuales son lo suficientemente deterministas para ser auditados por una IA (@notari_ledger), o son ambiguos y requieren que un humano intervenga como auditor?
                    4. "recommendation": ¿Mantener como proceso continuo o iniciar fase de cierre?
                `;
            }

            try {
                const responseFormat = isEvolveMode ? "json_object" : "text";
                const response = await Orchestrator.callLLM({ 
                    provider, apiKey, 
                    systemPrompt, 
                    userPrompt: `Data Payload: ${JSON.stringify(dataPayload)}`, 
                    responseFormat: responseFormat, 
                    temperature: isEvolveMode ? 0.3 : 0.2 // Más bajo en JSON para evitar alucinaciones sintácticas
                });
                
                if (isEvolveMode) {
                    latestEvolutionData = response.content;
                    
                    modalBody.innerHTML = `
                        <div style="font-family:var(--font-main);">
                            <h3 style="color:var(--accent-blue);">1. Nueva Visión Fundacional</h3>
                            <p style="background:rgba(0,176,255,0.1); padding:15px; border-left:3px solid var(--accent-blue); border-radius:8px;">${latestEvolutionData.new_vision}</p>
                            
                            <h3 style="color:var(--accent-purple); margin-top:20px;">2. Upgrade de Mapeo (Nuevo Prompt para Gènesi)</h3>
                            <p style="background:rgba(224,64,251,0.1); padding:15px; border-left:3px solid var(--accent-purple); border-radius:8px; font-family:var(--font-mono); font-size:0.85rem;">${latestEvolutionData.optimized_genesi_prompt}</p>
                            
                            <h3 style="color:var(--accent-orange); margin-top:20px;">3. Fiabilidad de Auditoría SOC (IA vs Humano)</h3>
                            <p style="background:rgba(255,171,64,0.1); padding:15px; border-left:3px solid var(--accent-orange); border-radius:8px;">${latestEvolutionData.soc_reliability_assessment}</p>
                            
                            <h3 style="color:var(--accent-green); margin-top:20px;">4. Recomendación de Ciclo de Vida</h3>
                            <p style="background:rgba(0,230,118,0.1); padding:15px; border-left:3px solid var(--accent-green); border-radius:8px; font-weight:bold;">${latestEvolutionData.recommendation}</p>
                        </div>
                    `;
                    
                    btnAcceptEvo.style.display = 'block';
                    btnAcceptEvo.onclick = async () => {
                        btnAcceptEvo.innerText = "⏳ Inyectando nueva visión y actualizando Córtex...";
                        btnAcceptEvo.disabled = true;
                        
                        // 1. Guardar nueva presentación en Redux
                        await store.dispatch({
                            type: 'UPDATE_PROJECT_INFO',
                            payload: { projectId: this.activeProjectId, updates: { presentation: latestEvolutionData.new_vision } }
                        });

                        // 2. 🔥 META-COGNICIÓN: Guardar el nuevo prompt mejorado en IndexedDB para el Orquestador
                        await KB.init();
                        await KB.saveNode({
                            id: `prompt_project_genesi_vna_${this.activeProjectId}`,
                            type: 'prompt_a2a',
                            projectId: this.activeProjectId,
                            targetId: '@genesi_ai',
                            roleTarget: 'Meta-Architect',
                            title: `Prompt Evolucionado: Gènesi (${project.nombre})`,
                            content: latestEvolutionData.optimized_genesi_prompt,
                            keywords: ['#meta_learning', '#evolution', this.activeProjectId]
                        });

                        alert("✅ La visión del ecosistema ha evolucionado y el cerebro de Gènesi ha sido actualizado con el nuevo Prompt de Mapeo.");
                        window.location.reload();
                    };
                } else {
                    const text = response.content;
                    modalBody.innerHTML = `<div style="font-family:var(--font-main);">${text.replace(/\n/g, '<br>')}</div>`;
                    
                    btnDownload.style.display = 'block';
                    btnDownload.onclick = () => {
                        const a = document.createElement('a'); 
                        a.href = URL.createObjectURL(new Blob([text], {type:"text/plain"})); 
                        a.download = `${type}_${project.nombre.replace(/ /g,'_')}.txt`; 
                        a.click();
                    };
                }
            } catch (e) { 
                modalBody.innerHTML = `<div style="text-align:center; padding:2rem;"><div style="font-size:3rem; margin-bottom:1rem;">⚠️</div><h3 style="color:var(--accent-red);">Fallo Neural</h3><p style="color:#888;">${e.message}</p></div>`; 
            }
        };

        window.addEventListener('ph-magic-action', (e) => {
            if (e.detail.actionId === 'audit') runAI('audit');
            if (e.detail.actionId === 'legal') runAI('legal');
        });

        document.getElementById('btnEvolveVision')?.addEventListener('click', () => {
            runAI('evolve');
        });
    }
}
