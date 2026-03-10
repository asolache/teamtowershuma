// v5/js/views/DashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class DashboardView {
    constructor() {
        document.title = "Lobby del Proyecto | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                        <div style="text-align:center; background: rgba(255,255,255,0.02); padding: 4rem; border-radius: 12px; border: 1px dashed #333;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🕳️</div>
                            <h2 style="color:white; margin-top:0;">El Kernel está vacío</h2>
                            <p style="color:var(--text-muted); margin-bottom: 2rem;">Aún no has instanciado ninguna red VNA.</p>
                            <a href="/v5/create" data-link class="btn btn-primary" style="background: var(--accent-blue); color: black; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">+ Instanciar Nueva Red</a>
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
                        <div style="text-align:center; background: rgba(255, 82, 82, 0.05); border: 1px dashed var(--accent-red); padding: 4rem; border-radius: 12px; max-width: 600px;">
                            <div style="font-size: 5rem; margin-bottom: 1rem;">🔒</div>
                            <h1 style="color: var(--accent-red);">ACCESO DENEGADO</h1>
                            <p style="color: #ccc;">Este Castell es privado. No eres un nodo reconocido en su Colla.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience(project.id);
        const isPO = project.ownerId === activeUserId || globalRole === 'ecosystem-owner';

        // Sillas Vacías
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div style="padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 8px; color: var(--accent-green); text-align: center; font-weight: bold;">✅ La Colla está al 100%.</div>`
            : sillasVacias.map(r => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <div>
                        <div style="color: white; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                            ${this.getIcon(r.levelId)} ${r.name}
                        </div>
                        <div style="font-size: 0.75rem; color: #666; font-family: var(--font-mono);">${r.levelId} | 🛡️ ${r.guardian || 'Any'}</div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}" style="background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue); padding:4px 10px; border-radius:4px; font-size:0.8rem; cursor:pointer;">+ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'Visión en blanco...';
        const tagsHtml = (project.tags && project.tags.length > 0) ? project.tags.map(t => `<span class="badge">#${t}</span>`).join('') : '';

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #050505; font-family: var(--font-main); }
                .workspace { flex: 1; padding: 3rem 4rem; overflow-y: auto; display: flex; flex-direction: column; }
                
                /* CABECERA DASHBOARD */
                .dash-header { margin-bottom: 3rem; animation: fadeIn 0.5s ease-out; }
                .project-tags { display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;}
                .project-tags .badge { background: rgba(0, 176, 255, 0.1); border: 1px solid rgba(0, 176, 255, 0.2); color: var(--accent-blue); padding: 2px 10px; border-radius: 4px; font-size: 0.7rem; font-family: var(--font-mono); text-transform: uppercase;}
                
                .project-name-main { font-size: 3.5rem; color: white; margin: 0; letter-spacing: -2px; line-height: 1; font-weight: 800; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .project-archetype-label { font-size: 1.2rem; color: var(--accent-orange); margin-top: 5px; font-weight: normal; opacity: 0.8; }

                /* CAJA DE PRESENTACIÓN */
                .presentation-box { margin-top: 2rem; background: linear-gradient(to right, rgba(224, 64, 251, 0.05), transparent); border-left: 4px solid var(--accent-purple); padding: 1.5rem 2rem; border-radius: 0 12px 12px 0; position: relative; max-width: 900px;}
                .presentation-text { color: #ccc; font-size: 1.1rem; line-height: 1.7; font-style: italic; white-space: pre-wrap; }
                .btn-edit-pitch { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.05); border: none; color: #666; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem;}
                .btn-edit-pitch:hover { color: white; background: rgba(255,255,255,0.1); }

                /* BOTONES DE ACCIÓN */
                .action-bar { display: flex; gap: 15px; margin-top: 2rem; }
                .btn-main { padding: 12px 25px; border-radius: 8px; font-weight: bold; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
                .btn-primary { background: white; color: black; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255,255,255,0.2); }
                .btn-outline { background: transparent; border: 1px solid #333; color: white; }
                .btn-outline:hover { border-color: #666; background: rgba(255,255,255,0.05); }

                /* KPI GRID */
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin: 3rem 0; }
                .kpi-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 12px; text-align: center; }
                .kpi-val { font-size: 2rem; font-weight: 900; color: white; font-family: var(--font-mono); margin-bottom: 5px; display: block;}
                .kpi-lbl { font-size: 0.65rem; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

                /* CONTENEDORES SECUNDARIOS */
                .panel-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 4rem;}
                .panel-box { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; }
                .panel-title { color: white; margin-top: 0; font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;}

                .btn-report { width: 100%; text-align: left; background: rgba(0,0,0,0.4); border: 1px solid #222; padding: 15px; border-radius: 8px; color: white; cursor: pointer; margin-bottom: 10px; transition: 0.2s;}
                .btn-report:hover { border-color: var(--accent-purple); transform: translateX(5px); background: rgba(224, 64, 251, 0.05); }
                .btn-report strong { display: block; color: var(--accent-purple); font-size: 1rem; margin-bottom: 4px;}
                .btn-report span { font-size: 0.75rem; color: #666;}

                /* MODAL IA */
                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 2000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px);}
                .modal-ia-content { background: #0a0a0a; width: 90%; max-width: 800px; max-height: 85vh; border-radius: 12px; border: 1px solid #333; display: flex; flex-direction: column; overflow:hidden;}
                .modal-ia-body { padding: 25px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.6; white-space: pre-wrap; font-family: inherit;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1024px) { .panel-row { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: 1fr 1fr; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace">
                    <header class="dash-header">
                        <div class="project-tags">
                            <span class="badge" style="color:var(--accent-blue); border-color:var(--accent-blue);">${project.sector.replace(/_/g, ' ')}</span>
                            ${tagsHtml}
                        </div>
                        <h1 class="project-name-main">${project.nombre}</h1>
                        <div class="project-archetype-label">${project.archetype.toUpperCase()} Ecosistema</div>

                        <div class="presentation-box">
                            ${isPO ? `<button class="btn-edit-pitch" id="btnEditPitch">✏️ EDITAR VISIÓN</button>` : ''}
                            <div class="presentation-text" id="pitchDisplay">${pitchText}</div>
                        </div>

                        <div class="action-bar">
                            <a href="/v5/project" data-link class="btn-main btn-primary">📋 ENTRAR AL KANBAN</a>
                            <a href="/v5/map" data-link class="btn-main btn-outline">🕸️ MAPA DE VALOR</a>
                            ${isPO ? `<button id="btnExportTemplate" class="btn-main btn-outline" style="border-style:dashed; color:#666;">💾 GUARDAR ADN</button>` : ''}
                        </div>
                    </header>

                    <section class="kpi-grid">
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</span>
                            <span class="kpi-lbl">Slices Mined</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: var(--accent-blue);">${totalHours.toFixed(1)}h</span>
                            <span class="kpi-lbl">Esfuerzo Auditado</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">${resilience}%</span>
                            <span class="kpi-lbl">Resiliencia VNA</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val">${project.usuarios ? project.usuarios.length : 1}</span>
                            <span class="kpi-lbl">Nodos Activos</span>
                        </div>
                    </section>

                    <div class="panel-row">
                        <div class="panel-box">
                            <h2 class="panel-title">🎯 Sillas Disponibles</h2>
                            <p style="color:#555; font-size:0.85rem; margin-bottom:1.5rem;">Roles en la arquitectura esperando ser reclamados.</p>
                            ${vacantesHtml}
                        </div>

                        <div class="panel-box" style="border-color: rgba(224, 64, 251, 0.2);">
                            <h2 class="panel-title" style="color:var(--accent-purple);">🤖 Orquestador IA & Legal</h2>
                            <p style="color:#555; font-size:0.85rem; margin-bottom:1.5rem;">Genera auditorías y documentos dinámicos.</p>
                            
                            <button class="btn-report" id="btnAIAuditor">
                                <strong>🧠 Auditoría de Salud VNA</strong>
                                <span>La IA analiza cuellos de botella y balance de poder.</span>
                            </button>

                            <button class="btn-report" id="btnAILegal">
                                <strong>📄 Generar Pacto de Socios</strong>
                                <span>Borrador contractual basado en el Ledger actual.</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:15px 25px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.1rem; color:var(--accent-purple);">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:white; cursor:pointer; font-size:1.2rem;">✖</button>
                    </div>
                    <div class="modal-ia-body" id="aiModalBody"></div>
                    <div style="padding:15px 25px; border-top:1px solid #333; display:flex; justify-content:flex-end; background:#000;">
                        <button class="btn btn-primary" id="btnDownloadPDF" style="display:none; padding:8px 15px; font-size:0.8rem;">Descargar .txt</button>
                    </div>
                </div>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        Sidebar.initListeners();
        if (!this.activeProjectId) return;
        const project = store.getState().projects.find(p => p.id === this.activeProjectId);

        // -- EDITAR PITCH --
        document.getElementById('btnEditPitch')?.addEventListener('click', () => {
            const current = project.presentation || project.prompt || '';
            const next = prompt("Edita la Visión / Pitch de la red:", current);
            if (next !== null) {
                store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: this.activeProjectId, updates: { presentation: next } }
                });
                window.location.reload();
            }
        });

        // -- GUARDAR PLANTILLA --
        document.getElementById('btnExportTemplate')?.addEventListener('click', async () => {
            const id = prompt("ID de la plantilla (ej: mi_startup):", project.sector + "_v2");
            if (!id) return;
            const rolesData = {};
            project.roles.forEach(r => {
                if (!rolesData[r.levelId]) {
                    rolesData[r.levelId] = { name: r.name, guardian: r.guardian || '', multiplier: r.multiplier || 1.0, ai_prompt: '', standard_deliverables: [] };
                }
            });
            await store.dispatch({ type: 'ADD_ONTOLOGY_SECTOR', payload: { sectorId: id, rolesData } });
            alert("✅ Guardada en Settings.");
        });

        // -- MÓDULO IA --
        const modal = document.getElementById('aiModal');
        const modalBody = document.getElementById('aiModalBody');
        const modalTitle = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');
        document.getElementById('aiModalClose').onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            const provider = localStorage.getItem('tt_ai_provider');
            const key = localStorage.getItem(`tt_key_${provider}`);
            if (!key) return alert("Falta API Key en Settings.");

            modal.style.display = 'flex';
            modalBody.innerHTML = "Analizando red...";
            btnDownload.style.display = 'none';

            const sys = type === 'audit' ? "Auditor VNA" : "Notario Web3";
            try {
                const res = await fetch(`https://api.deepseek.com/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [{ role: "system", content: sys }, { role: "user", content: JSON.stringify(project) }]
                    })
                });
                const data = await res.json();
                const txt = data.choices[0].message.content;
                modalTitle.innerText = type === 'audit' ? 'Reporte Auditoría' : 'Pacto de Socios';
                modalBody.innerText = txt;
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const b = new Blob([txt], {type:"text/plain"});
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href=u; a.download=`${type}.txt`; a.click();
                };
            } catch (e) { modalBody.innerText = "Error de conexión."; }
        };

        document.getElementById('btnAIAuditor')?.addEventListener('click', () => runAI('audit'));
        document.getElementById('btnAILegal')?.addEventListener('click', () => callAIAgent('legal'));
    }
}
