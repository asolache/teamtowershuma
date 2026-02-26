import { store } from '../core/store.js';

let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;
let mapDisplayMode = 'agile-creator'; // Modo por defecto al entrar

const ROLE_COLORS = {
    "@anxaneta": { bg: "rgba(210, 153, 34, 0.15)", border: "var(--accent-gold)", text: "var(--accent-gold)" },
    "@aixecador": { bg: "rgba(163, 113, 247, 0.15)", border: "var(--accent-purple)", text: "var(--accent-purple)" },
    "@dosos": { bg: "rgba(88, 166, 255, 0.15)", border: "var(--accent-blue)", text: "var(--accent-blue)" },
    "@baixos": { bg: "rgba(35, 134, 54, 0.15)", border: "var(--accent-green)", text: "var(--accent-green)" },
    "@pinya": { bg: "rgba(248, 81, 73, 0.15)", border: "var(--accent-red)", text: "var(--accent-red)" }
};

document.addEventListener('click', (e) => {
    
    // --- NAVEGACIÓN POR PESTAÑAS (TABS) ---
    if (e.target.classList.contains('tab-btn')) {
        mapDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- MODAL DE FLUJO MANUAL ---
    if (e.target.id === 'btn-open-manual-tx') document.getElementById('modal-manual-tx').style.display = 'flex';
    if (e.target.id === 'btn-close-manual-tx') document.getElementById('modal-manual-tx').style.display = 'none';

    // --- MODO CREADOR ÁGIL (Clics en Nodos) ---
    const nodeElement = e.target.closest('.node-bubble');
    if (nodeElement && mapDisplayMode === 'agile-creator') {
        const state = store.getState();
        if ((state.session?.role || 'admin') !== 'admin') return;

        const clickedRoleId = nodeElement.getAttribute('data-id');
        const projectId = nodeElement.getAttribute('data-pid');

        if (!agileOriginId) { agileOriginId = clickedRoleId; } 
        else if (agileOriginId === clickedRoleId) { agileOriginId = null; } 
        else { agileDestinationId = clickedRoleId; showAgileModal = true; }
        
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

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from: agileOriginId, to: agileDestinationId, horas, entregable, tipo } } });
        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- AÑADIR FLUJO MANUAL DESDE MODAL ---
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
        document.getElementById('modal-manual-tx').style.display = 'none';
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- ACCIONES DE TRANSACCIONES (PING / APROBAR) ---
    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay usuario asignado al rol receptor. Ve a Contabilidad -> Vincular Nodo.");
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

// 🧠 FÍSICAS ORIGINALES (Grafo Orgánico Force-Directed - Tu código intacto)
function calculateNetworkLayout(roles, transactions, width, height) {
    const nodes = {}; const radius = Math.min(width, height) / 2.5; const centerX = width / 2; const centerY = height / 2;
    roles.forEach((r, i) => { const angle = (i / roles.length) * 2 * Math.PI; nodes[r.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), vx: 0, vy: 0 }; });
    const iterations = 100; const k = Math.sqrt((width * height) / roles.length); 
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < roles.length; i++) {
            for (let j = 0; j < roles.length; j++) {
                if (i !== j) {
                    const n1 = nodes[roles[i].id]; const n2 = nodes[roles[j].id];
                    const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const force = (k * k) / distance; n1.vx += (dx / distance) * force; n1.vy += (dy / distance) * force;
                }
            }
        }
        transactions.forEach(tx => {
            if (!nodes[tx.from] || !nodes[tx.to]) return;
            const n1 = nodes[tx.from]; const n2 = nodes[tx.to];
            const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (distance * distance) / k; const fx = (dx / distance) * force * 0.05; const fy = (dy / distance) * force * 0.05;
            n1.vx -= fx; n1.vy -= fy; n2.vx += fx; n2.vy += fy;
        });
        roles.forEach(r => {
            const n = nodes[r.id]; n.x += n.vx; n.y += n.vy; n.vx *= 0.8; n.vy *= 0.8;
            n.x = Math.max(70, Math.min(width - 70, n.x)); n.y = Math.max(70, Math.min(height - 70, n.y));
        });
    }
    return nodes;
}

