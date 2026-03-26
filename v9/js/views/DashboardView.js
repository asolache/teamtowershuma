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
        document.title = "Ojo del Castell | TeamTowers V9";
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
            project = state.projects.filter(p => !p.isArchived)[0] || state.projects[0];
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex; background: radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%);">
                        <div class="glass-panel" style="text-align:center; padding: 5rem; max-width: 600px; border: 1px solid rgba(0,176,255,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,176,255,0.05);">
                             <div style="font-size: 6rem; margin-bottom: 2rem; line-height:1; filter: drop-shadow(0 0 30px rgba(0,176,255,0.6));">🌌</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2.5rem; letter-spacing:-1px;">Radar Despejado</h2>
                             <p style="color:#aaa; margin-bottom: 3rem; font-size:1.1rem; line-height:1.6;">El Kernel está listo. Eres el Master Architect. No hay ningún ecosistema instanciado en tu memoria local.</p>
                             <a href="/v9/create" data-link class="btn-primary" style="text-decoration:none; font-size:1.2rem; padding:15px 30px; background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border:none; box-shadow: 0 10px 20px rgba(0,176,255,0.3); border-radius: 12px; color: white; font-weight: bold;">⚡ Forjar Primer Ecosistema</a>
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

        // --- CÁLCULOS CORE V9 ANTIGRAVITY ---
        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.totalSlices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience ? store.calculateResilience(project.id) : (project.vna_flows?.length > 3 ? 95 : 60);
        
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));
        const tareasPendientes = (project.work_orders || []).filter(w => w.status !== 'consolidated' && w.status !== 'rejected').length;

        // --- INSIGHTS ESTRATÉGICOS (UX) ---
        let insightMessage = "";
        let insightColor = "var(--accent-blue)";
        if (project.isArchived) {
            insightMessage = `🗄️ MODO CRIPTA: Este ecosistema está archivado. Es de solo lectura para preservar el Proof of Work.`;
            insightColor = "#888888";
        } else if (sillasVacias.length > 0) {
            insightMessage = `Tienes ${sillasVacias.length} roles estructurales vacíos. Ve al Mercado Interno para asignar Humanos o IAs.`;
            insightColor = "var(--accent-orange)";
        } else if (project.vna_flows.length === 0) {
            insightMessage = "La topología VNA está vacía. Entra en el mapa y forja los flujos de valor entre los roles.";
            insightColor = "var(--accent-red)";
        } else if (tareasPendientes > 0) {
            insightMessage = `Hay ${tareasPendientes} Work Orders activas en la red. El ecosistema está en movimiento.`;
            insightColor = "var(--accent-green)";
        } else {
            insightMessage = "Red operativa. Ve al Omni-Paper para inyectar nuevas tareas en el Kanban.";
            insightColor = "var(--accent-purple)";
        }

        // --- CÁLCULO DE TELEMETRÍA Y ECONOMÍA ANTIGRAVITY ---
        let aiGrossValue = 0; 
        let realApiCost = 0;  
        let totalTokens = 0;
        let humanEquivalentCost = 0;

        (project.ledger || []).forEach(tx => {
            const user = state.globalUsers.find(u => u.id === tx.userId);
            const valueGenerated = (tx.fmv || 50) * (tx.multiplier || 1) * (tx.horas || 1);
            
            if (user && user.profile?.isAi) {
                aiGrossValue += valueGenerated; 
            } else {
                humanEquivalentCost += valueGenerated;
            }
        });

        if (project.telemetry && project.telemetry.length > 0) {
            project.telemetry.forEach(log => {
                realApiCost += log.costInDollars || 0;
                totalTokens += (log.tokens?.total_tokens || log.tokens?.prompt_tokens + log.tokens?.completion_tokens) || 0;
            });
        }
        
        const recRatio = realApiCost > 0 ? (aiGrossValue / realApiCost) : 0;
        const hypotheticalHumanCost = aiGrossValue > 0 ? aiGrossValue : 0; 
        const savingsPercent = hypotheticalHumanCost > 0 ? ((hypotheticalHumanCost - realApiCost) / hypotheticalHumanCost * 100).toFixed(2) : 0;

        const projectUsers = project.usuarios || [];
        const aisInProject = projectUsers.map(u => state.globalUsers.find(gu => gu.id === u.id)).filter(u => u && u.profile?.isAi);
        const aiEngines = new Set(aisInProject.map(ai => ai.profile?.preferredEngine || 'openai'));
        
        const getEngineIcon = (engine) => {
            switch(engine) {
                case 'deepseek': return '🐋';
                case 'openai': return '🧠';
                case 'gemini': return '✨';
                case 'anthropic': return '🦉';
                default: return '🤖';
            }
        };

        const aiAvatarsHtml = aisInProject.length > 0 
            ? Array.from(aiEngines).map(engine => `<div class="ai-avatar-badge" title="${engine}">${getEngineIcon(engine)}</div>`).join('')
            : `<div style="color:#888; font-size:0.8rem; font-style:italic;">Red puramente Humana. Cero IAs.</div>`;

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div class="insight-banner success">✅ Arquitectura completa. Sin vacantes estructurales. Todos los roles están cubiertos.</div>`
            : sillasVacias.map(r => `
                <div class="vacante-card">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div class="vacante-icon">${this.getIcon(r.levelId)}</div>
                        <div>
                            <div class="vacante-name">${r.name}</div>
                            <div class="vacante-meta">${r.levelId} | FMV: <span>${r.fmv}€/h</span></div>
                        </div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}">➕ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span class="badge-tag">#${t}</span>`).join('') 
            : `<span class="badge-tag">#VNA</span>`;

        // 🔥 HTML DE LA CRIPTA (Proyectos Históricos y Activos)
        const renderProjectRow = (p) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border:1px solid #333; background:rgba(0,0,0,0.4); border-radius:12px; margin-bottom:10px;">
                <div>
                    <div style="color:white; font-weight:900; font-size:1.1rem;">${p.isArchived ? '🗄️' : '🚀'} ${p.nombre}</div>
                    <div style="color:#888; font-size:0.8rem; font-family:var(--font-mono); margin-top:5px;">${p.roles?.length || 0} Roles | ${p.work_orders?.length || 0} Entregables</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-ghost btn-toggle-archive" data-id="${p.id}" data-action="${p.isArchived ? 'unarchive' : 'archive'}" style="width:auto; padding:8px 15px;">
                        ${p.isArchived ? '✨ Desarchivar' : '📦 Archivar'}
                    </button>
                </div>
            </div>
        `;

        const activeProjectsHtml = state.projects.filter(p => !p.isArchived).map(renderProjectRow).join('') || '<div style="color:#666; font-style:italic;">No hay proyectos activos.</div>';
        const archivedProjectsHtml = state.projects.filter(p => p.isArchived).map(renderProjectRow).join('') || '<div style="color:#666; font-style:italic;">La cripta está vacía.</div>';
        
        const headerConfig = {
            title: project.isArchived ? `[ARCHIVADO] ${project.nombre}` : project.nombre,
            subtitle: project.archetype, 
            tagline: "Ojo del Castell (Centro de Mando Antigravity)",
            tabs: [
                { id: 'overview', label: '📊 Resumen Operativo', active: this.currentTab === 'overview' },
                { id: 'market', label: '🎯 Mercado Interno', active: this.currentTab === 'market', badge: sillasVacias.length || null },
                { id: 'archive', label: '🗄️ Archivo Histórico', active: this.currentTab === 'archive' },
                { id: 'settings', label: '⚙️ Configuración', active: this.currentTab === 'settings' }
            ],
            magicActions: project.isArchived ? [] : [
                { id: 'audit', label: 'Auditoría VNA & Equity', icon: '🧠', isAi: true, tokens: 150 },
                { id: 'legal', label: 'Emitir Pacto Socios', icon: '⚖️', isAi: true, tokens: 300 }
            ]
        };

        return `
            <style>
                ${MapRenderer.getStyles()}
                ${LedgerRenderer.getStyles()}

                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-dash { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at top right, rgba(0,176,255,0.03) 0%, transparent 40%);}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .dash-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 2rem; margin-bottom: 2.5rem; align-items: stretch;}
                
                .dash-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 35px rgba(0,0,0,0.5); backdrop-filter: blur(20px); display: flex; flex-direction: column; box-sizing: border-box; position: relative; overflow: hidden;}
                .dash-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--panel-color, var(--glass-border)); }
                
                .panel-title { color: white; font-size: 1.1rem; font-weight: 900; margin-top: 0; margin-bottom: 1.5rem; display:flex; justify-content:space-between; align-items:center; text-transform:uppercase; letter-spacing:1px; z-index: 1;}
                
                .presentation-text { color: #ccc; font-size: 1rem; line-height: 1.6; font-family: 'Georgia', serif; font-style: italic; border-left: 3px solid var(--accent-purple); padding-left: 15px; margin-bottom: 1.5rem; flex: 1;}
                
                .btn-cta { background: linear-gradient(135deg, rgba(224,64,251,0.1), rgba(0,176,255,0.1)); border: 1px solid var(--accent-purple); color: white; padding: 12px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; display:flex; justify-content:center; align-items:center; gap:10px; width: 100%; font-size: 0.95rem; margin-bottom: 10px; text-decoration: none;}
                .btn-cta:hover { background: var(--accent-purple); box-shadow: 0 0 20px rgba(224,64,251,0.4); transform: translateY(-2px);}
                .btn-cta.disabled { opacity: 0.5; pointer-events: none; filter: grayscale(100%); }
                
                .btn-ghost { background: transparent; border: 1px dashed var(--accent-orange); color: var(--accent-orange); padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; width: 100%; font-size: 0.85rem;}
                .btn-ghost:hover { background: rgba(255, 171, 64, 0.1); border-style: solid;}

                .mini-map-container { width: 100%; flex: 1; min-height: 250px; position: relative; border-radius:16px; border:1px solid rgba(255,255,255,0.05); overflow:hidden; background: rgba(0,0,0,0.3);}
                .map-overlay-link { position: absolute; bottom: 15px; right: 15px; background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 15px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; text-decoration: none; backdrop-filter: blur(5px); transition: 0.3s;}
                .map-overlay-link:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.5);}

                .kpi-stripe { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 0.5rem; }
                .kpi-card { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4)); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; transition: 0.3s; border-left: 4px solid var(--kpi-color, #888);}
                .kpi-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); box-shadow: 0 10px 20px rgba(0,0,0,0.3);}
                .kpi-val { font-size: 2.5rem; font-weight: 900; color: white; font-family: var(--font-mono); line-height: 1; margin-bottom: 8px; text-shadow: 0 0 20px var(--kpi-glow, transparent);}
                .kpi-lbl { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                .economy-panel { display: flex; flex-direction: column; gap: 20px;}
                .eco-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px;}
                .eco-row:last-child { border-bottom: none; padding-bottom: 0;}
                .eco-lbl { color: #aaa; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;}
                .eco-val { color: white; font-size: 1.2rem; font-weight: 900; font-family: var(--font-mono);}
                .eco-val.positive { color: var(--accent-green); text-shadow: 0 0 10px rgba(0,230,118,0.4);}
                .eco-val.negative { color: var(--accent-red); }
                
                .savings-widget { background: rgba(0,230,118,0.05); border: 1px solid rgba(0,230,118,0.2); border-radius: 12px; padding: 15px;}
                .savings-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.8rem;}
                .savings-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;}
                .savings-bar-fill { height: 100%; background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green);}

                .ai-avatar-badge { width: 38px; height: 38px; border-radius: 50%; display:flex; justify-content:center; align-items:center; font-size: 1.2rem; background: linear-gradient(135deg, #111, #222); border: 1px solid var(--accent-purple); margin-left: -10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;}
                .ai-avatar-badge:first-child { margin-left: 0; }
                .ai-avatar-badge:hover { transform: translateY(-5px); z-index: 10; border-color: white;}

                .insight-banner { grid-column: 1 / -1; padding: 15px 20px; border-radius: 12px; font-weight: bold; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.02); border-left: 4px solid var(--insight-color, #888); color: white;}
                .insight-banner.success { --insight-color: var(--accent-green); background: rgba(0,230,118,0.05); }
                
                .vacante-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: 12px; margin-bottom: 12px; transition: 0.3s;}
                .vacante-card:hover { border-color: var(--accent-blue); background: rgba(0,176,255,0.02);}
                .vacante-icon { font-size:1.8rem; filter:drop-shadow(0 0 5px rgba(255,255,255,0.2)); }
                .vacante-name { color: white; font-weight: 900; font-size: 1.05rem; }
                .vacante-meta { font-size: 0.8rem; color: #888; font-family: var(--font-mono); margin-top: 4px; }
                .vacante-meta span { color:var(--accent-green); font-weight:bold; }
                .btn-invite { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 900; transition: 0.2s; text-transform: uppercase;}
                .btn-invite:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4);}

                .badge-tag { font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-purple); border: 1px solid rgba(224,64,251,0.3); padding: 4px 10px; border-radius: 6px; background: rgba(224,64,251,0.1);}

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
                        
                        <div class="insight-banner" style="--insight-color: ${insightColor}; margin-bottom: 2rem;">
                            <span>💡</span> ${insightMessage}
                        </div>

                        <section class="kpi-stripe">
                            <div class="kpi-card" style="--kpi-color: var(--accent-green); --kpi-glow: rgba(0,230,118,0.2);">
                                <span class="kpi-val">${Math.round(totalSlices).toLocaleString()}</span>
                                <span class="kpi-lbl">Slices Minados</span>
                            </div>
                            <div class="kpi-card" style="--kpi-color: var(--accent-blue); --kpi-glow: rgba(0,176,255,0.2);">
                                <span class="kpi-val">${totalHours.toFixed(1)}h</span>
                                <span class="kpi-lbl">Esfuerzo Auditado</span>
                            </div>
                            <div class="kpi-card" style="--kpi-color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">
                                <span class="kpi-val">${resilience}%</span>
                                <span class="kpi-lbl">Salud Estructural</span>
                            </div>
                            <div class="kpi-card" style="--kpi-color: #888;">
                                <span class="kpi-val">${project.usuarios ? project.usuarios.length : 1}</span>
                                <span class="kpi-lbl">Nodos en Colla</span>
                            </div>
                        </section>

                        <div class="dash-grid">
                            
                            <div style="display:flex; flex-direction:column; gap:2rem;">
                                
                                <div class="dash-panel" style="--panel-color: var(--accent-purple);">
                                    <div class="panel-title">
                                        <div style="display:flex; align-items:center; gap:8px;"><span>📖</span> Misión Ecosistema</div>
                                        <div style="display:flex; gap:5px;">${tagsHtml}</div>
                                    </div>
                                    <div class="presentation-text" id="pitchText">${pitchText.replace(/\n/g, '<br>')}</div>
                                    <div style="margin-top:auto;">
                                        <a href="/v9/paper" data-link class="btn-cta ${project.isArchived ? 'disabled' : ''}">📝 Desarrollar Tareas en Omni-Paper</a>
                                        ${!project.isArchived ? `<button class="btn-ghost" id="btnEvolveVision">✨ Meta-Cognición: Evolucionar Visión</button>` : ''}
                                    </div>
                                </div>

                                <div class="dash-panel" style="--panel-color: var(--accent-green);">
                                    <div class="panel-title"><span>📈</span> Economía Antigravity & ROI</div>
                                    
                                    <div class="economy-panel">
                                        <div class="eco-row">
                                            <span class="eco-lbl">💼 Valor Bruto Generado (IA)</span>
                                            <span class="eco-val positive">€${aiGrossValue.toLocaleString()}</span>
                                        </div>
                                        <div class="eco-row">
                                            <span class="eco-lbl">💸 Gasto Real API</span>
                                            <span class="eco-val negative">$${realApiCost.toFixed(4)}</span>
                                        </div>
                                        <div class="eco-row" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; border: 1px solid #333;">
                                            <span class="eco-lbl" style="color:var(--accent-purple);">🔮 Multiplicador R.E.C.</span>
                                            <span class="eco-val" style="color:var(--accent-purple); font-size:1.5rem;">${recRatio > 0 ? recRatio.toFixed(0) + 'x' : '0'}</span>
                                        </div>
                                        
                                        <div class="savings-widget">
                                            <div class="savings-header">
                                                <span style="color:var(--accent-green); font-weight:bold;">Ahorro vs Humano: ${savingsPercent}%</span>
                                                <span style="color:#888;">Tokens: ${(totalTokens / 1000).toFixed(1)}k</span>
                                            </div>
                                            <div class="savings-bar-bg">
                                                <div class="savings-bar-fill" style="width: ${Math.min(savingsPercent, 100)}%;"></div>
                                            </div>
                                        </div>

                                        <div style="display:flex; align-items:center; justify-content:space-between; margin-top: 10px;">
                                            <span style="font-size:0.8rem; color:#888; font-weight:bold;">Motores Cognitivos en uso:</span>
                                            <div style="display:flex;">${aiAvatarsHtml}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div style="display:flex; flex-direction:column; gap:2rem;">
                                
                                <div class="dash-panel" style="--panel-color: var(--accent-blue); padding-bottom: 1rem;">
                                    <div class="panel-title"><span>🕸️</span> Topología VNA</div>
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
                                        ${!project.isArchived ? `<a href="/v9/map" data-link class="map-overlay-link">Modificar Arquitectura &rarr;</a>` : ''}
                                    </div>
                                </div>

                                <div class="dash-panel" style="--panel-color: #888; padding: 0;">
                                    <div class="panel-title" style="padding: 2rem 2rem 0 2rem; border:none; margin-bottom:0;"><span>⚖️</span> Distribución de Equidad</div>
                                    <div id="dashLedgerContainer" style="padding: 1rem 2rem;"></div>
                                    <div style="background: rgba(255,255,255,0.02); padding: 15px 2rem; text-align:right; border-top: 1px solid rgba(255,255,255,0.05);">
                                        <a href="/v9/ledger" data-link style="color:#aaa; font-size:0.85rem; text-decoration:none; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#aaa'">Ir a la Notaría (Ledger Completo) &rarr;</a>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    <div id="tab-market" class="tab-content ${this.currentTab === 'market' ? 'active' : ''}">
                        <div class="dash-panel" style="--panel-color: var(--accent-orange); max-width:800px; margin: 0 auto;">
                            <h2 style="color: white; margin-top: 0; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-weight: 900; text-transform: uppercase;">🎯 Mercado Interno (Vacantes)</h2>
                            <p style="color:#888; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">Roles vitales diseñados en la arquitectura que aún no tienen un talento humano o IA asignado.</p>
                            <div>${vacantesHtml}</div>
                        </div>
                    </div>

                    <div id="tab-archive" class="tab-content ${this.currentTab === 'archive' ? 'active' : ''}">
                        <div class="dash-grid">
                            <div class="dash-panel" style="--panel-color: var(--accent-blue);">
                                <h3 style="color:white; margin-top:0; margin-bottom: 1.5rem;">🚀 Ecosistemas Activos</h3>
                                ${activeProjectsHtml}
                            </div>
                            <div class="dash-panel" style="--panel-color: #555;">
                                <h3 style="color:white; margin-top:0; margin-bottom: 1.5rem;">🗄️ La Cripta (Archivados)</h3>
                                ${archivedProjectsHtml}
                            </div>
                        </div>
                    </div>

                    <div id="tab-settings" class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}">
                         <div class="dash-panel" style="--panel-color: #555; max-width:600px; margin: 0 auto; text-align:center;">
                            <div style="font-size: 4rem; margin-bottom:1rem;">⚙️</div>
                            <h2 style="color: white; margin-top:0;">Configuración de Red</h2>
                            <p style="color:#888;">Gobernanza, APIs multimodales y Padrón gestionados en la Consola Global.</p>
                            <a href="/v9/settings" data-link class="btn-cta" style="margin-top:2rem;">Ir al Panteón Global</a>
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
                        <button class="btn-cta" id="btnAcceptEvolution" style="display:none; width:auto; background:var(--accent-green); border:none; color:black;">✅ Aplicar y Aprender (Meta-Cognición)</button>
                        <button class="btn-cta" id="btnDownloadPDF" style="display:none; width:auto;">⬇️ DESCARGAR INFORME (.TXT)</button>
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

        // 🔥 EVENTOS DE LA CRIPTA (ARCHIVAR/DESARCHIVAR)
        document.querySelectorAll('.btn-toggle-archive').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const pId = e.target.dataset.id;
                const setArchived = e.target.dataset.action === 'archive';
                const actionText = setArchived ? 'Archivar' : 'Desarchivar';
                
                if (confirm(`¿${actionText} este ecosistema?`)) {
                    await store.dispatch({
                        type: 'UPDATE_PROJECT_INFO',
                        payload: { projectId: pId, updates: { isArchived: setArchived } }
                    });
                    if (setArchived && this.activeProjectId === pId) {
                        // Si archivamos el actual, saltamos al primer activo para no quedarnos en la cripta por error (opcional, por ahora solo recarga)
                    }
                    window.location.reload();
                }
            });
        });

        // RENDER DE COMPONENTES
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

        // EVENTOS
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

        let latestEvolutionData = null;

        if (modalCloseBtn) modalCloseBtn.onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            if (!modal) return;
            
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');
            if (provider === 'anthropic') apiKey = localStorage.getItem('tt_key_anthropic');

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
                    temperature: isEvolveMode ? 0.3 : 0.2 
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
                        
                        await store.dispatch({
                            type: 'UPDATE_PROJECT_INFO',
                            payload: { projectId: this.activeProjectId, updates: { presentation: latestEvolutionData.new_vision } }
                        });

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

                        alert("✅ La visión del ecosistema ha evolucionado y el cerebro de Gènesi ha sido actualizado.");
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
