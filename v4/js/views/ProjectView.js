import { store } from '../core/store.js';

let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;
let mapDisplayMode = 'list'; // 'list', 'visual-theory', 'visual-health'

document.addEventListener('click', (e) => {
    // --- CAMBIO DE VISTA DEL MAPA ---
    if (e.target.classList.contains('btn-map-mode')) {
        mapDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- LÓGICA ÁGIL ---
    const nodeElement = e.target.closest('.node-bubble');
    if (nodeElement && mapDisplayMode === 'list') {
        const state = store.getState();
        if ((state.session?.role || 'admin') !== 'admin') return;

        const clickedRoleId = nodeElement.getAttribute('data-id');
        const projectId = nodeElement.getAttribute('data-pid');

        if (!agileOriginId) { agileOriginId = clickedRoleId; } 
        else if (agileOriginId === clickedRoleId) { agileOriginId = null; } 
        else {
            agileDestinationId = clickedRoleId;
            showAgileModal = true;
        }
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
        if (showAgileModal) setTimeout(() => document.getElementById('agile-entregable').focus(), 100);
    }

    if (e.target.id === 'btn-agile-cancel') {
        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(e.target.getAttribute('data-pid'));
    }

    if (e.target.id === 'btn-agile-save') {
        const projectId = e.target.getAttribute('data-pid');
        const entregable = document.getElementById('agile-entregable').value.trim();
        const horas = document.getElementById('agile-horas').value;
        const tipo = document.getElementById('agile-tipo').value;

        if (!entregable || !horas) return alert("⚠️ Define el entregable y la estimación.");

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: { projectId, tx: { from: agileOriginId, to: agileDestinationId, horas, entregable, tipo } }
        });

        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    if (e.target.id === 'btn-add-tx') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const horas = document.getElementById('tx-horas').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!from || !to || !horas || !entregable) return alert("⚠️ Rellena todos los campos.");
        if (from === to) return alert("⚠️ Emisor y receptor deben ser distintos.");

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: { projectId, tx: { from, to, horas, entregable, tipo } }
        });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay usuario asignado a este Rol.");
        store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId, txHash, userId: asignacion.userId } });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    if (e.target.classList.contains('btn-approve')) {
        if (confirm("¿Consolidar trabajo e inyectar Equity?")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: e.target.getAttribute('data-pid'), txHash: e.target.getAttribute('data-hash') } });
            document.getElementById('app').innerHTML = ProjectView.render(e.target.getAttribute('data-pid'));
        }
    }
});