// 🎨 RENDERIZADO DEL GRAFO ORIGINAL (CON COLORES MEJORADOS DE SALUD)
function generateSVGMap(project, isHealthMode) {
    const roles = project.roles.filter(r => !r.isArchived); const transactions = project.transactions || [];
    const state = store.getState(); const svgWidth = 1000; const svgHeight = 600;
    const nodeCoords = calculateNetworkLayout(roles, transactions, svgWidth, svgHeight);
    let svgNodes = ''; let svgEdges = ''; let edgeCurveCounter = {}; 

    transactions.forEach((tx) => {
        const from = nodeCoords[tx.from]; const to = nodeCoords[tx.to]; if (!from || !to) return;
        const isTangible = tx.tipo !== 'intangible';
        let strokeDash = isTangible ? "" : "stroke-dasharray='8,8'"; let strokeColor = "var(--border-color)"; let strokeWidth = "2.5"; let animation = ""; let opacity = "0.7";
        
        if (isHealthMode) {
            if (tx.status === 'consolidated') { strokeColor = "var(--accent-green)"; strokeWidth = "3"; opacity = "1"; } 
            else if (tx.status === 'reported') { strokeColor = "var(--accent-blue)"; opacity = "1"; strokeWidth = "3"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; } 
            else { strokeColor = "var(--accent-red)"; opacity = "0.8"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; }
        }
        
        const pairKey = [tx.from, tx.to].sort().join('-'); edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        const dx = to.x - from.x; const dy = to.y - from.y; const dist = Math.sqrt(dx*dx + dy*dy);
        const nx = -dy / dist; const ny = dx / dist;  
        const curveStrength = 30 * (edgeCurveCounter[pairKey] % 2 === 0 ? 1 : -1) * Math.ceil(edgeCurveCounter[pairKey]/2);
        const cx = (from.x + to.x) / 2 + (nx * curveStrength); const cy = (from.y + to.y) / 2 + (ny * curveStrength);
        const pathData = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
        const pathId = `edge-${tx.hash}`; const markerId = `arrow-${tx.hash}`;
        const truncName = tx.entregable.length > 18 ? tx.entregable.substring(0, 16) + '..' : tx.entregable;

        svgEdges += `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="28" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="${strokeColor}" opacity="${opacity}"/></marker></defs><path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="${opacity}" marker-end="url(#${markerId})">${animation}</path><text font-size="12" fill="var(--text-heading)" font-family="sans-serif" font-weight="bold" opacity="${opacity}"><textPath href="#${pathId}" startOffset="50%" text-anchor="middle" dominant-baseline="text-after-edge" style="transform:translateY(-5px);">${truncName}</textPath></text>`;
    });

    roles.forEach((role) => {
        const coords = nodeCoords[role.id]; const assignees = (project.asignaciones || []).filter(a => a.roleId === role.id);
        const colors = ROLE_COLORS[role.levelId] || ROLE_COLORS["@pinya"];
        let userHTML = '';
        if (assignees.length === 0) userHTML = `<div style="font-size:0.6rem; color:var(--text-muted); margin-top:2px;">[Vacante]</div>`;
        else if (assignees.length === 1) { const u = state.globalUsers.find(gu => gu.id === assignees[0].userId); userHTML = `<div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; margin-top:2px; max-width:80%; overflow:hidden; text-overflow:ellipsis;">${u ? u.id : assignees[0].userId}</div>`; } 
        else { const usersList = assignees.map(a => state.globalUsers.find(gu => gu.id === a.userId)?.name || a.userId).join('<br>'); userHTML = `<div class="multi-user" style="position:relative; margin-top:2px;"><div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; cursor:help;">👥 ${assignees.length} Usr.</div><div class="hover-tip" style="display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); background:var(--bg-panel); border:1px solid var(--border-color); padding:8px; border-radius:6px; z-index:1000; white-space:nowrap; font-size:0.75rem; color:white; box-shadow:0 5px 15px rgba(0,0,0,0.5); margin-top:5px;">${usersList}</div></div>`; }
        
        svgNodes += `<foreignObject x="${coords.x - 50}" y="${coords.y - 50}" width="100" height="100" style="overflow:visible;"><div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--bg-panel); border:3px solid ${colors.border}; border-radius:50%; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:5px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: 0.2s; position:relative;" onmouseover="this.style.boxShadow='0 0 20px ${colors.border}'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='block';" onmouseout="this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='none';"><div style="font-weight:bold; color:var(--text-heading); font-size:0.8rem; line-height:1.1; margin: 4px 0;">${role.name.length > 15 ? role.name.substring(0,13)+'..' : role.name}</div>${userHTML}</div></foreignObject>`;
    });

    return `<div style="width:100%; overflow-x:auto; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;"><svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block; margin: 0 auto; overflow:visible;">${svgEdges}${svgNodes}</svg></div>`;
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

        // Forzar modo visual-theory si el usuario no es admin (por seguridad)
        if (!isAdmin && mapDisplayMode === 'agile-creator') {
            mapDisplayMode = 'visual-theory';
        }

        // LIMPIAR TOOLBAR ANTIGUA
        setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

        // ESTILOS DE PESTAÑAS (TABS)
        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${mapDisplayMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${mapDisplayMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
        `;

        // MODAL ÁGIL (Aparece cuando clickas 2 nodos en agile-creator)
        let modalAgileHTML = '';
        if (showAgileModal && isAdmin) {
            const rOri = roles.find(r => r.id === agileOriginId);
            const rDes = roles.find(r => r.id === agileDestinationId);
            modalAgileHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-blue);">
                        <h3 style="margin-top: 0; color: var(--accent-blue);">⚡ Nuevo Flujo de Valor</h3>
                        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">De: <b>${rOri?.name}</b> ⟶ Para: <b>${rDes?.name}</b></p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Entregable (PoW):</label>
                        <input type="text" id="agile-entregable" class="form-input" placeholder="Ej: Auditoría de Contratos" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom:20px;">
                            <div><label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Slicing (Horas):</label><input type="number" step="0.5" id="agile-horas" class="form-input" placeholder="2.5" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;"></div>
                            <div><label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo VNA:</label><select id="agile-tipo" class="form-input" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select></div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-agile-cancel" data-pid="${projectId}" class="btn btn-outline" style="flex:1;">Cancelar</button>
                            <button id="btn-agile-save" data-pid="${projectId}" class="btn btn-primary" style="flex:1; background:var(--accent-blue); border:none;">Sellar</button>
                        </div>
                    </div>
                </div>`;
        }

        return `
            ${modalAgileHTML}
            
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                        <span>/</span> 
                        <a href="#/project/${projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">Mapa de Valor VNA</span>
                    </div>
                    <div>
                        ${isAdmin ? `<button id="btn-open-manual-tx" class="btn text-small" style="background: var(--accent-purple); border:none; color:#fff; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">➕ Inyectar Flujo Manual</button>` : ''}
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 20px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Ontología y Flujos (VNA)</h1>
                        <p style="margin: 0; color: var(--text-muted);">Visualiza el grafo orgánico, audita cuellos de botella y diseña flujos teóricos.</p>
                    </div>
                    <span class="badge" style="background: rgba(88,166,255,0.1); color: var(--accent-blue); border: 1px solid var(--accent-blue); padding: 6px 12px; font-size: 0.9rem;">💡 Transacciones Totales: ${transactions.length}</span>
                </div>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                    ${isAdmin ? `<button class="tab-btn" data-mode="agile-creator" data-pid="${projectId}" style="${tabStyle('agile-creator')}">🖱️ Modo Creador Ágil</button>` : ''}
                    <button class="tab-btn" data-mode="visual-theory" data-pid="${projectId}" style="${tabStyle('visual-theory')}">🕸️ Mapa de Valor</button>
                    <button class="tab-btn" data-mode="visual-health" data-pid="${projectId}" style="${tabStyle('visual-health')}">❤️ Salud Termográfica</button>
                    <button class="tab-btn" data-mode="deliverables" data-pid="${projectId}" style="${tabStyle('deliverables')}">📋 Lista de Entregables (Pings)</button>
                </div>

                <main>
                    ${mapDisplayMode === 'agile-creator' ? `
                        <section class="panel-surface" style="margin-bottom: 25px; border: 2px dashed var(--accent-blue); padding: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <div>
                                    <h3 style="margin: 0; color: var(--accent-blue);">🖱️ Diseñador de Flujos</h3>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 5px 0 0 0;">Haz clic en el nodo <b>Emisor</b> y luego en el <b>Receptor</b> para crear un enlace en el mapa.</p>
                                </div>
                                <span class="badge" style="background: rgba(88,166,255,0.1); color: var(--accent-blue); font-size: 1rem; padding: 10px;">
                                    ${!agileOriginId ? '1️⃣ Selecciona Origen' : '2️⃣ Selecciona Destino'}
                                </span>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                ${roles.map(r => `
                                    <div class="node-bubble" data-id="${r.id}" data-pid="${projectId}" 
                                         style="background: ${r.id === agileOriginId ? 'rgba(88,166,255,0.2)' : 'var(--bg-panel)'}; 
                                                border: ${r.id === agileOriginId ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)'}; 
                                                padding: 12px 25px; border-radius: 30px; cursor: pointer; transition: 0.2s;">
                                        <b style="color:var(--text-heading);">${r.name}</b> <span style="font-size:0.7rem; color:var(--text-muted); font-family:monospace; margin-left:5px;">${r.levelId}</span>
                                    </div>`).join('')}
                            </div>
                        </section>
                        <h4 style="margin-bottom: 15px; color: var(--text-muted);">🕸️ Vista Previa del Grafo:</h4>
                        ${generateSVGMap(project, false)}
                    ` : ''}

                    ${mapDisplayMode === 'visual-theory' || mapDisplayMode === 'visual-health' ? `
                        <div style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.8rem; flex-wrap: wrap;">
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Niveles:</b>
                                <span style="color: var(--accent-gold);">● Estratégico (@anx)</span>
                                <span style="color: var(--accent-purple);">● Coord. (@aix)</span>
                                <span style="color: var(--accent-blue);">● Auditoría (@dos)</span>
                                <span style="color: var(--accent-green);">● Operativo (@bx)</span>
                                <span style="color: var(--accent-red);">● Soporte (@pny)</span>
                            </div>
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Líneas:</b>
                                <span style="color: var(--text-muted);">— Tangible</span>
                                <span style="color: var(--text-muted);">- - Intangible</span>
                            </div>
                            ${mapDisplayMode === 'visual-health' ? `
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Termografía:</b>
                                <span style="color: var(--accent-blue);">Flujo Normal</span>
                                <span style="color: var(--accent-red);">Alerta / Atasco</span>
                                <span style="color: var(--accent-green);">Consolidado</span>
                            </div>` : ''}
                        </div>
                        ${generateSVGMap(project, mapDisplayMode === 'visual-health')}
                    ` : ''}

                    ${mapDisplayMode === 'deliverables' ? `
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                            <h3 style="margin-top: 0;">📋 Lista Maestra de Entregables (Transacciones)</h3>
                            ${transactions.length === 0 ? '<div class="text-center text-muted" style="padding:40px; border:1px dashed var(--border-color);">Aún no hay transacciones.</div>' : `
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                                    <th style="padding: 12px 10px;">Estado</th>
                                    <th style="padding: 12px 10px;">Entregable (PoW)</th>
                                    <th style="padding: 12px 10px;">Dirección (De ⟶ Para)</th>
                                    <th style="padding: 12px 10px; text-align: center;">Horas</th>
                                    <th style="padding: 12px 10px; text-align: right;">Acciones</th>
                                </tr>
                                ${transactions.slice().reverse().map(tx => {
                                    const rFrom = roles.find(r => r.id === tx.from); 
                                    const rTo = roles.find(r => r.id === tx.to);
                                    let statusBadge = ''; let actionBtn = '';
                                    
                                    if (tx.status === 'theoretical') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--text-muted); color:var(--text-muted);">📦 Teórico</span>`; 
                                        if (isAdmin) actionBtn = `<button class="btn btn-outline btn-ping text-small" style="color:var(--accent-gold); border-color:var(--accent-gold); padding: 5px 10px;" data-hash="${tx.hash}" data-pid="${project.id}" data-torole="${tx.to}">Ping ⚡</button>`; 
                                    } 
                                    else if (tx.status === 'pinged') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-gold); color:var(--accent-gold); background:rgba(210,153,34,0.1);">⚡ Asignado</span>`; 
                                    }
                                    else if (tx.status === 'reported') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-blue); color:var(--accent-blue); background:rgba(88,166,255,0.1);">📝 Auditar</span>`; 
                                        if (isAdmin) actionBtn = `<button class="btn btn-primary btn-approve text-small" style="background:var(--accent-blue); border:none; padding: 5px 10px;" data-hash="${tx.hash}" data-pid="${project.id}">Aprobar</button>`; 
                                    } 
                                    else if (tx.status === 'consolidated') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-green); color:var(--accent-green); background:rgba(35,134,54,0.1);">✅ Ledger</span>`; 
                                    } 
                                    else { statusBadge = `<span class="badge">⏳ ${tx.status}</span>`; }

                                    return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 12px 10px;">${statusBadge}</td>
                                        <td style="padding: 12px 10px; font-weight: bold; color: var(--text-heading);">${tx.entregable}</td>
                                        <td style="padding: 12px 10px; color: var(--text-muted);">
                                            ${rFrom?.name || 'Borrado'} <span style="color:var(--accent-blue); margin:0 5px;">⟶</span> ${rTo?.name || 'Borrado'}
                                        </td>
                                        <td style="padding: 12px 10px; text-align: center; font-family: monospace;">${tx.realHours || tx.estimatedHours}h</td>
                                        <td style="padding: 12px 10px; text-align: right;">${actionBtn}</td>
                                    </tr>`;
                                }).join('')}
                            </table>
                            `}
                        </div>
                    ` : ''}
                </main>
            </div>

            <div id="modal-manual-tx" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-purple);">
                    <h3 style="margin-top:0; color: var(--text-heading);">➕ Inyectar Flujo Manual</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Crea una transacción teórica entre dos roles.</p>
                    
                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Rol Emisor (De):</label>
                    <select id="tx-from" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        <option value="">Selecciona Origen...</option>
                        ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                    </select>

                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Rol Receptor (Para):</label>
                    <select id="tx-to" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        <option value="">Selecciona Destino...</option>
                        ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                    </select>

                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Nombre del Entregable:</label>
                    <input type="text" id="tx-entregable" class="form-input" placeholder="Ej: Reporte Financiero" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Horas Est.:</label>
                            <input type="number" step="0.5" id="tx-horas" class="form-input" placeholder="Horas" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo VNA:</label>
                            <select id="tx-tipo" class="form-input" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                                <option value="tangible">Tangible</option>
                                <option value="intangible">Intangible</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="btn-close-manual-tx" class="btn btn-outline" style="padding: 10px 15px;">Cancelar</button>
                        <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary" style="padding: 10px 15px; background:var(--accent-purple); border:none;">Guardar Flujo</button>
                    </div>
                </div>
            </div>
        `;
    }
};import { store } from '../core/store.js';

