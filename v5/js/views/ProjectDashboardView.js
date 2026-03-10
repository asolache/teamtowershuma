// v5/js/views/ProjectDashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectDashboardView {
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
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <h2 style="color:var(--text-muted);">Ningún proyecto activo en el Kernel.</h2>
                    </main>
                </div>
            `;
        }

        this.activeProjectId = project.id;
        const hasAccess = store.canUserViewProject(project.id, activeUserId, globalRole);
        
        if (!hasAccess) {
            return `
                <style>
                    .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                    .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                    .locked-box { text-align: center; background: rgba(255, 82, 82, 0.05); border: 1px dashed var(--accent-red); padding: 4rem; border-radius: var(--border-radius-lg); max-width: 600px; animation: pulse 2s infinite alternate;}
                    @keyframes pulse { from { box-shadow: 0 0 10px rgba(255,82,82,0.1); } to { box-shadow: 0 0 30px rgba(255,82,82,0.3); } }
                </style>
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace">
                        <div class="locked-box">
                            <div style="font-size: 5rem; margin-bottom: 1rem;">🔒</div>
                            <h1 style="color: var(--accent-red); margin-bottom: 10px;">ACCESO DENEGADO</h1>
                            <p style="color: #ccc; line-height: 1.6;">Este Castell (<b>${project.nombre}</b>) está configurado en modo Privado (Stealth). No eres un nodo reconocido en su Colla ni el Project Owner.</p>
                            <a href="/v5/" data-link class="btn btn-outline" style="margin-top: 2rem; display: inline-block;">Volver al Inicio</a>
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

        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        let vacantesHtml = '';
        if (sillasVacias.length === 0) {
            vacantesHtml = `<div style="padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 8px; color: var(--accent-green); text-align: center; font-weight: bold;">✅ La Colla está al 100% de su capacidad. Ninguna silla vacía.</div>`;
        } else {
            vacantesHtml = sillasVacias.map(r => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <div>
                        <div style="color: white; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                            ${this.getIcon(r.levelId)} ${r.name}
                        </div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 5px; font-family: var(--font-mono);">
                            ${r.levelId} | 🛡️ Req: ${r.guardian || 'Any'} | FMV: ${r.fmv}€/h
                        </div>
                    </div>
                    ${isPO ? `<button class="btn btn-outline btn-invite" data-rolename="${r.name}" style="border-color: var(--accent-blue); color: var(--accent-blue);">+ Invitar Candidato</button>` : `<span style="color:var(--text-muted); font-size:0.8rem;">Se busca talento</span>`}
                </div>
            `).join('');
        }

        let invLogHtml = '';
        if (isPO && project.invitations && project.invitations.length > 0) {
            const list = project.invitations.map(inv => `
                <div style="font-size: 0.8rem; color: #aaa; border-bottom: 1px dashed #333; padding: 5px 0; display:flex; justify-content:space-between;">
                    <span>✉️ ${inv.email}</span>
                    <span style="font-family: var(--font-mono);">${new Date(inv.sentAt).toLocaleDateString()}</span>
                </div>
            `).join('');
            invLogHtml = `<div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border);">
                            <h4 style="color: #666; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 10px;">Registro de Correos Enviados</h4>
                            ${list}
                          </div>`;
        }

        // MAQUETACIÓN DE LA PRESENTACIÓN (Pitch)
        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red aún no ha sido redactado. La organización se encuentra en fase de formación primaria.';

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2.5rem 4rem; overflow-y: auto; display: flex; flex-direction: column; }
                
                .dash-hero { background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,15,20,0.9) 100%); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 3rem; position: relative; overflow: hidden; margin-bottom: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5);}
                .dash-hero::before { content:''; position:absolute; top:0; left:0; width:100%; height:4px; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); }
                
                .meta-badges { display: flex; gap: 10px; margin-bottom: 1.5rem; }
                .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-mono); border: 1px solid;}
                .badge-sector { color: var(--accent-blue); border-color: rgba(0, 176, 255, 0.3); background: rgba(0, 176, 255, 0.1); }
                .badge-priv { color: ${project.isPrivate ? 'var(--accent-red)' : 'var(--accent-green)'}; border-color: ${project.isPrivate ? 'rgba(255,82,82,0.3)' : 'rgba(0,230,118,0.3)'}; background: ${project.isPrivate ? 'rgba(255,82,82,0.1)' : 'rgba(0,230,118,0.1)'}; }
                
                .dash-title { font-size: 3.5rem; color: white; margin: 0 0 1.5rem 0; letter-spacing: -1.5px; line-height: 1.1; text-shadow: 0 5px 15px rgba(0,0,0,0.8); }
                
                /* ESTILOS DE LA PRESENTACIÓN (Pitch) */
                .presentation-box { position: relative; margin-bottom: 2rem; background: rgba(224, 64, 251, 0.03); border-left: 3px solid var(--accent-purple); padding: 1.5rem; border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;}
                .presentation-text { color: #ccc; font-size: 1.05rem; line-height: 1.7; transition: all 0.3s ease; }
                .presentation-text.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                
                .btn-toggle-text { background: none; border: none; color: var(--accent-purple); font-weight: bold; cursor: pointer; padding: 0; margin-top: 10px; font-size: 0.85rem; }
                .btn-toggle-text:hover { text-decoration: underline; }
                
                .btn-edit-pitch { position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); border-radius: 4px; padding: 4px 8px; font-size: 0.7rem; cursor: pointer; transition: 0.2s;}
                .btn-edit-pitch:hover { background: rgba(255,255,255,0.1); color: white; }

                .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .kpi-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center;}
                .kpi-val { font-size: 2.5rem; font-weight: 900; font-family: var(--font-mono); color: white; margin-bottom: 5px; text-shadow: 0 0 20px rgba(255,255,255,0.1);}
                .kpi-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}

                .recruitment-panel { background: rgba(0, 176, 255, 0.02); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: var(--border-radius-lg); padding: 2rem; }
                .panel-title { color: white; font-size: 1.4rem; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 10px; }

                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); transform: scale(1.02); }

                @media (max-width: 768px) {
                    .workspace { padding: 1.5rem; }
                    .dash-title { font-size: 2rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace">
                    <div class="dash-hero">
                        <div class="meta-badges">
                            <span class="badge badge-sector">${project.sector.replace(/_/g, ' ')}</span>
                            <span class="badge badge-sector" style="color: var(--accent-orange); border-color: rgba(255,171,64,0.3); background: rgba(255,171,64,0.1);">${project.archetype}</span>
                            <span class="badge badge-priv">${project.isPrivate ? '🔒 Red Privada' : '🌍 Red Abierta'}</span>
                        </div>
                        
                        <h1 class="dash-title">${project.nombre}</h1>
                        
                        <div class="presentation-box">
                            ${isPO ? `<button class="btn-edit-pitch" id="btnEditPitch" title="Editar Presentación">✏️ Editar</button>` : ''}
                            <div class="presentation-text collapsed" id="pitchTextContainer">
                                ${pitchText.replace(/\n/g, '<br>')}
                            </div>
                            <button class="btn-toggle-text" id="btnTogglePitch">Ver más +</button>
                        </div>
                        
                        <div style="display: flex; gap: 15px;">
                            <a href="/v5/project" data-link class="btn btn-primary" style="padding: 12px 25px;">📋 Entrar al Kanban</a>
                            <a href="/v5/map" data-link class="btn btn-outline" style="padding: 12px 25px;">🕸️ Ver Mapa de Valor</a>
                        </div>
                    </div>

                    <div class="kpi-grid">
                        <div class="kpi-card">
                            <div class="kpi-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</div>
                            <div class="kpi-lbl">Slices (Equity) Mined</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-val" style="color: var(--accent-blue);">${totalHours.toFixed(1)}h</div>
                            <div class="kpi-lbl">Deep Work Auditado</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-val" style="color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">${resilience}%</div>
                            <div class="kpi-lbl">Salud de Flujos (Resiliencia)</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-val">${project.usuarios ? project.usuarios.length : 1}</div>
                            <div class="kpi-lbl">Nodos (La Colla)</div>
                        </div>
                    </div>

                    <div class="recruitment-panel">
                        <h2 class="panel-title">🎯 Tablón de Reclutamiento (Sillas Vacías)</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Estos roles han sido diseñados en el Mapa de Valor, pero no tienen a ningún miembro humano o IA asignado para ejecutarlos.</p>
                        
                        ${vacantesHtml}
                        ${invLogHtml}
                    </div>
                </main>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        Sidebar.initListeners();

        if (!this.activeProjectId) return;

        const pitchContainer = document.getElementById('pitchTextContainer');
        const btnToggle = document.getElementById('btnTogglePitch');
        
        if (pitchContainer && btnToggle) {
            if (pitchContainer.scrollHeight <= pitchContainer.clientHeight + 10) {
                btnToggle.style.display = 'none';
            }

            btnToggle.addEventListener('click', () => {
                if (pitchContainer.classList.contains('collapsed')) {
                    pitchContainer.classList.remove('collapsed');
                    btnToggle.innerText = 'Ver menos -';
                } else {
                    pitchContainer.classList.add('collapsed');
                    btnToggle.innerText = 'Ver más +';
                }
            });
        }

        const btnEditPitch = document.getElementById('btnEditPitch');
        if (btnEditPitch) {
            btnEditPitch.addEventListener('click', () => {
                const state = store.getState();
                const p = state.projects.find(x => x.id === this.activeProjectId);
                const currentPitch = p.presentation || p.prompt || '';
                
                const newPitch = prompt("Edita la Presentación del Proyecto:", currentPitch);
                if (newPitch !== null) {
                    store.dispatch({
                        type: 'UPDATE_PROJECT_INFO',
                        payload: { projectId: this.activeProjectId, updates: { presentation: newPitch } }
                    });
                    this.executeViewScript(); 
                    document.querySelector('.workspace').innerHTML = 'Actualizando Ecosistema...';
                    window.location.reload();
                }
            });
        }

        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.target.getAttribute('data-rolename');
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                
                const email = prompt(`Introduce el correo electrónico del candidato para la silla de [${roleName}]:`);
                
                if (email && email.includes('@')) {
                    store.dispatch({
                        type: 'LOG_INVITATION',
                        payload: { projectId: this.activeProjectId, email: email }
                    });

                    const baseUrl = 'https://teamtowershuma.com/v5/';
                    const subject = encodeURIComponent(`Invitación a unirse al Castell: ${p.nombre}`);
                    const body = encodeURIComponent(
                        `Hola,\n\nHas sido invitado por el Project Owner para ocupar la silla estratégica de "${roleName}" en la red "${p.nombre}".\n\n` +
                        `Misión de la red:\n"${p.presentation || p.prompt || 'Construir valor de forma inmutable.'}"\n\n` +
                        `Accede al portal del Exoesqueleto (TeamTowers SOS) para instanciar tu identidad fractal y comenzar a reportar tu Prueba de Trabajo (Slicing Pie).\n\n` +
                        `Enlace de Acceso: ${baseUrl} \n\n` +
                        `Força, Equilibri, Valor i Seny.\nTeamTowers Kernel v7.3`
                    );
                    
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                    
                    setTimeout(() => {
                        window.location.reload(); 
                    }, 1000);
                } else if(email) {
                    alert("Por favor, introduce un correo electrónico válido.");
                }
            });
        });
    }
}
