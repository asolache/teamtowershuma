import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// 🚀 ESTADO GLOBAL DE LA VISTA DEL MAPA
let activeMapView = 'teorico';

document.addEventListener('click', (e) => {
    // --- LÓGICA DEL SELECTOR DE MAPA ---
    if (e.target.classList.contains('btn-map-view')) {
        activeMapView = e.target.getAttribute('data-view');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- CREACIÓN RÁPIDA ---
    if (e.target.id === 'btn-add-role-view') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name').value;
        const levelId = document.getElementById('nr-level').value;
        if(!name) return alert("Por favor, introduce un nombre para el rol o especialista.");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }
    
    if (e.target.id === 'btn-add-tx-view') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!entregable) return alert("Por favor, define qué se entrega en esta transacción.");
        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, entregable, tipo, horas: 1 } } });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- GOBERNANZA OPERATIVA (PINGS Y LEDGER) ---
    if (e.target.classList.contains('btn-ping-tx')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const userId = prompt("Introduce el ID del usuario a asignar la tarea (por defecto usr-human-01):", "usr-human-01");
        
        if (userId) {
            store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId, txHash, userId } });
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
        }
    }

    if (e.target.classList.contains('btn-approve-tx')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        if (confirm("¿Confirmas la calidad del entregable para consolidarlo en el Ledger?")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId, txHash } });
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
        }
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = (project.roles || []).filter(r => !r.isArchived);
        const optionsHtml = activeRoles.map(n => `<option value="${n.id}">${n.name} (${n.levelId})</option>`).join('');
        const sortedTxs = [...(project.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));

        // 🚀 TABLA DE GOBERNANZA
        const tableHTML = sortedTxs.length === 0 ? '<p class="text-muted text-center" style="padding: 10px;">No hay flujos teóricos creados.</p>' : `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; margin-top: 15px;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                        <th style="padding: 8px;">Fase</th>
                        <th>De (Rol)</th>
                        <th>Entregable</th>
                        <th>Estado</th>
                        <th style="text-align: right;">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTxs.map(tx => {
                        const rFrom = project.roles.find(r => r.id === tx.from);
                        let actionButton = '';
                        let statusText = '';
                        
                        if (tx.status === 'theoretical' || !tx.status) {
                            statusText = `<span style="color:var(--text-muted);">Diseñado</span>`;
                            actionButton = `<button class="btn btn-outline btn-ping-tx" data-hash="${tx.hash}" data-pid="${project.id}" style="font-size: 0.65rem; padding: 3px 8px;">📨 Solicitar (Ping)</button>`;
                        } else if (tx.status === 'pinged') {
                            statusText = `<span style="color:var(--accent-gold);">⏳ En progreso (@${tx.assigneeId})</span>`;
                            actionButton = `<span style="font-size: 0.7rem; color: var(--text-muted);">Esperando...</span>`;
                        } else if (tx.status === 'reported') {
                            statusText = `<span style="color:var(--accent-blue);">📤 Reportado (${tx.realHours}h)</span>`;
                            actionButton = `
                                <div style="display:flex; justify-content:flex-end; gap:8px;">
                                    <a href="${tx.proofLink}" target="_blank" class="btn btn-outline" style="font-size:0.65rem; padding: 3px 8px;">🔗 Prueba</a>
                                    <button class="btn btn-primary btn-approve-tx" data-hash="${tx.hash}" data-pid="${project.id}" style="font-size: 0.65rem; padding: 3px 8px; background:var(--accent-green);">✅ Sellar</button>
                                </div>
                            `;
                        } else if (tx.status === 'consolidated') {
                            statusText = `<span style="color:var(--accent-green); font-weight:bold;">✅ Ledger</span>`;
                            actionButton = `<span style="font-size: 0.7rem; color: var(--accent-green);">Aprobado</span>`;
                        }

                        return `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: ${tx.status === 'reported' ? 'rgba(35, 134, 54, 0.05)' : 'transparent'};">
                            <td style="padding: 10px 8px;">F${tx.fase || '-'}</td>
                            <td><span style="font-weight: bold;">${rFrom?.name || 'Base'}</span></td>
                            <td><b>${tx.entregable}</b></td>
                            <td>${statusText}</td>
                            <td style="text-align: right;">${actionButton}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Lógica de estilos para los botones del mapa
        const getBtnStyle = (view) => `
            background: ${activeMapView === view ? 'var(--bg-panel)' : 'transparent'};
            color: ${activeMapView === view ? 'var(--text-heading)' : 'var(--text-muted)'};
            border: 1px solid ${activeMapView === view ? 'var(--border-color)' : 'transparent'};
            padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
        `;

        // Textos dinámicos del mapa
        const mapDescriptions = {
            'teorico': 'Visualizando el <b>Diseño Estratégico</b>. Muestra qué roles deberían interactuar según la ontología.',
            'contable': 'Visualizando la <b>Realidad Operativa</b>. Muestra las interacciones que han generado Slicing Pie real en el Ledger.',
            'friccion': 'Visualizando el <b>Diagnóstico VNA</b>. Identifica cuellos de botella y flujos con riesgo de burnout (Falta de reciprocidad).'
        };

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <b style="color: #f0f6fc;">${project.nombre}</b> /
                        <span style="color: var(--accent-gold); font-weight:bold;">Maping & Operación</span> /
                        <a href="#/project/${projectId}/edit" style="color: var(--text-muted); text-decoration: none;">Configurador</a> /
                        <a href="#/project/${projectId}/accounting" style="color: var(--text-muted); text-decoration: none;">Accounting</a>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(163, 113, 247, 0.05) 100%); border: 1px solid var(--accent-blue); border-radius: 12px; padding: 25px;">
                        <h1 style="color: var(--accent-blue); margin-top: 0;">Centro de Operaciones VNA</h1>
                        <p style="margin: 0; font-size: 1rem; color: var(--text-main);">
                            <b>Propuesta de Valor:</b> Transforma el diseño estratégico en operaciones medibles. 
                            Asigna tareas mediante <i>Pings</i>, evalúa la salud real de la red en el mapa y consolida el trabajo finalizado en <i>Equity Real (Slicing Pie)</i>.
                        </p>
                    </div>
                </header>

                <section class="panel" style="margin-bottom: 30px; border-color: var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                🌐 Explorador de Red de Valor
                                ${project.isVerified ? `<span style="color:#3fb950; background:rgba(63, 185, 80, 0.1); padding:2px 8px; border-radius:12px; font-size:0.6rem; border:1px solid #3fb950;">Sello Owner</span>` : ''}
                            </h3>
                            <p class="text-small text-muted" style="margin-top: 5px;">${mapDescriptions[activeMapView]}</p>
                        </div>

                        <div style="background: rgba(0,0,0,0.3); padding: 4px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex;">
                            <button class="btn-map-view" data-pid="${projectId}" data-view="teorico" style="${getBtnStyle('teorico')}">📘 Teórico</button>
                            <button class="btn-map-view" data-pid="${projectId}" data-view="contable" style="${getBtnStyle('contable')}">📒 Contable</button>
                            <button class="btn-map-view" data-pid="${projectId}" data-view="friccion" style="${getBtnStyle('friccion')}">🔥 Fricción</button>
                        </div>
                    </div>

                    ${ValueMapView.render(projectId, activeMapView)}
                </section>

                <div style="display: grid; grid-template-columns: 350px 1fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel-surface" style="border: 1px dashed var(--border-color);">
                            <h4 style="margin-top: 0; color: var(--text-heading);">+ Inyectar Nodo</h4>
                            <input id="nr-name" class="form-control text-small" placeholder="Nombre del Rol (Ej: QA)">
                            <select id="nr-level" class="form-control text-small">
                                <option value="@anxaneta">Dirección (@anxaneta)</option>
                                <option value="@aixecador">Management (@aixecador)</option>
                                <option value="@dosos">Auditoría (@dosos)</option>
                                <option value="@baixos">Operativa (@baixos)</option>
                                <option value="@pinya">Soporte (@pinya)</option>
                            </select>
                            <button id="btn-add-role-view" data-pid="${projectId}" class="btn btn-secondary btn-block text-small">Añadir al Ecosistema</button>
                        </div>

                        <div class="panel-surface" style="border: 1px dashed var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">⚡ Nuevo Flujo Teórico</h4>
                            <label class="form-label">De:</label>
                            <select id="tx-from" class="form-control text-small">${optionsHtml}</select>
                            <label class="form-label">Para:</label>
                            <select id="tx-to" class="form-control text-small">${optionsHtml}</select>
                            <label class="form-label">Entregable:</label>
                            <input id="tx-entregable" class="form-control text-small" placeholder="Ej: Código Revisado">
                            <label class="form-label">Tipo:</label>
                            <select id="tx-tipo" class="form-control text-small">
                                <option value="tangible">Tangible (Azul)</option>
                                <option value="intangible">Intangible (Morado)</option>
                            </select>
                            <button id="btn-add-tx-view" data-pid="${projectId}" class="btn btn-primary btn-block text-small" style="margin-top: 10px;">Trazar Flujo</button>
                        </div>
                    </aside>

                    <main>
                        <div class="panel" style="border-color: var(--accent-gold); height: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="margin-top: 0; color: var(--accent-gold);">📋 Gobernanza de Entregables</h3>
                                <div style="text-align: right;">
                                    <span class="text-muted text-uppercase" style="font-size: 0.6rem;">Salud Auditoría</span>
                                    <div style="color: ${store.calculateResilience(projectId) > 40 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: bold;">${store.calculateResilience(projectId)}%</div>
                                </div>
                            </div>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Envía <b>Pings</b> a los usuarios para que ejecuten las tareas del mapa, y consolida sus reportes en Slicing Pie.</p>
                            ${tableHTML}
                        </div>
                    </main>
                </div>

            </div>
        `;
    }
};