let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;
let mapDisplayMode = 'visual-theory'; 

const ROLE_COLORS = {
    "@anxaneta": { bg: "rgba(210, 153, 34, 0.15)", border: "var(--accent-gold)", text: "var(--accent-gold)" },
    "@aixecador": { bg: "rgba(163, 113, 247, 0.15)", border: "var(--accent-purple)", text: "var(--accent-purple)" },
    "@dosos": { bg: "rgba(88, 166, 255, 0.15)", border: "var(--accent-blue)", text: "var(--accent-blue)" },
    "@baixos": { bg: "rgba(35, 134, 54, 0.15)", border: "var(--accent-green)", text: "var(--accent-green)" },
    "@pinya": { bg: "rgba(248, 81, 73, 0.15)", border: "var(--accent-red)", text: "var(--accent-red)" }
};

document.addEventListener('click', (e) => {
    
    // --- NAVEGACIÓN POR PESTAÑAS (TABS) ---
    if (e.target.classList.contains('tab-btn')) {
        mapDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- MODAL DE FLUJO MANUAL ---
    if (e.target.id === 'btn-open-manual-tx') document.getElementById('modal-manual-tx').style.display = 'flex';
    if (e.target.id === 'btn-close-manual-tx') document.getElementById('modal-manual-tx').style.display = 'none';

    // --- MODO CREADOR ÁGIL (Clics en Nodos) ---
    const nodeElement = e.target.closest('.node-bubble');
    if (nodeElement && mapDisplayMode === 'agile-creator') {
        const state = store.getState();
        if ((state.session?.role || 'admin') !== 'admin') return;

        const clickedRoleId = nodeElement.getAttribute('data-id');
        const projectId = nodeElement.getAttribute('data-pid');

        if (!agileOriginId) { agileOriginId = clickedRoleId; } 
        else if (agileOriginId === clickedRoleId) { agileOriginId = null; } 
        else { agileDestinationId = clickedRoleId; showAgileModal = true; }
        
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

        store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, tx: { from: agileOriginId, to: agileDestinationId, horas, entregable, tipo } } });
        agileOriginId = null; agileDestinationId = null; showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- AÑADIR FLUJO MANUAL DESDE MODAL ---
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
        document.getElementById('modal-manual-tx').style.display = 'none';
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- ACCIONES DE TRANSACCIONES (PING / APROBAR) ---
    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay usuario asignado al rol receptor. Ve a Contabilidad -> Vincular Nodo.");
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

// 🧠 FÍSICAS ORIGINALES (Grafo Orgánico Force-Directed)
function calculateNetworkLayout(roles, transactions, width, height) {
    const nodes = {}; const radius = Math.min(width, height) / 2.5; const centerX = width / 2; const centerY = height / 2;
    roles.forEach((r, i) => { const angle = (i / roles.length) * 2 * Math.PI; nodes[r.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), vx: 0, vy: 0 }; });
    const iterations = 100; const k = Math.sqrt((width * height) / roles.length); 
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < roles.length; i++) {
            for (let j = 0; j < roles.length; j++) {
                if (i !== j) {
                    const n1 = nodes[roles[i].id]; const n2 = nodes[roles[j].id];
                    const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const force = (k * k) / distance; n1.vx += (dx / distance) * force; n1.vy += (dy / distance) * force;
                }
            }
        }
        transactions.forEach(tx => {
            if (!nodes[tx.from] || !nodes[tx.to]) return;
            const n1 = nodes[tx.from]; const n2 = nodes[tx.to];
            const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (distance * distance) / k; const fx = (dx / distance) * force * 0.05; const fy = (dy / distance) * force * 0.05;
            n1.vx -= fx; n1.vy -= fy; n2.vx += fx; n2.vy += fy;
        });
        roles.forEach(r => {
            const n = nodes[r.id]; n.x += n.vx; n.y += n.vy; n.vx *= 0.8; n.vy *= 0.8;
            n.x = Math.max(70, Math.min(width - 70, n.x)); n.y = Math.max(70, Math.min(height - 70, n.y));
        });
    }
    return nodes;
}

