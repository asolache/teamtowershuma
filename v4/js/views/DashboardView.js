import { store } from '../core/store.js';

let ecoTabMode = 'macro-map'; // macro-map, directory, health
let macroOriginId = null;
let macroDestId = null;
let showMacroModal = false;

document.addEventListener('click', (e) => {
    
    // --- TABS ---
    if (e.target.classList.contains('eco-tab-btn')) {
        ecoTabMode = e.target.getAttribute('data-mode');
        macroOriginId = null; macroDestId = null; showMacroModal = false;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    // --- CREADOR ÁGIL DE MACRO-FLUJOS (Clics en nodos del mapa) ---
    const nodeElement = e.target.closest('.macro-node');
    if (nodeElement && ecoTabMode === 'macro-map') {
        const clickedProjId = nodeElement.getAttribute('data-id');

        if (!macroOriginId) { macroOriginId = clickedProjId; } 
        else if (macroOriginId === clickedProjId) { macroOriginId = null; } 
        else { macroDestId = clickedProjId; showMacroModal = true; }
        
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    // --- MODALES MACRO-FLUJO ---
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

    // --- MODAL CREAR NUEVA ÁREA/PROYECTO ---
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
    projects.forEach((p, i) => { const angle = (i / projects.length) * 2 * Math.PI; nodes[p.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), vx: 0, vy: 0 }; });
    const iterations = 120; const k = Math.sqrt((width * height) / (projects.length || 1)); 
    
    for (let iter = 0; iter < iterations; iter++) {
        // Repulsión
        for (let i = 0; i < projects.length; i++) {
            for (let j = 0; j < projects.length; j++) {
                if (i !== j) {
                    const n1 = nodes[projects[i].id]; const n2 = nodes[projects[j].id];
                    const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
                    const force = (k * k) / distance; n1.vx += (dx / distance) * force; n1.vy += (dy / distance) * force;
                }
            }
        }
        // Atracción (Enlaces)
        macroFlows.forEach(tx => {
            if (!nodes[tx.from] || !nodes[tx.to]) return;
            const n1 = nodes[tx.from]; const n2 = nodes[tx.to];
            const dx = n1.x - n2.x; const dy = n1.y - n2.y; const distance = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = (distance * distance) / k; const fx = (dx / distance) * force * 0.05; const fy = (dy / distance) * force * 0.05;
            n1.vx -= fx; n1.vy -= fy; n2.vx += fx; n2.vy += fy;
        });
        // Fricción y Límites
        projects.forEach(p => {
            const n = nodes[p.id]; n.x += n.vx; n.y += n.vy; n.vx *= 0.7; n.vy *= 0.7;
            n.x = Math.max(80, Math.min(width - 80, n.x)); n.y = Math.max(80, Math.min(height - 80, n.y));
        });
    }
    return nodes;
}

function generateMacroSVG(projects, macroFlows, originId) {
    if(projects.length === 0) return `<div class="text-center text-muted" style="padding:40px;">El ecosistema está vacío. Crea tu primera Área.</div>`;
    
    const svgWidth = 1000; const svgHeight = 500;
    const nodeCoords = calculateMacroLayout(projects, macroFlows, svgWidth, svgHeight);
    let svgNodes = ''; let svgEdges = ''; let edgeCurveCounter = {}; 

    macroFlows.forEach((tx) => {
        const from = nodeCoords[tx.from]; const to = nodeCoords[tx.to]; if (!from || !to) return;
        const isTangible = tx.tipo !== 'intangible';
        const strokeDash = isTangible ? "" : "stroke-dasharray='8,8'"; 
        const strokeColor = "var(--accent-purple)"; 
        
        const pairKey = [tx.from, tx.to].sort().join('-'); edgeCurveCounter[pairKey] = (edgeCurveCounter[pairKey] || 0) + 1;
        const dx = to.x - from.x; const dy = to.y - from.y; const dist = Math.sqrt(dx*dx + dy*dy);
        const nx = -dy / dist; const ny = dx / dist;  
        const curveStrength = 40 * (edgeCurveCounter[pairKey] % 2 === 0 ? 1 : -1) * Math.ceil(edgeCurveCounter[pairKey]/2);
        const cx = (from.x + to.x) / 2 + (nx * curveStrength); const cy = (from.y + to.y) / 2 + (ny * curveStrength);
        
        const pathData = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;
        let textPathData = pathData;
        if (from.x > to.x) textPathData = `M ${to.x} ${to.y} Q ${cx} ${cy}, ${from.x} ${from.y}`;

        const pathId = `medge-${tx.id}`; const textPathId = `mtextedge-${tx.id}`; const markerId = `marrow-${tx.id}`;

        svgEdges += `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="35" refY="4" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="${strokeColor}" opacity="0.6"/></marker><path id="${textPathId}" d="${textPathData}" fill="none" stroke="none" /></defs><path id="${pathId}" d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="3" ${strokeDash} opacity="0.6" marker-end="url(#${markerId})"></path><text font-size="12" fill="var(--text-main)" font-family="sans-serif" font-weight="bold" opacity="0.9"><textPath href="#${textPathId}" startOffset="50%" text-anchor="middle" dominant-baseline="central"><tspan dy="-10">${tx.entregable}</tspan></textPath></text>`;
    });

    projects.forEach((p) => {
        const coords = nodeCoords[p.id];
        const isSelected = p.id === originId;
        const borderColor = isSelected ? 'var(--accent-gold)' : 'var(--border-color)';
        const bgColor = isSelected ? 'rgba(210, 153, 34, 0.1)' : 'var(--bg-panel)';
        
        svgNodes += `<foreignObject x="${coords.x - 65}" y="${coords.y - 45}" width="130" height="90" style="overflow:visible;"><div class="macro-node" data-id="${p.id}" xmlns="http://www.w3.org/1999/xhtml" style="background:${bgColor}; border:2px solid ${borderColor}; border-radius:12px; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:8px; cursor:pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: 0.2s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='${borderColor}'"><div style="font-size:1.2rem; margin-bottom:2px;">🏢</div><div style="font-weight:bold; color:var(--text-heading); font-size:0.8rem; line-height:1.2;">${p.nombre}</div><div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; margin-top:4px; font-family:monospace;">${p.sector}</div></div></foreignObject>`;
    });

    return `<div style="width:100%; overflow-x:auto; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 20px;"><svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display:block; margin: 0 auto; overflow:visible;">${svgEdges}${svgNodes}</svg></div>`;
}

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const config = state.config || { ecosystemName: 'TeamTowers Network' };
        const projects = state.projects || [];
        const macroFlows = state.macroFlows || [];
        const sectores = state.ontology?.sectores || {};

        // 🚀 SET NAVBAR GLOBAL (Breadcrumbs a la izquierda, Acciones a la derecha)
        setTimeout(() => window.setNavbar(
            [{ label: '🏠 Hub' }], 
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

        

        return `
            ${modalMacroHTML}

            <div class="container fade-in" style="max-width: 1300px; margin: 20px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.5rem; color: var(--text-heading);">${config.ecosystemName}</h1>
                        <p style="margin: 0; color: var(--text-muted);">Ecosistema Fractal. Aquí orquestas las grandes áreas, redes y departamentos.</p>
                    </div>
                </div>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                    <button class="eco-tab-btn" data-mode="macro-map" style="${tabStyle('macro-map')}">🌍 Macro Mapa (Interdepartamental)</button>
                    <button class="eco-tab-btn" data-mode="directory" style="${tabStyle('directory')}">🏢 Directorio de Redes Activas</button>
                    <button class="eco-tab-btn" data-mode="health" style="${tabStyle('health')}">📈 Salud del Ecosistema</button>
                </div>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        ${ecoTabMode === 'macro-map' ? `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin:0;">Diseñador de Ecosistema</h3>
                                <span class="badge" style="background: rgba(210,153,34,0.1); color: var(--accent-gold); padding: 6px 12px; font-size: 0.85rem;">
                                    ${!macroOriginId ? '1️⃣ Haz clic en un Área Emisora' : '2️⃣ Haz clic en el Área Receptora'}
                                </span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Dibuja cómo las distintas áreas de tu empresa o DAO se nutren de valor entre sí antes de hacer <i>zoom in</i> en sus propios roles.</p>
                            ${generateMacroSVG(projects, macroFlows, macroOriginId)}
                        ` : ''}

                        ${ecoTabMode === 'directory' ? `
                            <h3 style="margin-top: 0; margin-bottom: 20px;">Redes Activas (Zoom In)</h3>
                            ${projects.length === 0 ? `<div class="panel text-center text-muted">No hay proyectos. Crea tu primera red arriba a la derecha.</div>` : `
                                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                                    ${projects.map(p => `
                                        <div class="panel-surface" style="border-top: 4px solid var(--accent-blue); transition: transform 0.2s; cursor:pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="location.hash='#/project/${p.id}'">
                                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 15px;">
                                                <h3 style="margin: 0; font-size: 1.2rem;">${p.nombre}</h3>
                                                <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">${p.sector.toUpperCase()}</span>
                                            </div>
                                            <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">
                                                <span>🎭 ${p.roles?.length || 0} Roles base</span>
                                                <span>📝 ${p.transactions?.length || 0} Flujos</span>
                                            </div>
                                            <button class="btn btn-outline btn-block text-small">Entrar (Zoom In) 🔍</button>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        ` : ''}

                        ${ecoTabMode === 'health' ? `
                            <div class="panel-surface text-center" style="padding: 50px; border: 1px dashed var(--border-color);">
                                <h3 style="color: var(--text-muted);">Analítica Global en Desarrollo</h3>
                                <p class="text-small text-muted">Próximamente: Gráficas de rendimiento cruzado entre todos los departamentos del Ecosistema.</p>
                            </div>
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
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--text-muted);">
                                <div class="text-muted text-small text-uppercase">Nodos Humanos Totales</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-heading);">${state.globalUsers?.length || 0}</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--accent-purple);">
                                <div class="text-muted text-small text-uppercase">Áreas / Redes Creadas</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-purple);">${projects.length}</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px; border-left: 3px solid var(--accent-gold);">
                                <div class="text-muted text-small text-uppercase">Macro-Flujos Definidos</div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-gold);">${macroFlows.length}</div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            <div id="modal-new-project" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
                <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-blue);">
                    <h2 style="margin-top:0; color: var(--text-heading);">🏢 Crear Área / Red</h2>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Instancia un nuevo departamento clonando el ADN de una plantilla de la Ontología.</p>
                    
                    <label class="form-label">Nombre del Área (Ej: Dev, Marketing)</label>
                    <input type="text" id="new-proj-name" class="form-control" placeholder="Nombre de la Red">
                    
                    <label class="form-label">Sector / Plantilla Ontológica Base</label>
                    <select id="new-proj-sector" class="form-control">
                        <option value="">Seleccionar del Kernel...</option>
                        ${Object.keys(sectores).map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('')}
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