// 🎨 GENERADOR DEL MAPA SVG
function generateSVGMap(roles, transactions, isHealthMode) {
    const levels = ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'];
    const nodeCoords = {};
    let svgNodes = '';
    let svgEdges = '';

    // 1. Calcular Coordenadas (Y por nivel, X distribuida)
    levels.forEach((levelId, index) => {
        const rolesInLevel = roles.filter(r => r.levelId === levelId);
        const y = 80 + (index * 120); // 120px de separación vertical
        const spacingX = 800 / (rolesInLevel.length + 1);

        rolesInLevel.forEach((role, i) => {
            const x = spacingX * (i + 1);
            nodeCoords[role.id] = { x, y, name: role.name, level: levelId };
            
            // Dibujar Nodo
            svgNodes += `
                <g transform="translate(${x},${y})">
                    <circle cx="0" cy="0" r="35" fill="var(--bg-panel)" stroke="var(--accent-blue)" stroke-width="2"/>
                    <text x="0" y="-5" text-anchor="middle" fill="var(--text-heading)" font-size="12" font-weight="bold" font-family="sans-serif">${role.name}</text>
                    <text x="0" y="12" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="sans-serif">${levelId.replace('@','')}</text>
                </g>
            `;
        });
    });

    // 2. Dibujar Flujos (Edges)
    transactions.forEach(tx => {
        const from = nodeCoords[tx.from];
        const to = nodeCoords[tx.to];
        if (!from || !to) return;

        const isTangible = tx.tipo !== 'intangible';
        const strokeDash = isTangible ? "" : "stroke-dasharray='5,5'";
        let strokeColor = "var(--text-muted)";
        let strokeWidth = "2";
        let animation = "";

        if (isHealthMode) {
            // MODO SANGRE (Salud): Verde si completado, Rojo latiendo si pendiente
            if (tx.status === 'consolidated') {
                strokeColor = "var(--accent-green)";
                strokeWidth = "3";
            } else if (tx.status === 'reported') {
                strokeColor = "var(--accent-blue)";
                animation = `<animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.5s" repeatCount="indefinite" />`;
                strokeDash = "stroke-dasharray='10,5'";
            } else {
                strokeColor = "var(--accent-red)";
                animation = `<animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />`;
                strokeDash = "stroke-dasharray='10,5'";
            }
        }

        // Curva Bezier para que quede orgánico
        const pathData = `M ${from.x} ${from.y} C ${from.x} ${(from.y + to.y)/2}, ${to.x} ${(from.y + to.y)/2}, ${to.x} ${to.y}`;

        svgEdges += `
            <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="0.6">
                ${animation}
            </path>
            <text x="${(from.x + to.x)/2}" y="${(from.y + to.y)/2}" fill="${strokeColor}" font-size="16" text-anchor="middle" dominant-baseline="central">
                ${from.y > to.y ? '↑' : '↓'}
            </text>
        `;
    });

    return `
        <div style="width:100%; overflow-x:auto; background: radial-gradient(circle, rgba(88,166,255,0.05) 0%, transparent 100%); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;">
            <svg width="800" height="600" viewBox="0 0 800 600" style="display:block; margin: 0 auto;">
                ${svgEdges}
                ${svgNodes}
            </svg>
        </div>
    `;
}

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const isAdmin = (state.session?.role || 'admin') === 'admin';
        const roles = project.roles.filter(r => !r.isArchived);
        const transactions = project.transactions || [];
        const resilience = store.calculateResilience(projectId);

        let modalHTML = '';
        if (showAgileModal && isAdmin) {
            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel" style="width: 400px; border-color: var(--accent-blue);">
                        <h3 style="margin-top: 0; color: var(--accent-blue);">⚡ Nuevo Flujo de Valor</h3>
                        <input type="text" id="agile-entregable" class="form-control" placeholder="Nombre del Entregable (Ej: Campaña Ads)">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <input type="number" step="0.5" id="agile-horas" class="form-control" placeholder="Horas">
                            <select id="agile-tipo" class="form-control"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button id="btn-agile-cancel" data-pid="${projectId}" class="btn btn-secondary" style="flex:1;">Cancelar</button>
                            <button id="btn-agile-save" data-pid="${projectId}" class="btn btn-primary" style="flex:1;">Sellar</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            ${modalHTML}
            <div class="container fade-in">
                <header style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
                        <div>
                            <h1 style="margin: 0; font-size: 2.2rem; display: flex; align-items: center; gap: 15px;">
                                🗺️ ${project.nombre}
                                ${!isAdmin ? '<span class="badge" style="background: rgba(210, 153, 34, 0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold);">👁️ MODO LECTURA</span>' : ''}
                            </h1>
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button class="btn btn-map-mode ${mapDisplayMode === 'list' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="list" data-pid="${projectId}">📝 Modo Lista (Ágil)</button>
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-theory' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="visual-theory" data-pid="${projectId}">🕸️ Mapa Teórico</button>
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-health' ? 'btn-primary' : 'btn-outline'} text-small" style="${mapDisplayMode === 'visual-health' ? '' : 'border-color: var(--accent-red); color: var(--accent-red);'}" data-mode="visual-health" data-pid="${projectId}">❤️ Modo Salud (Flujo Vivo)</button>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${isAdmin ? `
                                <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Ontología</button>
                                <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Contabilidad</button>
                            ` : `<button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">Mi Bandeja</button>`}
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="${isAdmin ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 1000px; margin: 0 auto;'}">
                    
                    <main>
                        <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <b style="color: var(--accent-blue);">La Metáfora Casteller (Topología):</b>
                                <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-muted);">
                                    <li><b>@anxaneta (Cúspide):</b> Visión, Estrategia, Alto Riesgo.</li>
                                    <li><b>@aixecador & @dosos (Medio):</b> Coordinación, Táctica y QA.</li>
                                    <li><b>@baixos & @pinya (Base):</b> Ejecución, Operativa y Soporte.</li>
                                </ul>
                            </div>
                            <div>
                                <b style="color: var(--accent-purple);">Reglas de Flujo:</b>
                                <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-muted);">
                                    <li><b>UP ⬆️ (Línea Continua):</b> Valor Tangible creado por la Base y entregado hacia arriba.</li>
                                    <li><b>DOWN ⬇️ (Línea Discontinua):</b> Valor Intangible (Auditoría, Fricción, Dirección) enviado hacia abajo.</li>
                                </ul>
                            </div>
                        </div>

                        ${mapDisplayMode !== 'list' ? 
                            generateSVGMap(roles, transactions, mapDisplayMode === 'visual-health') 
                        : `
                            <section class="panel-surface" style="margin-bottom: 25px; border: 1px dashed var(--border-color);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h4 style="margin: 0;">Nodos del Sistema</h4>
                                    ${isAdmin ? `<button class="btn btn-outline text-small" style="padding: 2px 8px;" onclick="location.hash='#/project/${projectId}/edit'">✏️ Editar Nodos</button>` : ''}
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                    ${roles.map(r => `
                                        <div class="node-bubble" data-id="${r.id}" data-pid="${projectId}" 
                                             style="background: ${r.id === agileOriginId ? 'rgba(35,134,54,0.1)' : 'var(--bg-panel)'}; border: ${r.id === agileOriginId ? '2px solid var(--accent-green)' : '1px solid var(--border-color)'}; padding: 10px 20px; border-radius: 30px; cursor: ${isAdmin ? 'pointer' : 'default'};">
                                            <b>${r.name}</b> <span style="font-size:0.6rem; color:var(--text-muted);">${r.levelId}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>

                            <div class="list-group">
                                ${transactions.length === 0 ? '<div class="text-center text-muted">Aún no hay transacciones.</div>' : transactions.slice().reverse().map(tx => {
                                    const rFrom = roles.find(r => r.id === tx.from);
                                    const rTo = roles.find(r => r.id === tx.to);
                                    let statusUI = ''; let actionBtn = '';

                                    if (tx.status === 'theoretical') {
                                        statusUI = `📦 Teórico`;
                                        if (isAdmin) actionBtn = `<button class="btn btn-outline btn-ping text-small" data-hash="${tx.hash}" data-pid="${project.id}" data-torole="${tx.to}">Ping ⚡</button>`;
                                    } else if (tx.status === 'reported') {
                                        statusUI = `<span style="color:var(--accent-blue);">📝 PoW Recibido</span>`;
                                        if (isAdmin) actionBtn = `<button class="btn btn-primary btn-approve text-small" data-hash="${tx.hash}" data-pid="${project.id}">Aprobar</button>`;
                                    } else if (tx.status === 'consolidated') {
                                        statusUI = `<span style="color:var(--accent-green);">✅ Ledger</span>`;
                                    } else {
                                        statusUI = `⏳ Esperando...`;
                                    }

                                    return `
                                    <div class="panel-surface" style="margin-bottom: 12px; border-left: 4px solid ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                            <b>${tx.entregable}</b>
                                            <span class="badge" style="background:rgba(255,255,255,0.05); color:var(--text-muted);">${tx.tipo === 'tangible' ? '⬆️ Tangible' : '⬇️ Intangible'}</span>
                                        </div>
                                        <div style="display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; margin-bottom:10px;">
                                            <div style="flex:1; text-align:right; font-size:0.8rem;">${rFrom?.name || 'Borrado'}</div>
                                            <div style="color:var(--accent-blue);">⟶</div>
                                            <div style="flex:1; font-size:0.8rem;">${rTo?.name || 'Borrado'}</div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <div class="text-small text-muted">${statusUI} | Est: ${tx.estimatedHours}h</div>
                                            <div>${actionBtn}</div>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    ${isAdmin && mapDisplayMode === 'list' ? `
                        <aside>
                            <div class="panel" style="position: sticky; top: 120px; border-color: var(--accent-blue);">
                                <h3 style="margin-top: 0;">⌨️ Mapeo Manual</h3>
                                <select id="tx-from" class="form-control"><option value="">Emisor...</option>${roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <select id="tx-to" class="form-control"><option value="">Receptor...</option>${roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}</select>
                                <input type="text" id="tx-entregable" class="form-control" placeholder="Entregable">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <input type="number" step="0.5" id="tx-horas" class="form-control" placeholder="Horas">
                                    <select id="tx-tipo" class="form-control"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select>
                                </div>
                                <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top:10px;">Añadir</button>
                            </div>
                        </aside>
                    ` : ''}
                </div>
            </div>
        `;
    }
};
