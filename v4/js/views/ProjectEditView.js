import { store } from '../core/store.js';

// --- CONTROLADORES DE EVENTOS ---
document.addEventListener('click', (e) => {
    
    // 🛡️ GUARDAR IDENTIDAD Y ARQUETIPO
    if (e.target.id === 'btn-save-project-basic') {
        const projectId = e.target.getAttribute('data-pid');
        const nombre = document.getElementById('edit-proj-name').value.trim();
        const archetype = document.getElementById('edit-proj-archetype').value;
        const sector = document.getElementById('edit-proj-sector').value;

        if (!nombre) return alert("⚠️ El nombre es obligatorio.");

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { nombre, archetype, sector } }
        });
        
        const btn = e.target;
        btn.innerHTML = '✅ ADN Actualizado';
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000);
    }

    // 🤖 ASISTENTE DE PROMPTS (DNA BUILDER)
    if (e.target.id === 'btn-build-dna') {
        const projectId = e.target.getAttribute('data-pid');
        const q1 = document.getElementById('dna-q1').value.trim();
        const q2 = document.getElementById('dna-q2').value.trim();
        const q3 = document.getElementById('dna-q3').value.trim();

        // Construimos el System Prompt basado en las respuestas
        const finalPrompt = `PROYECTO: ${q1}. CRITERIO DE VALOR: ${q2}. MÉTRICA DE ÉXITO: ${q3}.`;

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { prompt: finalPrompt } }
        });

        alert("🤖 Inteligencia de Red actualizada. El agente Dosos ahora es más preciso.");
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // ➕ AÑADIR ROL Y ACTUALIZAR MADUREZ
    if (e.target.id === 'btn-add-role') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-role-name').value.trim();
        const levelId = document.getElementById('new-role-level').value;
        const multiplier = document.getElementById('new-role-multiplier').value;

        if (!name) return alert("⚠️ Define un nombre para el nodo.");

        store.dispatch({
            type: 'ADD_ROLE',
            payload: { 
                projectId, 
                role: { 
                    id: 'role-' + Date.now(), 
                    name, levelId, 
                    multiplier: parseFloat(multiplier) || 1,
                    ai_prompt: '', standard_deliverables: [] 
                } 
            }
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 📦 IMPORTAR PLANTILLA
    if (e.target.id === 'btn-import-template') {
        const projectId = e.target.getAttribute('data-pid');
        const sectorKey = document.getElementById('select-template').value;
        if (!sectorKey) return;

        // Reutilizamos la lógica del Kernel v6.1 para inyectar roles
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const template = state.ontology?.sectores[sectorKey];

        if (template) {
            const newRoles = [...project.roles];
            Object.keys(template).forEach(levelId => {
                const r = template[levelId];
                newRoles.push({
                    id: `role-${levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    levelId, name: r.name, multiplier: r.multiplier, ai_prompt: r.ai_prompt || '', standard_deliverables: r.standard_deliverables || [], isArchived: false
                });
            });
            store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: { roles: newRoles } } });
            document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
        }
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Red no encontrada</h2></div>`;

        const session = state.session || { activeUserId: 'unknown', role: 'admin' };
        if (session.role !== 'admin') return `<div class="container text-center" style="padding-top:10vh;"><h3>⛔ Acceso Denegado</h3></div>`;

        const maturity = store.calculateMaturityIndex(projectId);
        const activeRoles = project.roles.filter(r => !r.isArchived);
        
        // Colores por arquetipo para la coherencia visual
        const archColors = { 'startup': 'var(--accent-blue)', 'corporate': 'var(--accent-green)', 'dao': 'var(--accent-gold)' };
        const themeColor = archColors[project.archetype] || 'var(--accent-blue)';

        // 🚀 SET NAVBAR v4.1 (Independiente y Destacada)
        setTimeout(() => {
            if (window.setNavbar) {
                window.setNavbar(
                    [
                        { label: state.config.ecosystemName, hash: '#/' },
                        { label: project.nombre, hash: `#/project/${projectId}` },
                        { label: 'Ingeniería de ADN' }
                    ], 
                    `<span class="badge" style="background:${themeColor}22; color:${themeColor}; margin-left:10px;">${project.archetype.toUpperCase()}</span>`, 
                    `<button class="btn btn-outline" onclick="location.hash='#/project/${projectId}'">🔙 Volver al Dashboard</button>`
                );
            }
        }, 0);

        return `
            <div class="container fade-in" style="max-width: 1300px; margin: 30px auto; padding: 0 20px;">
                
                <div class="grid-layout" style="grid-template-columns: 1fr 1.8fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 25px;">
                        
                        <div class="panel-surface" style="border-top: 4px solid ${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'};">
                            <h4 style="margin: 0 0 10px 0;">Salud Estructural</h4>
                            <div style="font-size: 2rem; font-weight: 800; color: ${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'};">${maturity.score}%</div>
                            <p class="text-small text-muted">Este índice mide si tu red tiene roles equilibrados entre Estrategia, Auditoría y Ejecución.</p>
                            ${maturity.alerts.map(a => `<div style="font-size:0.75rem; color:var(--accent-gold); margin-top:5px; background:rgba(210,153,34,0.1); padding:8px; border-radius:6px;">${a}</div>`).join('')}
                        </div>

                        <div class="panel-surface" style="border-left: 4px solid ${themeColor};">
                            <h3 style="margin-top:0;">Configuración Base</h3>
                            <label class="form-label">Nombre de la Red</label>
                            <input id="edit-proj-name" type="text" class="form-control" value="${project.nombre}">

                            <label class="form-label">Arquetipo Sistémico</label>
                            <select id="edit-proj-archetype" class="form-control" style="border-color: ${themeColor}; font-weight: bold;">
                                <option value="startup" ${project.archetype === 'startup' ? 'selected' : ''}>🚀 Startup (Riesgo x2.0)</option>
                                <option value="corporate" ${project.archetype === 'corporate' ? 'selected' : ''}>🏢 Corporativo (Riesgo x1.0)</option>
                                <option value="dao" ${project.archetype === 'dao' ? 'selected' : ''}>🌍 DAO (Reputación x1.5)</option>
                            </select>

                            <label class="form-label">Sector Industrial</label>
                            <select id="edit-proj-sector" class="form-control">
                                ${Object.keys(state.ontology.sectores).map(s => `<option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                            </select>

                            <button id="btn-save-project-basic" data-pid="${projectId}" class="btn btn-primary btn-block" style="background:${themeColor}; color:#000; border:none; margin-top:10px;">💾 Guardar ADN</button>
                        </div>

                        <div class="panel-surface" style="background: linear-gradient(180deg, rgba(163,113,247,0.05) 0%, transparent 100%); border-top: 3px solid var(--accent-purple);">
                            <h3 style="margin-top:0; color: var(--accent-purple);">Asistente de IA (Dosos)</h3>
                            <p class="text-small text-muted" style="margin-bottom:20px;">Define el contexto para que el auditor automático sea implacable pero justo.</p>
                            
                            <label class="form-label">1. ¿Qué valor aporta esta red?</label>
                            <textarea id="dna-q1" class="form-control" rows="2" placeholder="Ej: Creamos software de logística..."></textarea>

                            <label class="form-label">2. ¿Qué define la excelencia aquí?</label>
                            <textarea id="dna-q2" class="form-control" rows="2" placeholder="Ej: Código limpio, sin bugs y bien documentado..."></textarea>

                            <label class="form-label">3. ¿Cuál es el objetivo final?</label>
                            <textarea id="dna-q3" class="form-control" rows="2" placeholder="Ej: Lanzar MVP en 3 meses..."></textarea>

                            <button id="btn-build-dna" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-purple); color: var(--accent-purple);">🤖 Sincronizar IA</button>
                        </div>
                    </aside>

                    <main style="display: flex; flex-direction: column; gap: 25px;">
                        
                        <div class="panel-surface">
                            <h3 style="margin-top:0; display:flex; justify-content:space-between; align-items:center;">
                                Nodos de la Red
                                <span class="badge" style="background:var(--bg-base);">${activeRoles.length} Activos</span>
                            </h3>

                            <div style="display: flex; gap: 10px; margin-bottom: 30px; background: var(--bg-base); padding: 15px; border-radius: 12px; border: 1px dashed var(--border-color);">
                                <div style="flex:1;">
                                    <label class="form-label">Sector Global</label>
                                    <select id="select-template" class="form-control" style="margin-bottom:0;">
                                        <option value="">-- Importar roles de... --</option>
                                        ${Object.keys(state.ontology.sectores).map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="display:flex; align-items:flex-end;">
                                    <button id="btn-import-template" data-pid="${projectId}" class="btn btn-secondary">Inyectar Plantilla</button>
                                </div>
                            </div>

                            <div class="list-group">
                                ${activeRoles.map(r => `
                                    <div class="panel-surface" style="margin-bottom:15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent-blue);">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <div>
                                                <b style="font-size:1.1rem; color:var(--text-heading);">${r.name}</b>
                                                <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; margin-top:5px;">
                                                    ${r.levelId} | Multiplicador: x${r.multiplier} | FMV: ${r.fmv}€/h
                                                </div>
                                            </div>
                                            <div style="display:flex; gap:10px;">
                                                <button class="btn btn-outline text-small" style="padding:4px 8px; font-size:0.7rem;">⚙️ Editar Ontología</button>
                                                <button class="btn btn-secondary text-small btn-archive-role" data-pid="${projectId}" data-role="${r.id}" style="padding:4px 8px; font-size:0.7rem;">Ocultar</button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                                ${activeRoles.length === 0 ? `<p class="text-center text-muted" style="padding:40px;">No hay roles definidos. Importa una plantilla para empezar.</p>` : ''}
                            </div>

                            <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border-color);">
                                <h4>Añadir Rol Manual</h4>
                                <div style="display:flex; gap:10px;">
                                    <input type="text" id="new-role-name" class="form-control" placeholder="Nombre" style="flex:2;">
                                    <select id="new-role-level" class="form-control" style="flex:1;">
                                        <option value="@anxaneta">@anxaneta</option>
                                        <option value="@aixecador">@aixecador</option>
                                        <option value="@dosos">@dosos</option>
                                        <option value="@baixos" selected>@baixos</option>
                                        <option value="@pinya">@pinya</option>
                                    </select>
                                    <button id="btn-add-role" data-pid="${projectId}" class="btn btn-primary">➕</button>
                                </div>
                            </div>
                        </div>

                    </main>

                </div>
            </div>
        `;
    }
};
