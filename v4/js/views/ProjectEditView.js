import { store } from '../core/store.js';

// --- CONTROLADORES DE EVENTOS ---
document.addEventListener('click', (e) => {
    const projectId = e.target.getAttribute('data-pid');

    // 🛡️ GUARDAR IDENTIDAD Y ARQUETIPO
    if (e.target.id === 'btn-save-project-basic') {
        const nombre = document.getElementById('edit-proj-name').value.trim();
        const archetype = document.getElementById('edit-proj-archetype').value;
        const sector = document.getElementById('edit-proj-sector').value;

        if (!nombre) return alert("⚠️ El nombre es obligatorio.");

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { nombre, archetype, sector } }
        });
        
        e.target.innerHTML = '✅ ADN Actualizado';
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000);
    }

    // 📝 EDITAR NOMBRE DE ROL (Atómico - Fix Kernel v6.2)
    if (e.target.classList.contains('btn-save-role-name')) {
        const roleId = e.target.getAttribute('data-role');
        const newName = document.getElementById(`input-role-name-${roleId}`).value.trim();
        
        if (!newName) return alert("El nombre no puede estar vacío.");

        store.dispatch({
            type: 'UPDATE_ROLE',
            payload: { projectId, roleId, updates: { name: newName } }
        });
        
        alert("Nodo renombrado con éxito.");
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 🤖 DNA BUILDER (Asistente de Prompts)
    if (e.target.id === 'btn-build-dna') {
        const q1 = document.getElementById('dna-q1').value.trim();
        const q2 = document.getElementById('dna-q2').value.trim();
        const finalPrompt = `CONTEXTO: ${q1}. EXCELENCIA: ${q2}.`;

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { prompt: finalPrompt } }
        });

        alert("🤖 Inteligencia de Red sincronizada.");
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // ➕ AÑADIR ROL MANUAL
    if (e.target.id === 'btn-add-role') {
        const name = document.getElementById('new-role-name').value.trim();
        const levelId = document.getElementById('new-role-level').value;

        if (!name) return alert("⚠️ Nombre obligatorio.");

        store.dispatch({
            type: 'ADD_ROLE',
            payload: { 
                projectId, 
                role: { 
                    id: 'role-' + Date.now(), 
                    name, levelId, 
                    multiplier: 1.0, fmv: 50,
                    ai_prompt: '', standard_deliverables: [], isArchived: false
                } 
            }
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Red no encontrada</h2></div>`;

        // Seguridad RBAC
        const session = state.session || { activeUserId: 'unknown', role: 'admin' };
        if (session.role !== 'admin') return `<div class="container"><h3>Acceso Denegado</h3></div>`;

        const maturity = store.calculateMaturityIndex(projectId);
        const activeRoles = project.roles.filter(r => !r.isArchived);
        const archColors = { 'startup': 'var(--accent-blue)', 'corporate': 'var(--accent-green)', 'dao': 'var(--accent-gold)' };
        const themeColor = archColors[project.archetype] || 'var(--accent-blue)';

        // 🚀 NAVBAR v4.2
        setTimeout(() => {
            if (window.setNavbar) {
                window.setNavbar(
                    [
                        { label: state.config.ecosystemName, hash: '#/' },
                        { label: project.nombre, hash: `#/project/${projectId}` },
                        { label: 'Configuración de ADN' }
                    ], 
                    `<span class="badge" style="background:${themeColor}22; color:${themeColor}; margin-left:10px;">${project.archetype.toUpperCase()}</span>`, 
                    `<button class="btn btn-outline" onclick="location.hash='#/project/${projectId}'">🔙 Panel de Control</button>`
                );
            }
        }, 0);

        return `
            <div class="container fade-in" style="max-width: 1300px; margin: 30px auto; padding: 0 20px;">
                
                <div class="grid-layout" style="grid-template-columns: 1fr 1.8fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 25px;">
                        
                        <div class="panel-surface" style="border-top: 4px solid ${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'};">
                            <h4 style="margin: 0 0 10px 0;">Coherencia del Ecosistema</h4>
                            <div style="font-size: 2.2rem; font-weight: 900; color: ${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'};">${maturity.score}%</div>
                            <div style="margin-top:15px;">
                                ${maturity.alerts.map(a => `<div style="font-size:0.8rem; color:var(--text-main); margin-bottom:8px; padding-left:10px; border-left:2px solid var(--accent-gold);">${a}</div>`).join('')}
                            </div>
                        </div>

                        <div class="panel-surface" style="border-left: 4px solid ${themeColor};">
                            <h3 style="margin-top:0;">ADN de la Red</h3>
                            <label class="form-label">Nombre</label>
                            <input id="edit-proj-name" type="text" class="form-control" value="${project.nombre}">

                            <label class="form-label">Arquetipo Sistémico</label>
                            <select id="edit-proj-archetype" class="form-control">
                                <option value="startup" ${project.archetype === 'startup' ? 'selected' : ''}>🚀 Startup (Riesgo x2.0)</option>
                                <option value="corporate" ${project.archetype === 'corporate' ? 'selected' : ''}>🏢 Corporativo (Riesgo x1.0)</option>
                                <option value="dao" ${project.archetype === 'dao' ? 'selected' : ''}>🌍 DAO (Reputación x1.5)</option>
                            </select>

                            <button id="btn-save-project-basic" data-pid="${projectId}" class="btn btn-primary btn-block" style="background:${themeColor}; color:#000; border:none; margin-top:10px;">💾 Guardar ADN</button>
                        </div>

                        <div class="panel-surface" style="border-top: 3px solid var(--accent-purple);">
                            <h3 style="margin-top:0; color: var(--accent-purple);">Asistente Dosos (IA)</h3>
                            <p class="text-small text-muted">Configura el criterio de auditoría para toda la red.</p>
                            
                            <label class="form-label">¿Cuál es el propósito de esta red?</label>
                            <textarea id="dna-q1" class="form-control" rows="3" placeholder="Ej: Crear una plataforma de IA descentralizada..."></textarea>

                            <label class="form-label">¿Qué define un entregable excelente?</label>
                            <textarea id="dna-q2" class="form-control" rows="3" placeholder="Ej: Código testeado, documentación clara..."></textarea>

                            <button id="btn-build-dna" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-purple); color: var(--accent-purple);">🤖 Sincronizar IA</button>
                        </div>
                    </aside>

                    <main>
                        <div class="panel-surface">
                            <h3 style="margin-top:0;">Topología de Nodos</h3>
                            <p class="text-small text-muted" style="margin-bottom:25px;">Define los roles. Recuerda equilibrar flujos <b>Tangibles</b> (ejecución) e <b>Intangibles</b> (estrategia y soporte).</p>

                            <div class="list-group">
                                ${activeRoles.map(r => `
                                    <div class="panel-surface" style="margin-bottom:15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent-blue); padding: 15px;">
                                        <div style="display:flex; gap:15px; align-items:center;">
                                            <div style="flex:1;">
                                                <input type="text" id="input-role-name-${r.id}" class="form-control" value="${r.name}" style="margin-bottom:5px; font-weight:bold; font-size:1.1rem; background:transparent; border:none; border-bottom:1px solid var(--border-color); padding:5px 0;">
                                                <div style="font-size:0.7rem; color:var(--text-muted); font-family:monospace;">
                                                    LEVEL: ${r.levelId} | MULT: x${r.multiplier} | BASE: ${r.fmv}€/h
                                                </div>
                                            </div>
                                            <button class="btn btn-primary btn-save-role-name" data-pid="${projectId}" data-role="${r.id}" style="padding:6px 12px; font-size:0.8rem; background:var(--accent-blue); color:#000;">💾</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div style="margin-top:30px; padding:20px; border: 1px dashed var(--border-color); border-radius:12px;">
                                <h4 style="margin-top:0;">➕ Añadir Nuevo Nodo</h4>
                                <div style="display:flex; gap:10px;">
                                    <input type="text" id="new-role-name" class="form-control" placeholder="Nombre del Rol (ej: CTO, UX Lead...)" style="flex:2; margin-bottom:0;">
                                    <select id="new-role-level" class="form-control" style="flex:1; margin-bottom:0;">
                                        <option value="@anxaneta">@anxaneta (Estrat.)</option>
                                        <option value="@aixecador">@aixecador (Tact.)</option>
                                        <option value="@dosos">@dosos (Audit.)</option>
                                        <option value="@baixos" selected>@baixos (Ejec.)</option>
                                        <option value="@pinya">@pinya (Soporte)</option>
                                    </select>
                                    <button id="btn-add-role" data-pid="${projectId}" class="btn btn-primary">Añadir</button>
                                </div>
                            </div>
                        </div>
                    </main>

                </div>
            </div>
        `;
    }
};
