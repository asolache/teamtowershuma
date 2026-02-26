import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

let ecoTabMode = 'macro-map'; // macro-map, directory, health
let macroOriginId = null;
let macroDestId = null;
let showMacroModal = false;
let currentMacroZoom = 1; 

// Nuevas variables para el Modal de Salud
let selectedHealthProjectId = null;
let showHealthModal = false;

document.addEventListener('click', (e) => {
    
    // --- CONTROLES DE ZOOM DEL MAPA SVG ---
    if (e.target.id === 'btn-macro-zoom-in') {
        currentMacroZoom += 0.2;
        const wrapper = document.getElementById('svg-macro-zoom-wrapper');
        if (wrapper) wrapper.style.transform = `scale(${currentMacroZoom})`;
    }
    if (e.target.id === 'btn-macro-zoom-out') {
        currentMacroZoom = Math.max(0.4, currentMacroZoom - 0.2);
        const wrapper = document.getElementById('svg-macro-zoom-wrapper');
        if (wrapper) wrapper.style.transform = `scale(${currentMacroZoom})`;
    }
    if (e.target.id === 'btn-macro-zoom-fit') {
        currentMacroZoom = 1;
        const wrapper = document.getElementById('svg-macro-zoom-wrapper');
        if (wrapper) wrapper.style.transform = `scale(${currentMacroZoom})`;
    }

    // --- TABS ---
    if (e.target.classList.contains('eco-tab-btn')) {
        ecoTabMode = e.target.getAttribute('data-mode');
        macroOriginId = null; macroDestId = null; showMacroModal = false;
        selectedHealthProjectId = null; showHealthModal = false;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    // --- CLICS EN NODOS (ÁREAS/PROYECTOS) ---
    const nodeElement = e.target.closest('.macro-node');
    if (nodeElement) {
        const clickedProjId = nodeElement.getAttribute('data-id');

        if (ecoTabMode === 'macro-map') {
            // Modo Creador de Enlaces
            if (!macroOriginId) { macroOriginId = clickedProjId; } 
            else if (macroOriginId === clickedProjId) { macroOriginId = null; } 
            else { macroDestId = clickedProjId; showMacroModal = true; }
            document.getElementById('app').innerHTML = DashboardView.render();
        } 
        else if (ecoTabMode === 'health') {
            // Modo Salud: Abrir Detalles de Incidencia
            selectedHealthProjectId = clickedProjId;
            showHealthModal = true;
            document.getElementById('app').innerHTML = DashboardView.render();
        }
    }

    // --- MODAL: MACRO-FLUJOS ---
    if (e.target.id === 'btn-macro-cancel') {
        macroOriginId = null; macroDestId = null; showMacroModal = false;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    if (e.target.id === 'btn-macro-save') {
        const entregable = document.getElementById('macro-entregable').value.trim();
        const tipo = document.getElementById('macro-tipo').value;
        if (!entregable) return alert("⚠️ Define el entregable macro.");

        store.dispatch({ 
            type: 'ADD_MACRO_FLOW', 
            payload: { fromProjectId: macroOriginId, toProjectId: macroDestId, entregable, tipo } 
        });
        
        macroOriginId = null; macroDestId = null; showMacroModal = false;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    // --- MODAL: SALUD Y PING AL PO ---
    if (e.target.id === 'btn-close-health-modal') {
        showHealthModal = false; selectedHealthProjectId = null;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    if (e.target.id === 'btn-send-health-ping') {
        const msg = document.getElementById('health-ping-msg').value.trim();
        if (!msg) return alert("⚠️ Escribe un mensaje antes de enviar el Ping.");
        
        // Aquí en el futuro enviaríamos el mensaje real al Store de Notificaciones.
        alert("✅ Ping de Alerta enviado al Project Owner de esta red con éxito.");
        
        showHealthModal = false; selectedHealthProjectId = null;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    // --- MODAL: CREAR NUEVA ÁREA ---
    if (e.target.id === 'btn-open-new-project') document.getElementById('modal-new-project').style.display = 'flex';
    if (e.target.id === 'btn-close-new-project') document.getElementById('modal-new-project').style.display = 'none';

    if (e.target.id === 'btn-save-new-project') {
        const nombre = document.getElementById('new-proj-name').value.trim();
        const sector = document.getElementById('new-proj-sector').value;
        const tipo = document.getElementById('new-proj-tipo').value;

        if (!nombre || !sector) return alert("⚠️ Rellena nombre y plantilla ontológica.");

        store.dispatch({ type: 'ADD_PROJECT', payload: { nombre, sector, tipo } });
        document.getElementById('modal-new-project').style.display = 'none';
        document.getElementById('app').innerHTML = DashboardView.render();
    }
});

// 🧠 FÍSICAS DEL MACRO-MAPA
function calculateMacroLayout(projects, macroFlows, width, height) {
    const nodes = {}; const radius = Math.min(width, height) / 3; const centerX = width / 2; const centerY = height / 2;
    projects.forEach((p, i) => { 
        const angle = (i / projects.length) * 2 * Math.PI; 
        nodes[p.id] = { 
            x: centerX + radius * Math.cos(angle) + (Math.random() * 20 - 10), 
            y: centerY + radius * Math.sin(angle) + (Math.random() * 20 - 10), 
            vx: 0, vy: 0 
        }; 
    });
    
    const iterations = 150; const k = Math.sqrt((width * height) / (projects.length || 1)); 
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < projects.length; i++) {
            for (let j = 0; j < projects.length; j++) {
                if (i !== j) {
                    const n1 = nodes[projects[i].id]; const n2 = nodes[projects[j].id];
                    const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const force = (k * k) / distance; n1.vx += (dx / distance) * force; n1.vy += (dy / distance) * force;
                }
            }
        }
        macroFlows.forEach(tx => {
            if (!nodes[tx.from] || !nodes[tx.to]) return;
            const n1 = nodes[tx.from]; const n2 = nodes[tx.to];
            const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (distance * distance) / k; const fx = (dx / distance) * force * 0.05; const fy = (dy / distance) * force * 0.05;
            n1.vx -= fx; n1.vy -= fy; n2.vx += fx; n2.vy += fy;
        });
        projects.forEach(p => {
            const n = nodes[p.id]; 
            n.vx += (centerX - n.x) * 0.02; n.vy += (centerY - n.y) * 0.02;
            n.x += n.vx; n.y += n.vy; n.vx *= 0.7; n.vy *= 0.7;
            n.x = Math.max(80, Math.min(width - 80, n.x)); n.y = Math.max(80, Math.min(height - 80, n.y));
        });
    }
    return nodes;
}

// 🎨 RENDERIZADO SVG
function generateMacroSVG(projects, macroFlows, originId, isHealthMode) {
    if(projects.length === 0) return `<div class="text-center text-muted" style="padding:40px;">El ecosistema está vacío. Crea tu primera Área.</div>`;
    
    const svgWidth = 1000; const svgHeight = 600;
    const nodeCoords = calculateMacroLayout(projects, macroFlows, svgWidth, svgHeight);
    let svgNodes = ''; let svgEdges = ''; let svgAlerts = ''; let edgeCurveCounter = {}; 

    macroFlows.forEach((tx) => {
        const from = nodeCoords[tx.from]; const to = nodeCoords[tx.to]; if (!from || !to) return;
        const isTangible = tx.tipo !== 'intangible';
        let strokeDash = isTangible ? "" : "stroke-dasharray='8,8'"; 
        let strokeColor = "var(--accent-purple)"; 
        let opacity = "0.7"; let strokeWidth = "3"; let animation = "";

        if (isHealthMode) {
            const pFrom = projects.find(p => p.id === tx.from);
            const atascos = pFrom?.transactions?.filter(t => t.status === 'reported' || t.status === 'pinged').length || 0;
            if (atascos > 3) { strokeColor = "var(--accent-red)"; opacity = "1"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.3s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; } 
            else if (atascos > 0) { strokeColor = "var(--accent-gold)"; opacity = "0.9"; animation = `<animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />`; strokeDash = isTangible ? "stroke-dasharray='12,6'" : "stroke-dasharray='8,8'"; } 
            else { strokeColor = "var(--accent-green)"; opacity = "0.6"; }
        }

        const pairKey = [tx.from, tx.to].sort().join('-'); edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        const dx = to.x - from.x; const dy = to.y - from.y; const dist = Math.sqrt(dx*dx + dy*dy);
        const nx = -dy / dist; const ny = dx / dist;  
        const curveStrength = 40 * (edgeCurveCounter[pairKey] % 2 === 0 ? 1 : -1) * Math.ceil(edgeCurveCounter[pairKey]/2);
        const cx = (from.x + to.x) / 2 + (nx * curveStrength); const cy = (from.y + to.y) / 2 + (ny * curveStrength);
        
        const pathData = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
        let textPathData = pathData;
        if (from.x > to.x) textPathData = `M ${to.x} ${to.y} Q ${cx} ${cy}, ${from.x} ${from.y}`;

        const pathId = `medge-${tx.id}`; const textPathId = `mtextedge-${tx.id}`; const markerId = `marrow-${tx.id}`;

        svgEdges += `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="35" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="${strokeColor}" opacity="${opacity}"/></marker><path id="${textPathId}" d="${textPathData}" fill="none" stroke="none" /></defs><path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} opacity="${opacity}" marker-end="url(#${markerId})">${animation}</path><text font-size="12" fill="var(--text-main)" font-family="sans-serif" font-weight="bold" opacity="0.9"><textPath href="#${textPathId}" startOffset="50%" text-anchor="middle" dominant-baseline="central"><tspan dy="-10">${tx.entregable}</tspan></textPath></text>`;
    });

    projects.forEach((p) => {
        const coords = nodeCoords[p.id];
        const isSelected = p.id === originId || p.id === selectedHealthProjectId;
        const borderColor = isSelected ? 'var(--accent-gold)' : 'var(--border-color)';
        const bgColor = isSelected ? 'rgba(210, 153, 34, 0.1)' : 'var(--bg-panel)';
        
        // Nodo Base HTML
        svgNodes += `<foreignObject x="${coords.x - 65}" y="${coords.y - 45}" width="130" height="90" style="overflow:visible;"><div class="macro-node" data-id="${p.id}" xmlns="http://www.w3.org/1999/xhtml" style="background:${bgColor}; border:2px solid ${borderColor}; border-radius:12px; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:8px; cursor:pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: 0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='${borderColor}'"><div style="font-size:1.2rem; margin-bottom:2px;">🏢</div><div style="font-weight:bold; color:var(--text-heading); font-size:0.8rem; line-height:1.2;">${p.nombre}</div><div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; margin-top:4px; font-family:monospace;">${GLOBAL_ONTOLOGY[p.sector]?.nombre || p.sector}</div></div></foreignObject>`;

        // SVG NATIVO PARA LA ALERTA ROJA (No se recorta nunca)
        if (isHealthMode) {
            const atascos = p.transactions?.filter(t => t.status === 'reported' || t.status === 'pinged').length || 0;
            if (atascos > 0) {
                const badgeColor = atascos > 3 ? 'var(--accent-red)' : 'var(--accent-gold)';
                svgAlerts += `<g transform="translate(${coords.x + 60}, ${coords.y - 40})" style="pointer-events: none;">
                                <circle cx="0" cy="0" r="14" fill="${badgeColor}" stroke="var(--bg-surface)" stroke-width="3"/>
                                <text x="0" y="4" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">${atascos}</text>
                              </g>`;
            }
        }
    });

    // ZOOM CONTROLS (Movidos a la esquina inferior izquierda, alta visibilidad y z-index)
    const zoomControls = `
        <div style="position: absolute; bottom: 20px; left: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 8px; background: rgba(22, 27, 34, 0.9); backdrop-filter: blur(5px); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
            <button id="btn-macro-zoom-in" title="Acercar (+)" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-main); width: 35px; height: 35px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.2rem; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--border-color)'">➕</button>
            <button id="btn-macro-zoom-out" title="Alejar (-)" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-main); width: 35px; height: 35px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.2rem; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--border-color)'">➖</button>
            <button id="btn-macro-zoom-fit" title="Ajustar a Pantalla" style="background:var(--bg-surface); border:1px solid var(--border-color); color:var(--text-main); width: 35px; height: 35px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--border-color)'">⛶</button>
        </div>
    `;

    return `<div style="width:100%; height:600px; overflow:hidden; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px; position:relative;">
                ${zoomControls}
                <div id="svg-macro-zoom-wrapper" style="width:100%; height:100%; transform: scale(${currentMacroZoom}); transform-origin: center center; transition: transform 0.2s ease-out; display: flex; align-items: center; justify-content: center;">
                    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block; overflow:visible;">
                        ${svgEdges}${svgNodes}${svgAlerts}
                    </svg>
                </div>
            </div>`;
}

// 🩺 MÓDULO DE DIAGNÓSTICO
function renderEcosystemHealth(projects) {
    if (projects.length === 0) return '<div class="text-muted text-center panel-surface" style="padding:40px;">No hay redes para analizar.</div>';

    let totalAtascos = 0;
    let alerts = [];

    projects.forEach(p => {
        const txs = p.transactions || [];
        const atascos = txs.filter(t => t.status === 'reported' || t.status === 'pinged').length;
        totalAtascos += atascos;
        if (atascos > 3) alerts.push({ level: 'CRITICAL', msg: `Bloqueo severo en "${p.nombre}" (${atascos} tareas atascadas).` });
        else if (atascos > 0) alerts.push({ level: 'WARNING', msg: `Fricción en "${p.nombre}" (${atascos} tareas en revisión).` });
    });

    const globalSalud = Math.max(0, 100 - (totalAtascos * 5));

    let color = "var(--accent-green)";
    if (globalSalud < 70) color = "var(--accent-gold)";
    if (globalSalud < 30) color = "var(--accent-red)";

    return `
        <div class="panel-surface" style="border-top: 4px solid ${color}; padding: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin:0;">Termómetro de Resiliencia Global</h3>
                <span style="font-size: 1.8rem; font-weight: bold; color: ${color};">${globalSalud}%</span>
            </div>
            
            <div style="width: 100%; height: 12px; background: var(--bg-base); border-radius: 6px; overflow: hidden; margin-bottom: 25px; border: 1px solid var(--border-color);">
                <div style="width: ${globalSalud}%; height: 100%; background: ${color}; transition: width 0.5s ease-in-out;"></div>
            </div>

            <h4 style="margin-top: 0; margin-bottom: 15px; color: var(--text-muted);">Diagnóstico de Nodos Activos:</h4>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                ${alerts.length === 0 ? '<div style="font-size: 0.85rem; color: var(--accent-green); background: rgba(35,134,54,0.1); padding: 10px; border-radius: 6px;">✅ Todos los flujos operan de forma óptima. No hay fricciones detectadas.</div>' : 
                  alerts.map(a => `
                    <div style="font-size: 0.85rem; color: ${a.level === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)'}; background: rgba(255,255,255,0.05); border-left: 3px solid ${a.level === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-gold)'}; padding: 10px 15px; border-radius: 4px;">
                        ⚠️ ${a.msg}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const config = state.config || { ecosystemName: 'TeamTowers Network' };
        const projects = state.projects || [];
        const macroFlows = state.macroFlows || [];
        const totalUsers = state.globalUsers?.length || 0;

        // 🧠 KPIs REALES DEL ECOSISTEMA
        const totalRoles = projects.reduce((acc, p) => acc + (p.roles?.filter(r=>!r.isArchived).length || 0), 0);
        const totalSlices = projects.reduce((acc, p) => acc + (p.ledger?.reduce((sum, l) => sum + l.valorCongelado, 0) || 0), 0);

        setTimeout(() => window.setNavbar(
            [{ label: config.ecosystemName, hash: '#/' }, { label: 'Dashboard' }], 
            ``, 
            `<button id="btn-open-new-project" class="btn text-small" style="background: var(--accent-blue); border:none; color:#fff; padding: 8px 15px; border-radius: 6px; font-weight: bold;">➕ Crear Área / Proyecto</button>
             <button onclick="location.hash='#/settings'" class="btn btn-outline text-small" style="border-color: var(--accent-purple); color: var(--accent-purple); padding: 8px 15px; border-radius: 6px;">⚙️ Kernel Settings</button>`
        ), 0);

        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${ecoTabMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${ecoTabMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
        `;

        // MODAL NUEVO MACRO-FLUJO
        let modalMacroHTML = '';
        if (showMacroModal) {
            const pOri = projects.find(p => p.id === macroOriginId);
            const pDes = projects.find(p => p.id === macroDestId);
            modalMacroHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-gold);">
                        <h3 style="margin-top: 0; color: var(--accent-gold);">⚡ Enlazar Áreas (Macro-Flujo)</h3>
                        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">De: <b>${pOri?.nombre}</b> ⟶ Para: <b>${pDes?.nombre}</b></p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">¿Qué valor transfiere esta área?</label>
                        <input type="text" id="macro-entregable" class="form-input" placeholder="Ej: Leads Cualificados / API Funcional" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo de Relación:</label>
                        <select id="macro-tipo" class="form-input" style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px;">
                            <option value="tangible">Tangible (Continua)</option><option value="intangible">Intangible (Discontinua)</option>
                        </select>
                        
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-macro-cancel" class="btn btn-outline" style="flex:1;">Cancelar</button>
                            <button id="btn-macro-save" class="btn btn-primary" style="flex:1; background:var(--accent-gold); border:none; color:#000;">Crear Enlace</button>
                        </div>
                    </div>
                </div>`;
        }

        // MODAL DE SALUD (PING AL PO)
        let modalHealthHTML = '';
        if (showHealthModal && selectedHealthProjectId) {
            const hp = projects.find(p => p.id === selectedHealthProjectId);
            const txs = hp.transactions || [];
            const atascos = txs.filter(t => t.status === 'reported' || t.status === 'pinged');
            
            modalHealthHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 500px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-red);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3 style="margin-top: 0; color: var(--accent-red); display:flex; align-items:center; gap:10px;">
                                <span>🛑</span> Diagnóstico: ${hp.nombre}
                            </h3>
                            <span class="badge" style="background:rgba(248,81,73,0.1); color:var(--accent-red);">${atascos.length} Incidencias</span>
                        </div>
                        
                        <div style="margin: 20px 0; max-height: 200px; overflow-y: auto; background: var(--bg-base); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
                            ${atascos.length === 0 ? '<div style="color:var(--accent-green); padding:10px; font-size:0.9rem;">No hay atascos activos en este departamento.</div>' : 
                              atascos.map(t => {
                                  const rFrom = hp.roles.find(r=>r.id===t.from)?.name || 'Desc.';
                                  return `
                                  <div style="padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
                                      <div style="color: var(--text-heading); font-weight: bold; margin-bottom: 4px;">${t.entregable}</div>
                                      <div style="display:flex; justify-content:space-between; color: var(--text-muted);">
                                          <span>Responsable: ${rFrom}</span>
                                          <span style="color: ${t.status === 'reported' ? 'var(--accent-blue)' : 'var(--accent-gold)'}; font-family:monospace;">${t.status.toUpperCase()}</span>
                                      </div>
                                  </div>`;
                              }).join('')
                            }
                        </div>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Enviar Mensaje / Ping al Project Owner:</label>
                        <textarea id="health-ping-msg" class="form-input" placeholder="Ej: He notado un bloqueo en el entregable de auditoría. ¿Necesitáis recursos adicionales?" style="width:100%; min-height: 80px; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius:6px; resize:vertical;"></textarea>
                        
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-close-health-modal" class="btn btn-outline" style="flex:1;">Cerrar Vista</button>
                            <button id="btn-send-health-ping" data-pid="${hp.id}" class="btn btn-primary" style="flex:2; background:var(--accent-red); border:none; color:#fff; font-weight:bold;">🚨 Enviar Ping de Alerta</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            ${modalMacroHTML}
            ${modalHealthHTML}

            <div class="container fade-in" style="max-width: 1300px; margin: 20px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.5rem; color: var(--text-heading);">${config.ecosystemName}</h1>
                        <p style="margin: 0; color: var(--text-muted);">Ecosistema Fractal. Aquí orquestas las grandes áreas, redes y departamentos.</p>
                    </div>
                </div>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                    <button class="eco-tab-btn" data-mode="macro-map" style="${tabStyle('macro-map')}">🌍 Macro Mapa (Interdepartamental)</button>
                    <button class="eco-tab-btn" data-mode="health" style="${tabStyle('health')}">❤️ Salud Termográfica</button>
                    <button class="eco-tab-btn" data-mode="directory" style="${tabStyle('directory')}">🏢 Directorio de Redes Activas</button>
                </div>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        ${ecoTabMode === 'macro-map' || ecoTabMode === 'health' ? `
                            ${ecoTabMode === 'macro-map' ? `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin:0;">Diseñador de Ecosistema</h3>
                                <span class="badge" style="background: rgba(210,153,34,0.1); color: var(--accent-gold); padding: 6px 12px; font-size: 0.85rem;">
                                    ${!macroOriginId ? '1️⃣ Haz clic en un Área Emisora' : '2️⃣ Haz clic en el Área Receptora'}
                                </span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Dibuja cómo las distintas áreas de tu empresa o DAO se nutren de valor entre sí antes de hacer <i>zoom in</i> en sus propios roles.</p>
                            ` : `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin:0; color:var(--accent-red);">❤️ Diagnóstico en Vivo</h3>
                                <span class="badge" style="background: rgba(248,81,73,0.1); color: var(--accent-red); padding: 6px 12px; font-size: 0.85rem;">
                                    🖱️ Haz clic en un nodo atascado para enviar un Ping
                                </span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Visualiza en tiempo real qué departamentos están atascados.</p>
                            `}
                            
                            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                                <button class="btn btn-outline text-small btn-export-svg" style="border-color: var(--accent-gold); color: var(--accent-gold); display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1.2rem;">📸</span> Exportar Mapa (SVG)
                                </button>
                            </div>

                            ${generateMacroSVG(projects, macroFlows, macroOriginId, ecoTabMode === 'health')}
                            
                            ${ecoTabMode === 'health' ? renderEcosystemHealth(projects) : ''}
                        ` : ''}

                        ${ecoTabMode === 'directory' ? `
                            <h3 style="margin-top: 0; margin-bottom: 20px;">Redes Activas (Zoom In)</h3>
                            ${projects.length === 0 ? `<div class="panel text-center text-muted">No hay proyectos. Crea tu primera red arriba a la derecha.</div>` : `
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                                    ${projects.map(p => `
                                        <div class="panel-surface" style="border-top: 4px solid var(--accent-blue); transition: transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="location.hash='#/project/${p.id}'">
                                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 15px;">
                                                <h3 style="margin: 0; font-size: 1.2rem;">${p.nombre}</h3>
                                                <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">${GLOBAL_ONTOLOGY[p.sector]?.nombre || p.sector}</span>
                                            </div>
                                            <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">
                                                <span>🎭 ${p.roles?.filter(r=>!r.isArchived).length || 0} Roles base</span>
                                                <span>📝 ${p.transactions?.length || 0} Flujos</span>
                                            </div>
                                            <button class="btn btn-outline btn-block text-small">Entrar (Zoom In) 🔍</button>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        ` : ''}
                    </main>

                    <aside>
                        <div class="panel" style="background: rgba(88,166,255,0.05); border-color: rgba(88,166,255,0.2); margin-bottom: 25px;">
                            <h4 style="margin-top:0; color:var(--accent-blue); display: flex; align-items: center; gap: 8px;">
                                <span style="font-size:1.2rem;">💡</span> Tip del Sistema Fractal
                            </h4>
                            <p style="font-size:0.85rem; color:var(--text-main); margin:0;">
                                El Macro-Mapa te permite definir las "reglas del juego" entre departamentos. Si el equipo <b>Tech</b> depende del equipo <b>Design</b> para funcionar, dibuja ese enlace aquí. Luego, entra en el área de Design para gestionar quién hace qué tarea concreta.
                            </p>
                        </div>

                        <h3 style="margin-bottom: 15px;">📊 Resumen Ecosistema</h3>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--accent-green);">
                                <div class="text-muted text-small text-uppercase">Total Valor Aportado</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-green);">${totalSlices.toLocaleString()} <span style="font-size:1rem; font-weight:normal;">Slices</span></div>
                            </div>
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--text-muted);">
                                <div class="text-muted text-small text-uppercase">Nodos Humanos Totales</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-heading);">${totalUsers}</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--accent-purple);">
                                <div class="text-muted text-small text-uppercase">Roles Orquestados</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-purple);">${totalRoles}</div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            <div id="modal-new-project" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
                <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-blue);">
                    <h2 style="margin-top:0; color: var(--text-heading);">🏢 Crear Área / Red</h2>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Instancia un nuevo departamento clonando el ADN de la Ontología Universal.</p>
                    
                    <label class="form-label">Nombre del Área (Ej: Dev, Marketing)</label>
                    <input type="text" id="new-proj-name" class="form-control" placeholder="Nombre de la Red">
                    
                    <label class="form-label">Sector / Plantilla Ontológica Base</label>
                    <select id="new-proj-sector" class="form-control">
                        <option value="">Seleccionar del Kernel...</option>
                        ${Object.keys(GLOBAL_ONTOLOGY).map(k => `<option value="${k}">${GLOBAL_ONTOLOGY[k].nombre}</option>`).join('')}
                    </select>

                    <label class="form-label">Tipo Sistémico</label>
                    <select id="new-proj-tipo" class="form-control">
                        <option value="project">🎯 Proyecto Finito (Tiene fin)</option>
                        <option value="ecosystem">🌍 Ecosistema (Continuo/Departamento)</option>
                    </select>
                    
                    <div style="display:flex; gap:10px; margin-top: 25px;">
                        <button id="btn-close-new-project" class="btn btn-outline" style="flex:1;">Cancelar</button>
                        <button id="btn-save-new-project" class="btn btn-primary" style="flex:1; background:var(--accent-blue); border:none;">Instanciar Red</button>
                    </div>
                </div>
            </div>
        `;
    }
};
