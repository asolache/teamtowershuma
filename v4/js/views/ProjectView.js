import { store } from '../core/store.js';

let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;
let mapDisplayMode = 'visual-theory'; 

// 🎨 PALETA DE COLORES ONTOLÓGICOS (Para identificar los niveles en la red)
const ROLE_COLORS = {
    "@anxaneta": { bg: "rgba(210, 153, 34, 0.15)", border: "var(--accent-gold)", text: "var(--accent-gold)" },
    "@aixecador": { bg: "rgba(163, 113, 247, 0.15)", border: "var(--accent-purple)", text: "var(--accent-purple)" },
    "@dosos": { bg: "rgba(88, 166, 255, 0.15)", border: "var(--accent-blue)", text: "var(--accent-blue)" },
    "@baixos": { bg: "rgba(35, 134, 54, 0.15)", border: "var(--accent-green)", text: "var(--accent-green)" },
    "@pinya": { bg: "rgba(248, 81, 73, 0.15)", border: "var(--accent-red)", text: "var(--accent-red)" }
};

document.addEventListener('click', (e) => {
    // --- CAMBIO DE VISTA DEL MAPA ---
    if (e.target.classList.contains('btn-map-mode')) {
        mapDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- LÓGICA ÁGIL (Nodos superiores en modo lista) ---
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

// 🧠 ALGORITMO DE FÍSICAS (Force-Directed Graph nativo)
function calculateNetworkLayout(roles, transactions, width, height) {
    const nodes = {};
    const radius = Math.min(width, height) / 2.5;
    const centerX = width / 2;
    const centerY = height / 2;

    // Inicializar nodos en un círculo
    roles.forEach((r, i) => {
        const angle = (i / roles.length) * 2 * Math.PI;
        nodes[r.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            vx: 0, vy: 0
        };
    });

    // Simulación de fuerzas (Iteraciones)
    const iterations = 100;
    const k = Math.sqrt((width * height) / roles.length); // Factor de distancia óptima

    for (let iter = 0; iter < iterations; iter++) {
        // 1. Fuerzas de repulsión (Evitar que los nodos se choquen)
        for (let i = 0; i < roles.length; i++) {
            for (let j = 0; j < roles.length; j++) {
                if (i !== j) {
                    const n1 = nodes[roles[i].id];
                    const n2 = nodes[roles[j].id];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const force = (k * k) / distance;
                    n1.vx += (dx / distance) * force;
                    n1.vy += (dy / distance) * force;
                }
            }
        }

        // 2. Fuerzas de atracción (Los enlaces juntan los nodos)
        transactions.forEach(tx => {
            if (!nodes[tx.from] || !nodes[tx.to]) return;
            const n1 = nodes[tx.from];
            const n2 = nodes[tx.to];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const distance = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (distance * distance) / k;
            const fx = (dx / distance) * force * 0.05; // Tensión del muelle
            const fy = (dy / distance) * force * 0.05;
            n1.vx -= fx; n1.vy -= fy;
            n2.vx += fx; n2.vy += fy;
        });

        // 3. Aplicar velocidad, limitar al lienzo y frenar (fricción)
        roles.forEach(r => {
            const n = nodes[r.id];
            n.x += n.vx;
            n.y += n.vy;
            n.vx *= 0.8; // Fricción
            n.vy *= 0.8;
            
            // Mantener dentro del SVG con un margen
            n.x = Math.max(70, Math.min(width - 70, n.x));
            n.y = Math.max(70, Math.min(height - 70, n.y));
        });
    }
    return nodes;
}

// 🎨 GENERADOR DEL MAPA SVG ORGÁNICO
function generateSVGMap(project, isHealthMode) {
    const roles = project.roles.filter(r => !r.isArchived);
    const transactions = project.transactions || [];
    const state = store.getState();
    
    const svgWidth = 1000;
    const svgHeight = 700;

    // Calcular posiciones orgánicas usando nuestro motor de físicas
    const nodeCoords = calculateNetworkLayout(roles, transactions, svgWidth, svgHeight);
    
    let svgNodes = '';
    let svgEdges = '';
    let edgeCurveCounter = {}; 

    // 1. DIBUJAR FLUJOS (Flechas) VNA STRICT MODE
    transactions.forEach((tx) => {
        const from = nodeCoords[tx.from];
        const to = nodeCoords[tx.to];
        if (!from || !to) return;

        // Reglas VNA de Verna Allee: Tangible = Continua, Intangible = Discontinua
        const isTangible = tx.tipo !== 'intangible';
        let strokeDash = isTangible ? "" : "stroke-dasharray='8,8'";
        let strokeColor = "var(--text-muted)";
        let strokeWidth = "2.5";
        let animation = "";
        let opacity = "0.7";

        // MODO SALUD (Flujo vital)
        if (isHealthMode) {
            if (tx.status === 'consolidated') {
                strokeColor = "var(--accent-green)"; strokeWidth = "3"; opacity = "1";
            } else if (tx.status === 'reported') {
                strokeColor = "var(--accent-blue)"; opacity = "1"; strokeWidth = "3";
                animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" repeatCount="indefinite" />`;
                strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'";
            } else {
                strokeColor = "var(--accent-red)"; opacity = "0.8";
                animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />`;
                strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'";
            }
        }

        // --- MATEMÁTICAS DE CURVAS PARA TRANSACCIONES MÚLTIPLES ---
        const pairKey = [tx.from, tx.to].sort().join('-');
        edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        
        // Calcular vector normal para curvar ligeramente la línea
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const nx = -dy / dist; // Vector normal X
        const ny = dx / dist;  // Vector normal Y
        
        // Curvatura basada en cuántas flechas hay entre estos dos nodos
        const curveStrength = 30 * (edgeCurveCounter[pairKey] % 2 === 0 ? 1 : -1) * Math.ceil(edgeCurveCounter[pairKey]/2);
        
        const cx = (from.x + to.x) / 2 + (nx * curveStrength);
        const cy = (from.y + to.y) / 2 + (ny * curveStrength);

        const pathData = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
        const pathId = `edge-${tx.hash}`;
        const markerId = `arrow-${tx.hash}`;

        // Truncado inteligente del entregable (18 caracteres máx)
        const truncName = tx.entregable.length > 18 ? tx.entregable.substring(0, 16) + '..' : tx.entregable;

        svgEdges += `
            <defs>
                <marker id="${markerId}" markerWidth="8" markerHeight="8" refX="28" refY="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 8 4 L 0 8 z" fill="${strokeColor}" opacity="${opacity}"/>
                </marker>
            </defs>
            <path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="${opacity}" marker-end="url(#${markerId})">
                ${animation}
            </path>
            <text font-size="12" fill="var(--text-heading)" font-family="sans-serif" font-weight="bold" opacity="${opacity}">
                <textPath href="#${pathId}" startOffset="50%" text-anchor="middle" dominant-baseline="text-after-edge" style="transform:translateY(-5px);">
                    ${truncName}
                </textPath>
            </text>
        `;
    });

    // 2. DIBUJAR NODOS (Tarjetas de Contexto Circulares)
    roles.forEach((role) => {
        const coords = nodeCoords[role.id];
        const assignees = (project.asignaciones || []).filter(a => a.roleId === role.id);
        const colors = ROLE_COLORS[role.levelId] || ROLE_COLORS["@pinya"];
        
        let userHTML = '';
        if (assignees.length === 0) {
            userHTML = `<div style="font-size:0.6rem; color:var(--text-muted); margin-top:2px;">[Vacante]</div>`;
        } else if (assignees.length === 1) {
            const u = state.globalUsers.find(gu => gu.id === assignees[0].userId);
            userHTML = `<div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; margin-top:2px; max-width:80%; overflow:hidden; text-overflow:ellipsis;">${u ? u.id : assignees[0].userId}</div>`;
        } else {
            const usersList = assignees.map(a => state.globalUsers.find(gu => gu.id === a.userId)?.name || a.userId).join('<br>');
            userHTML = `
                <div class="multi-user" style="position:relative; margin-top:2px;">
                    <div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; cursor:help;">👥 ${assignees.length} Usr.</div>
                    <div class="hover-tip" style="display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); background:var(--bg-panel); border:1px solid var(--border-color); padding:8px; border-radius:6px; z-index:1000; white-space:nowrap; font-size:0.75rem; color:white; box-shadow:0 5px 15px rgba(0,0,0,0.5); margin-top:5px; text-align:left;">
                        ${usersList}
                    </div>
                </div>
            `;
        }

        // Nodo perfectamente circular con HTML incrustado
        svgNodes += `
            <foreignObject x="${coords.x - 50}" y="${coords.y - 50}" width="100" height="100" style="overflow:visible;">
                <div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--bg-panel); border:3px solid ${colors.border}; border-radius:50%; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:5px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: 0.2s; position:relative;"
                     onmouseover="this.style.boxShadow='0 0 20px ${colors.border}'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='block';"
                     onmouseout="this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='none';">
                    
                    <div style="font-size:0.55rem; color:${colors.text}; text-transform:uppercase; font-weight:bold; letter-spacing:0.05em;">${role.levelId.replace('@','')}</div>
                    <div style="font-weight:bold; color:var(--text-heading); font-size:0.8rem; line-height:1.1; margin: 4px 0;">${role.name.length > 15 ? role.name.substring(0,13)+'..' : role.name}</div>
                    ${userHTML}
                </div>
            </foreignObject>
        `;
    });

    return `
        <div style="width:100%; overflow-x:auto; background: radial-gradient(circle, rgba(13,17,23,1) 0%, #000 100%); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;">
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
                        <input type="text" id="agile-entregable" class="form-control" placeholder="Ej: Auditoría de Contratos">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label class="form-label">Slicing (Horas):</label>
                                <input type="number" step="0.5" id="agile-horas" class="form-control" placeholder="2.5">
                            </div>
                            <div>
                                <label class="form-label">Tipo VNA:</label>
                                <select id="agile-tipo" class="form-control">
                                    <option value="tangible">Tangible (Continua)</option>
                                    <option value="intangible">Intangible (Discontinua)</option>
                                </select>
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
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-theory' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="visual-theory" data-pid="${projectId}">🕸️ Red de Valor (VNA)</button>
                                <button class="btn btn-map-mode ${mapDisplayMode === 'visual-health' ? 'btn-primary' : 'btn-outline'} text-small" style="${mapDisplayMode === 'visual-health' ? '' : 'border-color: var(--accent-red); color: var(--accent-red);'}" data-mode="visual-health" data-pid="${projectId}">❤️ Modo Flujo Vital</button>
                                ${isAdmin ? `<button class="btn btn-map-mode ${mapDisplayMode === 'list' ? 'btn-primary' : 'btn-outline'} text-small" data-mode="list" data-pid="${projectId}">📝 Creador Ágil / Lista</button>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${isAdmin ? `
                                <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Editar Roles</button>
                                <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Accounting (Slicing)</button>
                            ` : `<button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">Mi Bandeja de Tareas</button>`}
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="${(isAdmin && mapDisplayMode === 'list') ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 1000px; margin: 0 auto;'}">
                    
                    <main>
                        <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <b style="color: var(--accent-blue);">Simbología de Roles (Nodos):</b>
                                <div style="display: flex; gap: 10px; margin-top: 5px; flex-wrap: wrap;">
                                    <span style="color: var(--accent-gold);">● Anxaneta</span>
                                    <span style="color: var(--accent-purple);">● Aixecador</span>
                                    <span style="color: var(--accent-blue);">● Dosos</span>
                                    <span style="color: var(--accent-green);">● Baixos</span>
                                    <span style="color: var(--accent-red);">● Pinya</span>
                                </div>
                            </div>
                            <div>
                                <b style="color: var(--accent-purple);">Metodología VNA (Verna Allee):</b>
                                <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-muted);">
                                    <li><b>Línea Continua:</b> Transacción Tangible (Producto/Ingreso).</li>
                                    <li><b>Línea Discontinua:</b> Transacción Intangible (Info/Beneficio).</li>
                                </ul>
                            </div>
                        </div>

                        ${mapDisplayMode !== 'list' ? 
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
                                    <select id="tx-tipo" class="form-control"><option value="tangible">Tangible (Continua)</option><option value="intangible">Intangible (Discontinua)</option></select>
                                </div>
                                <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top:10px;">Añadir Flujo</button>
                            </div>
                        </aside>
                    ` : ''}
                </div>
            </div>
        `;
    }
};
