import { store } from '../core/store.js';

let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;
let mapDisplayMode = 'visual-theory'; // Por defecto, que impresione al entrar

// 🛡️ EVENTOS DE LA VISTA
document.addEventListener('click', (e) => {
    
    // --- CAMBIO DE VISTA DEL MAPA ---
    if (e.target.classList.contains('btn-map-mode')) {
        mapDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- LÓGICA ÁGIL (Solo funciona en modo 'list' o en los nodos superiores del modo 'list') ---
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

    // Modal Ágil: Botones
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

    // Formulario Manual
    if (e.target.id === 'btn-add-tx') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const horas = document.getElementById('tx-horas').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!from || !to || !horas || !entregable) return alert("⚠️ Rellena todos los campos.");
        if (from === to) return alert("⚠️ Emisor y receptor deben ser distintos.");

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from, to, horas, entregable, tipo } } });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // Pings y Aprobaciones
    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay usuario asignado al rol receptor. Ve a Accounting.");
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

// 🎨 GENERADOR DEL MAPA SVG (Anti-colisiones y HTML Nodes)
function generateSVGMap(project, isHealthMode) {
    const roles = project.roles.filter(r => !r.isArchived);
    const transactions = project.transactions || [];
    const state = store.getState();
    
    const levels = ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'];
    const nodeCoords = {};
    let svgNodes = '';
    let svgEdges = '';
    let edgeCurveCounter = {}; // Para separar múltiples líneas

    const svgWidth = 900;
    const svgHeight = 700;

    // 1. Calcular Coordenadas y Generar Nodos (Usando <foreignObject> para HTML)
    levels.forEach((levelId, index) => {
        const rolesInLevel = roles.filter(r => r.levelId === levelId);
        const y = 80 + (index * 130); // Separación vertical
        const spacingX = svgWidth / (rolesInLevel.length + 1);

        rolesInLevel.forEach((role, i) => {
            const x = spacingX * (i + 1);
            nodeCoords[role.id] = { x, y, name: role.name, levelIdx: index };
            
            // Buscar usuarios asignados
            const assignees = (project.asignaciones || []).filter(a => a.roleId === role.id);
            let userHTML = '';
            
            if (assignees.length === 0) {
                userHTML = `<div style="font-size:0.65rem; color:var(--text-muted); opacity:0.5; margin-top:4px;">[Vacante]</div>`;
            } else if (assignees.length === 1) {
                const u = state.globalUsers.find(gu => gu.id === assignees[0].userId);
                userHTML = `<div style="font-size:0.7rem; color:var(--accent-blue); background:rgba(88,166,255,0.1); border-radius:10px; padding:2px 6px; margin-top:4px; display:inline-block; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${u ? u.id : assignees[0].userId}</div>`;
            } else {
                // TOOLTIP MULTI-USER (Se muestra al hacer hover vía CSS inline)
                const usersList = assignees.map(a => state.globalUsers.find(gu => gu.id === a.userId)?.name || a.userId).join('<br>');
                userHTML = `
                    <div class="multi-user" style="position:relative; display:inline-block; margin-top:4px;">
                        <div style="font-size:0.7rem; color:var(--accent-purple); background:rgba(163,113,247,0.1); border:1px solid var(--accent-purple); border-radius:10px; padding:2px 6px; cursor:help;">👥 ${assignees.length} Usuarios</div>
                        <div class="hover-tip" style="display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); background:var(--bg-panel); border:1px solid var(--border-color); padding:8px; border-radius:6px; z-index:1000; white-space:nowrap; font-size:0.75rem; color:white; box-shadow:0 5px 15px rgba(0,0,0,0.5); margin-top:5px;">
                            ${usersList}
                        </div>
                    </div>
                `;
            }

            // Inyectamos HTML dentro del SVG para poder usar CSS y tooltips
            svgNodes += `
                <foreignObject x="${x - 70}" y="${y - 35}" width="140" height="80" style="overflow:visible;">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--bg-panel); border:2px solid var(--border-color); border-radius:12px; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:5px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: 0.2s;"
                         onmouseover="this.style.borderColor='var(--accent-blue)'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='block';"
                         onmouseout="this.style.borderColor='var(--border-color)'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='none';">
                        <div style="font-weight:bold; color:var(--text-heading); font-size:0.85rem; line-height:1.2;">${role.name}</div>
                        ${userHTML}
                    </div>
                </foreignObject>
            `;
        });
    });

    // 2. Dibujar Transacciones (Algoritmo The Belly para esquivar nodos)
    transactions.forEach((tx, idx) => {
        const from = nodeCoords[tx.from];
        const to = nodeCoords[tx.to];
        if (!from || !to) return;

        const isTangible = tx.tipo !== 'intangible';
        let strokeDash = isTangible ? "" : "stroke-dasharray='6,6'";
        let strokeColor = isHealthMode ? "var(--text-muted)" : (isTangible ? "var(--accent-green)" : "var(--accent-purple)");
        let strokeWidth = "2";
        let animation = "";
        let opacity = "0.7";

        // MODO SALUD
        if (isHealthMode) {
            if (tx.status === 'consolidated') {
                strokeColor = "var(--accent-green)"; strokeWidth = "3"; opacity = "1";
            } else if (tx.status === 'reported') {
                strokeColor = "var(--accent-blue)"; opacity = "1"; strokeWidth = "2.5";
                animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" repeatCount="indefinite" />`;
                strokeDash = "stroke-dasharray='12,6'";
            } else {
                strokeColor = "var(--accent-red)"; opacity = "0.8";
                animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />`;
                strokeDash = "stroke-dasharray='12,6'";
            }
        }

        // --- MATEMÁTICAS ANTI-COLISIONES (BEZIER) ---
        const levelDiff = Math.abs(from.levelIdx - to.levelIdx);
        let pathData = "";
        
        // Clave única para el par (sin importar dirección) para separar múltiples transacciones entre los mismos 2 nodos
        const pairKey = [tx.from, tx.to].sort().join('-');
        edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        const offsetMultiplier = edgeCurveCounter[pairKey];

        if (levelDiff <= 1) {
            // Nodos contiguos: Línea casi recta pero con un ligero arco para separar si hay múltiples
            const curve = 20 * offsetMultiplier * (from.levelIdx > to.levelIdx ? 1 : -1);
            pathData = `M ${from.x} ${from.y + (from.y<to.y?35:-35)} Q ${(from.x+to.x)/2 + curve} ${(from.y+to.y)/2}, ${to.x} ${to.y + (from.y<to.y?-35:35)}`;
        } else {
            // Salto de niveles: Hacemos una "barriga" lateral pronunciada para esquivar los nodos centrales
            const isLeft = (from.x + to.x) / 2 < (svgWidth / 2);
            const bellySize = (isLeft ? -120 : 120) * (1 + (offsetMultiplier * 0.2)); 
            
            pathData = `M ${from.x} ${from.y + (from.y<to.y?35:-35)} C ${from.x + bellySize} ${(from.y+to.y)/2}, ${to.x + bellySize} ${(from.y+to.y)/2}, ${to.x} ${to.y + (from.y<to.y?-35:35)}`;
        }

        const pathId = `edge-${tx.hash}`;
        
        // Flecha de dirección en la mitad del camino
        const markerId = `arrow-${tx.hash}`;

        svgEdges += `
            <defs>
                <marker id="${markerId}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="${strokeColor}" opacity="${opacity}"/>
                </marker>
            </defs>
            <path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="${opacity}" marker-mid="url(#${markerId})">
                ${animation}
            </path>
            <text font-size="11" fill="var(--text-heading)" font-family="sans-serif" font-weight="bold" opacity="${opacity}">
                <textPath href="#${pathId}" startOffset="50%" text-anchor="middle" dominant-baseline="text-after-edge" style="transform:translateY(-5px);">
                    ${tx.entregable.length > 20 ? tx.entregable.substring(0, 20) + '...' : tx.entregable}
                </textPath>
            </text>
        `;
    });

    return `
        <div style="width:100%; overflow-x:auto; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;">
            <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block; margin: 0 auto; overflow:visible;">
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

        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        const isAdmin = session.role === 'admin';
        const roles = project.roles.filter(r => !r.isArchived);
        const transactions = project.transactions || [];
        const resilience = store.calculateResilience(projectId);

        let modalHTML = '';
        if (showAgileModal && isAdmin) {
            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel" style="width: 400px; border-color: var(--accent-blue);">
                        <h3 style="margin-top: 0; color: var(--accent-blue);">⚡ Nuevo Flujo de Valor</h3>
                        <label class="form-label">Entregable (PoW):</label>
                        <input type="text" id="agile-entregable" class="form-control" placeholder="Ej: Campaña Ads">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label class="form-label">Slicing (Horas):</label>
                                <input type="number" step="0.5" id="agile-horas" class="form-control" placeholder="2.5">
                            </div>
                            <div>
                                <label class="form-label">Tipo:</label>
                                <select id="agile-tipo" class="form-control"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select>
                            </div>
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
                                ${!isAdmin ? '<span class="badge" style="background: rgba(210, 153, 34, 0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold);">👁️ LECTURA (User)</span>' : ''}
                            </h1>
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-theory' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="visual-theory" data-pid="${projectId}">🕸️ Mapa de Diseño</button>
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-health' ? 'btn-primary' : 'btn-outline'} text-small" style="${mapDisplayMode === 'visual-health' ? '' : 'border-color: var(--accent-red); color: var(--accent-red);'}" data-mode="visual-health" data-pid="${projectId}">❤️ Modo Flujo Vital</button>
                                ${isAdmin ? `<button class="btn btn-map-mode ${mapDisplayMode === 'list' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="list" data-pid="${projectId}">📝 Creador Ágil / Lista</button>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${isAdmin ? `
                                <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Editar Ontología</button>
                                <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Accounting (Slicing)</button>
                            ` : `<button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">Mi Bandeja de Tareas</button>`}
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="${(isAdmin && mapDisplayMode === 'list') ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 1000px; margin: 0 auto;'}">
                    
                    <main>
                        ${mapDisplayMode !== 'list' ? 
                            // RENDERIZADO VISUAL (SVG + HTML)
                            generateSVGMap(project, mapDisplayMode === 'visual-health') 
                        : `
                            <section class="panel-surface" style="margin-bottom: 25px; border: 1px dashed var(--border-color);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h4 style="margin: 0;">Nodos del Sistema</h4>
                                    <span style="font-size: 0.75rem; color: var(--accent-blue);">${!agileOriginId ? 'Paso 1: Clic en el Emisor' : 'Paso 2: Clic en el Receptor'}</span>
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                    ${roles.map(r => `
                                        <div class="node-bubble" data-id="${r.id}" data-pid="${projectId}" 
                                             style="background: ${r.id === agileOriginId ? 'rgba(35,134,54,0.1)' : 'var(--bg-panel)'}; border: ${r.id === agileOriginId ? '2px solid var(--accent-green)' : '1px solid var(--border-color)'}; padding: 10px 20px; border-radius: 30px; cursor: pointer;">
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
