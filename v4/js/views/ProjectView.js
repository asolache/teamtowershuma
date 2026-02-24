import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// 🛡️ EVENTOS BLINDADOS CONTRA SES
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-role-view') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name').value;
        const levelId = document.getElementById('nr-level').value;
        if(!name) return alert("Por favor, introduce un nombre para el rol o especialista.");
        
        // Usamos la nueva acción CREATE_ROLE de v4.4
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        
        // 🛠️ FIX: Refrescar vista al añadir rol
        const app = document.getElementById('app');
        if (app) app.innerHTML = ProjectView.render(projectId);
    }
    
    if (e.target.id === 'btn-add-tx-view') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!entregable) return alert("Por favor, define qué se entrega en esta transacción.");

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, entregable, tipo, horas: 1 } } });

        // 🛠️ FIX: Forzar el refresco de la vista para que el mapa dibuje la nueva flecha inmediatamente
        const app = document.getElementById('app');
        if (app) app.innerHTML = ProjectView.render(projectId);
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `
            <div class="container text-center">
                <h2>🏰 Proyecto no encontrado</h2>
                <button class="btn btn-outline" onclick="location.hash='#/'">Volver al Dashboard</button>
            </div>`;

        const salud = store.calculateResilience(projectId);
        const colorSalud = salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)';
        
        // 🚀 Ocultamos "Ecosistema" y roles archivados de los selectores de transacción
        const activeRoles = (project.roles || []).filter(r => 
            !r.isArchived && 
            r.id !== 'ecosistema' && 
            r.name.toLowerCase() !== 'ecosistema'
        );
        const optionsHtml = activeRoles.map(n => `<option value="${n.id}">${n.name} (${n.levelId})</option>`).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>🏰 ${project.nombre}</h1>
                        <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
                            <span class="text-muted text-uppercase">Sector: <b class="text-accent">${project.sector}</b></span>
                            <span class="text-uppercase" style="color: ${colorSalud}; font-weight: bold; font-size: 0.8rem;">
                                Resiliencia: ${salud}%
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="location.hash='#/'">← Dashboard</button>
                        <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Diseñar Ecosistema</button>
                        <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Contabilidad</button>
                    </div>
                </header>

                <div class="grid-layout">
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel">
                            <h3 class="text-accent text-uppercase text-small">+ Nuevo Rol / Especialista</h3>
                            
                            <label class="form-label">Nombre del Nodo</label>
                            <input id="nr-name" class="form-control" placeholder="Ej: Tech Lead, Dr. García...">
                            
                            <label class="form-label">Nivel de Jerarquía</label>
                            <select id="nr-level" class="form-control">
                                <option value="@anxaneta">Nivel: Dirección / C-Level (@anxaneta)</option>
                                <option value="@aixecador">Nivel: Management / Directores (@aixecador)</option>
                                <option value="@dosos">Nivel: Mandos Medios / QA (@dosos)</option>
                                <option value="@baixos">Nivel: Operativa / Especialistas (@baixos)</option>
                                <option value="@pinya">Nivel: Soporte / Base (@pinya)</option>
                            </select>
                            
                            <button id="btn-add-role-view" data-pid="${projectId}" class="btn btn-secondary btn-block" style="margin-top: 10px;">
                                Inyectar al Sistema
                            </button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h3 class="text-uppercase text-small" style="color: var(--accent-purple);">⚡ Nueva Transacción</h3>
                            
                            <label class="form-label">DE (Origen):</label>
                            <select id="tx-from" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">PARA (Destino):</label>
                            <select id="tx-to" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">Entregable de Valor:</label>
                            <input id="tx-entregable" class="form-control text-small" placeholder="¿Qué fluye aquí?">
                            
                            <label class="form-label">Naturaleza del Flujo:</label>
                            <select id="tx-tipo" class="form-control text-small">
                                <option value="tangible">Tangible (Línea Continua)</option>
                                <option value="intangible">Intangible (Línea Discontinua)</option>
                            </select>
                            
                            <button id="btn-add-tx-view" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 10px;">
                                Registrar Flujo →
                            </button>
                        </div>
                    </aside>

                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="map-container" style="background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); padding: 20px; text-align: center;">
                            ${ValueMapView.render(projectId)}
                        </div>

                        <section class="panel" style="border-color: var(--accent-blue); background-color: rgba(88, 166, 255, 0.03);">
                            <h3 class="text-accent" style="margin-top: 0; font-size: 1rem;">ℹ️ Guía del Ecosistema y Jerarquía Corporativa</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 0.85rem; color: var(--text-muted);">
                                <div>
                                    <h4 style="color: var(--text-heading); margin-bottom: 8px; font-size: 0.9rem;">🏢 Niveles de Rol (Metáfora del Castell)</h4>
                                    <p style="margin-bottom: 10px; font-size: 0.8rem;">El ecosistema se distribuye en órbitas concéntricas desde la estrategia central hasta la operativa periférica:</p>
                                    <ul style="margin-top: 0; padding-left: 20px;">
                                        <li style="margin-bottom: 6px;"><b class="text-accent">Dirección / C-Level (@anxaneta):</b> CEO, Socios, Estrategia global. Toman decisiones clave. Máximo multiplicador financiero. (Centro del mapa).</li>
                                        <li style="margin-bottom: 6px;"><b class="text-accent">Management (@aixecador):</b> Directores de área, Project Managers. Conectan la estrategia con la ejecución.</li>
                                        <li style="margin-bottom: 6px;"><b class="text-accent">Mandos Medios / QA (@dosos):</b> Team Leads, Control de Calidad, Auditores. Aseguran que el trabajo es óptimo. Vitales para la resiliencia.</li>
                                        <li style="margin-bottom: 6px;"><b class="text-accent">Operativa (@baixos):</b> Especialistas, Desarrolladores, Técnicos. La fuerza de producción directa del ecosistema.</li>
                                        <li style="margin-bottom: 6px;"><b class="text-accent">Soporte Base (@pinya):</b> Administración, Logística, Base de la pirámide. Sostienen la estructura corporativa.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 style="color: var(--text-heading); margin-bottom: 8px; font-size: 0.9rem;">⚡ Flujos de Valor y Resiliencia</h4>
                                    <ul style="margin-top: 0; padding-left: 20px;">
                                        <li style="margin-bottom: 6px;"><b>Flujo Tangible (Línea Continua Azul):</b> Intercambio de valor directo, material o cuantificable (código, presupuesto, informes terminados).</li>
                                        <li style="margin-bottom: 6px;"><b>Flujo Intangible (Línea Discontinua Violeta):</b> Transferencia de valor no material (conocimiento, ideas, feedback, validación, autoridad).</li>
                                        <li style="margin-bottom: 6px;"><b>Secuenciación:</b> Puedes alterar el orden temporal (Fase 1, Fase 2...) de estas transacciones desde la pestaña <i>Diseñar Ecosistema</i>.</li>
                                        <li style="margin-bottom: 6px;"><b>Resiliencia (Salud del Sistema):</b> Se calcula monitoreando cuántos flujos pasan por el nivel <code>@dosos</code> (Calidad). Un ecosistema que produce sin auditar reduce drásticamente su resiliencia.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        `;
    }
};