// 🎨 RENDERIZADO DEL GRAFO ORIGINAL (CON COLORES MEJORADOS DE SALUD)
function generateSVGMap(project, isHealthMode) {
    const roles = project.roles.filter(r => !r.isArchived); const transactions = project.transactions || [];
    const state = store.getState(); const svgWidth = 1000; const svgHeight = 600;
    const nodeCoords = calculateNetworkLayout(roles, transactions, svgWidth, svgHeight);
    let svgNodes = ''; let svgEdges = ''; let edgeCurveCounter = {}; 

    transactions.forEach((tx) => {
        const from = nodeCoords[tx.from]; const to = nodeCoords[tx.to]; if (!from || !to) return;
        const isTangible = tx.tipo !== 'intangible';
        let strokeDash = isTangible ? "" : "stroke-dasharray='8,8'"; let strokeColor = "var(--border-color)"; let strokeWidth = "2.5"; let animation = ""; let opacity = "0.7";
        
        if (isHealthMode) {
            if (tx.status === 'consolidated') { strokeColor = "var(--accent-green)"; strokeWidth = "3"; opacity = "1"; } 
            else if (tx.status === 'reported') { strokeColor = "var(--accent-blue)"; opacity = "1"; strokeWidth = "3"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.4s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; } 
            else { strokeColor = "var(--accent-red)"; opacity = "0.8"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; }
        }
        
        const pairKey = [tx.from, tx.to].sort().join('-'); edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        const dx = to.x - from.x; const dy = to.y - from.y; const dist = Math.sqrt(dx*dx + dy*dy);
        const nx = -dy / dist; const ny = dx / dist;  
        const curveStrength = 30 * (edgeCurveCounter[pairKey] % 2 === 0 ? 1 : -1) * Math.ceil(edgeCurveCounter[pairKey]/2);
        const cx = (from.x + to.x) / 2 + (nx * curveStrength); const cy = (from.y + to.y) / 2 + (ny * curveStrength);
        const pathData = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
        const pathId = `edge-${tx.hash}`; const markerId = `arrow-${tx.hash}`;
        const truncName = tx.entregable.length > 18 ? tx.entregable.substring(0, 16) + '..' : tx.entregable;

        svgEdges += `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="28" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="${strokeColor}" opacity="${opacity}"/></marker></defs><path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="${opacity}" marker-end="url(#${markerId})">${animation}</path><text font-size="12" fill="var(--text-heading)" font-family="sans-serif" font-weight="bold" opacity="${opacity}"><textPath href="#${pathId}" startOffset="50%" text-anchor="middle" dominant-baseline="text-after-edge" style="transform:translateY(-5px);">${truncName}</textPath></text>`;
    });

    roles.forEach((role) => {
        const coords = nodeCoords[role.id]; const assignees = (project.asignaciones || []).filter(a => a.roleId === role.id);
        const colors = ROLE_COLORS[role.levelId] || ROLE_COLORS["@pinya"];
        let userHTML = '';
        if (assignees.length === 0) userHTML = `<div style="font-size:0.6rem; color:var(--text-muted); margin-top:2px;">[Vacante]</div>`;
        else if (assignees.length === 1) { const u = state.globalUsers.find(gu => gu.id === assignees[0].userId); userHTML = `<div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; margin-top:2px; max-width:80%; overflow:hidden; text-overflow:ellipsis;">${u ? u.id : assignees[0].userId}</div>`; } 
        else { const usersList = assignees.map(a => state.globalUsers.find(gu => gu.id === a.userId)?.name || a.userId).join('<br>'); userHTML = `<div class="multi-user" style="position:relative; margin-top:2px;"><div style="font-size:0.65rem; color:var(--text-main); font-family:monospace; cursor:help;">👥 ${assignees.length} Usr.</div><div class="hover-tip" style="display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); background:var(--bg-panel); border:1px solid var(--border-color); padding:8px; border-radius:6px; z-index:1000; white-space:nowrap; font-size:0.75rem; color:white; box-shadow:0 5px 15px rgba(0,0,0,0.5); margin-top:5px;">${usersList}</div></div>`; }
        
        svgNodes += `<foreignObject x="${coords.x - 50}" y="${coords.y - 50}" width="100" height="100" style="overflow:visible;"><div xmlns="http://www.w3.org/1999/xhtml" style="background:var(--bg-panel); border:3px solid ${colors.border}; border-radius:50%; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:5px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: 0.2s; position:relative;" onmouseover="this.style.boxShadow='0 0 20px ${colors.border}'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='block';" onmouseout="this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)'; const tip = this.querySelector('.hover-tip'); if(tip) tip.style.display='none';"><div style="font-weight:bold; color:var(--text-heading); font-size:0.8rem; line-height:1.1; margin: 4px 0;">${role.name.length > 15 ? role.name.substring(0,13)+'..' : role.name}</div>${userHTML}</div></foreignObject>`;
    });

    return `<div style="width:100%; overflow-x:auto; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;"><svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block; margin: 0 auto; overflow:visible;">${svgEdges}${svgNodes}</svg></div>`;
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

        // LIMPIAR TOOLBAR ANTIGUA
        setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

        // ESTILOS DE PESTAÑAS (TABS)
        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${mapDisplayMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${mapDisplayMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
        `;

        // MODAL ÁGIL (Aparece cuando clickas 2 nodos en agile-creator)
        let modalAgileHTML = '';
        if (showAgileModal && isAdmin) {
            const rOri = roles.find(r => r.id === agileOriginId);
            const rDes = roles.find(r => r.id === agileDestinationId);
            modalAgileHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-blue);">
                        <h3 style="margin-top: 0; color: var(--accent-blue);">⚡ Nuevo Flujo de Valor</h3>
                        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">De: <b>${rOri?.name}</b> ⟶ Para: <b>${rDes?.name}</b></p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Entregable (PoW):</label>
                        <input type="text" id="agile-entregable" class="form-input" placeholder="Ej: Auditoría de Contratos" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;">
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom:20px;">
                            <div><label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Slicing (Horas):</label><input type="number" step="0.5" id="agile-horas" class="form-input" placeholder="2.5" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;"></div>
                            <div><label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo VNA:</label><select id="agile-tipo" class="form-input" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select></div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-agile-cancel" data-pid="${projectId}" class="btn btn-outline" style="flex:1;">Cancelar</button>
                            <button id="btn-agile-save" data-pid="${projectId}" class="btn btn-primary" style="flex:1; background:var(--accent-blue); border:none;">Sellar</button>
                        </div>
                    </div>
                </div>`;
        }

        return `
            ${modalAgileHTML}
            
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                        <span>/</span> 
                        <a href="#/project/${projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">Mapa de Valor VNA</span>
                    </div>
                    <div>
                        ${isAdmin ? `<button id="btn-open-manual-tx" class="btn text-small" style="background: var(--accent-purple); border:none; color:#fff;">➕ Inyectar Flujo Manual</button>` : ''}
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 20px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Ontología y Flujos (VNA)</h1>
                        <p style="margin: 0; color: var(--text-muted);">Visualiza el grafo orgánico, audita cuellos de botella y gestiona entregables.</p>
                    </div>
                    <span class="badge" style="background: rgba(88,166,255,0.1); color: var(--accent-blue); border: 1px solid var(--accent-blue);">💡 Transacciones: ${transactions.length}</span>
                </div>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; gap: 10px; overflow-x: auto;">
                    <button class="tab-btn" data-mode="visual-theory" data-pid="${projectId}" style="${tabStyle('visual-theory')}">🕸️ Grafo Teórico</button>
                    <button class="tab-btn" data-mode="visual-health" data-pid="${projectId}" style="${tabStyle('visual-health')}">❤️ Salud Termográfica</button>
                    ${isAdmin ? `<button class="tab-btn" data-mode="agile-creator" data-pid="${projectId}" style="${tabStyle('agile-creator')}">🖱️ Modo Creador Ágil</button>` : ''}
                    <button class="tab-btn" data-mode="deliverables" data-pid="${projectId}" style="${tabStyle('deliverables')}">📋 Lista de Entregables (Pings)</button>
                </div>

                <main>
                    ${mapDisplayMode === 'visual-theory' || mapDisplayMode === 'visual-health' ? `
                        <div style="display: flex; gap: 15px; margin-bottom: 15px; font-size: 0.8rem; flex-wrap: wrap;">
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Niveles:</b>
                                <span style="color: var(--accent-gold);">● Estratégico (@anx)</span>
                                <span style="color: var(--accent-purple);">● Coord. (@aix)</span>
                                <span style="color: var(--accent-blue);">● Auditoría (@dos)</span>
                                <span style="color: var(--accent-green);">● Operativo (@bx)</span>
                                <span style="color: var(--accent-red);">● Soporte (@pny)</span>
                            </div>
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Líneas:</b>
                                <span style="color: var(--text-muted);">— Tangible</span>
                                <span style="color: var(--text-muted);">- - Intangible</span>
                            </div>
                            ${mapDisplayMode === 'visual-health' ? `
                            <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                                <b style="color: var(--text-heading);">Termografía:</b>
                                <span style="color: var(--accent-blue);">Flujo Normal</span>
                                <span style="color: var(--accent-red);">Alerta / Atasco</span>
                                <span style="color: var(--accent-green);">Consolidado</span>
                            </div>` : ''}
                        </div>
                        ${generateSVGMap(project, mapDisplayMode === 'visual-health')}
                    ` : ''}

                    ${mapDisplayMode === 'agile-creator' ? `
                        <section class="panel-surface" style="margin-bottom: 25px; border: 2px dashed var(--accent-blue); padding: 30px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <div>
                                    <h3 style="margin: 0; color: var(--accent-blue);">🖱️ Creador Ágil Visual</h3>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 5px 0 0 0;">Haz clic en el nodo <b>Emisor</b> y luego en el <b>Receptor</b> para crear un enlace.</p>
                                </div>
                                <span class="badge" style="background: rgba(88,166,255,0.1); color: var(--accent-blue); font-size: 1rem; padding: 10px;">
                                    ${!agileOriginId ? '1️⃣ Selecciona Origen' : '2️⃣ Selecciona Destino'}
                                </span>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                                ${roles.map(r => `
                                    <div class="node-bubble" data-id="${r.id}" data-pid="${projectId}" 
                                         style="background: ${r.id === agileOriginId ? 'rgba(88,166,255,0.2)' : 'var(--bg-panel)'}; 
                                                border: ${r.id === agileOriginId ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)'}; 
                                                padding: 12px 25px; border-radius: 30px; cursor: pointer; transition: 0.2s;">
                                        <b style="color:var(--text-heading);">${r.name}</b> <span style="font-size:0.7rem; color:var(--text-muted); font-family:monospace; margin-left:5px;">${r.levelId}</span>
                                    </div>`).join('')}
                            </div>
                        </section>
                    ` : ''}

                    ${mapDisplayMode === 'deliverables' ? `
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px;">
                            <h3 style="margin-top: 0;">📋 Lista Maestra de Entregables (Transacciones)</h3>
                            ${transactions.length === 0 ? '<div class="text-center text-muted" style="padding:40px; border:1px dashed var(--border-color);">Aún no hay transacciones.</div>' : `
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                                    <th style="padding: 12px 10px;">Estado</th>
                                    <th style="padding: 12px 10px;">Entregable (PoW)</th>
                                    <th style="padding: 12px 10px;">Dirección (De ⟶ Para)</th>
                                    <th style="padding: 12px 10px; text-align: center;">Horas</th>
                                    <th style="padding: 12px 10px; text-align: right;">Acciones</th>
                                </tr>
                                ${transactions.slice().reverse().map(tx => {
                                    const rFrom = roles.find(r => r.id === tx.from); 
                                    const rTo = roles.find(r => r.id === tx.to);
                                    let statusBadge = ''; let actionBtn = '';
                                    
                                    if (tx.status === 'theoretical') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--text-muted); color:var(--text-muted);">📦 Teórico</span>`; 
                                        if (isAdmin) actionBtn = `<button class="btn btn-outline btn-ping text-small" style="color:var(--accent-gold); border-color:var(--accent-gold);" data-hash="${tx.hash}" data-pid="${project.id}" data-torole="${tx.to}">Ping ⚡</button>`; 
                                    } 
                                    else if (tx.status === 'pinged') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-gold); color:var(--accent-gold); background:rgba(210,153,34,0.1);">⚡ Asignado</span>`; 
                                    }
                                    else if (tx.status === 'reported') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-blue); color:var(--accent-blue); background:rgba(88,166,255,0.1);">📝 Auditar</span>`; 
                                        if (isAdmin) actionBtn = `<button class="btn btn-primary btn-approve text-small" style="background:var(--accent-blue); border:none;" data-hash="${tx.hash}" data-pid="${project.id}">Aprobar</button>`; 
                                    } 
                                    else if (tx.status === 'consolidated') { 
                                        statusBadge = `<span class="badge" style="border:1px solid var(--accent-green); color:var(--accent-green); background:rgba(35,134,54,0.1);">✅ Ledger</span>`; 
                                    } 
                                    else { statusBadge = `<span class="badge">⏳ ${tx.status}</span>`; }

                                    return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 12px 10px;">${statusBadge}</td>
                                        <td style="padding: 12px 10px; font-weight: bold; color: var(--text-heading);">${tx.entregable}</td>
                                        <td style="padding: 12px 10px; color: var(--text-muted);">
                                            ${rFrom?.name || 'Borrado'} <span style="color:var(--accent-blue); margin:0 5px;">⟶</span> ${rTo?.name || 'Borrado'}
                                        </td>
                                        <td style="padding: 12px 10px; text-align: center; font-family: monospace;">${tx.realHours || tx.estimatedHours}h</td>
                                        <td style="padding: 12px 10px; text-align: right;">${actionBtn}</td>
                                    </tr>`;
                                }).join('')}
                            </table>
                            `}
                        </div>
                    ` : ''}
                </main>
            </div>

            <div id="modal-manual-tx" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-purple);">
                    <h3 style="margin-top:0; color: var(--text-heading);">➕ Inyectar Flujo Manual</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Crea una transacción teórica entre dos roles.</p>
                    
                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Rol Emisor (De):</label>
                    <select id="tx-from" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        <option value="">Selecciona Origen...</option>
                        ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                    </select>

                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Rol Receptor (Para):</label>
                    <select id="tx-to" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        <option value="">Selecciona Destino...</option>
                        ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                    </select>

                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Nombre del Entregable:</label>
                    <input type="text" id="tx-entregable" class="form-input" placeholder="Ej: Reporte Financiero" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Horas Est.:</label>
                            <input type="number" step="0.5" id="tx-horas" class="form-input" placeholder="Horas" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo VNA:</label>
                            <select id="tx-tipo" class="form-input" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                                <option value="tangible">Tangible</option>
                                <option value="intangible">Intangible</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="btn-close-manual-tx" class="btn btn-outline" style="padding: 10px 15px;">Cancelar</button>
                        <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary" style="padding: 10px 15px; background:var(--accent-purple); border:none;">Guardar Flujo</button>
                    </div>
                </div>
            </div>
        `;
    }
};
