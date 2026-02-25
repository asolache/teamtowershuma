import { store } from '../core/store.js';

// 🛡️ ESTADO TEMPORAL PARA LA IMPORTACIÓN
let pendingImport = null;

const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            pendingImport = Array.isArray(data) ? { entries: data } : data; 
            document.getElementById('app').innerHTML = DashboardView.render();
        } catch (err) {
            alert("Error: El archivo no es un JSON válido.");
        }
    };
    reader.readAsText(file);
};

// 🛡️ GESTOR ÚNICO DE EVENTOS (Delegación)
document.addEventListener('change', (e) => {
    if (e.target.id === 'input-import-file') handleFileSelect(e);
});

document.addEventListener('click', (e) => {
    // 1. Crear nuevo proyecto y redirigir
    if (e.target.id === 'btn-create-project') {
        const nameInput = document.getElementById('new-proj-name');
        const sectorInput = document.getElementById('new-proj-sector');
        const name = nameInput.value.trim();
        const sector = sectorInput.value;

        if (!name) return alert("⚠️ Dale un nombre a tu ecosistema.");
        
        const newId = '0x' + Math.random().toString(16).slice(2, 10);
        
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: { id: newId, nombre: name, sector, ownerId: 'ecosystem-admin' } 
        });
        
        // 🚀 REDIRECCIÓN GARANTIZADA AL CONFIGURADOR
        window.location.hash = `#/project/${newId}/edit`;
    }

    // 2. Click en una Tarjeta de Proyecto (Delegación robusta)
    const projectCard = e.target.closest('.project-card-link');
    if (projectCard) {
        const pId = projectCard.getAttribute('data-pid');
        window.location.hash = `#/project/${pId}`;
    }

    // 3. Historia Dogfooding
    if (e.target.id === 'btn-import-history') {
        const batchData = {
            entries: [
                { projectId: "SOS_CORE", userId: "@admin", levelId: "@anxaneta", description: "Arquitectura SOS v5.5", horas: 3, timestamp: Date.now() }
            ]
        };
        if(confirm("¿Inyectar historial de construcción real?")) {
            store.dispatch({ type: 'IMPORT_BATCH_LEDGER', payload: batchData });
            document.getElementById('app').innerHTML = DashboardView.render();
        }
    }

    // 4. Confirmar/Cancelar Importación
    if (e.target.id === 'btn-cancel-import') {
        pendingImport = null;
        document.getElementById('app').innerHTML = DashboardView.render();
    }

    if (e.target.id === 'btn-confirm-import') {
        const ownerId = document.getElementById('import-assign-owner').value;
        store.dispatch({ 
            type: 'IMPORT_BATCH_LEDGER', 
            payload: { ...pendingImport, ownerId } 
        });
        alert("✅ Ecosistema importado correctamente.");
        pendingImport = null;
        document.getElementById('app').innerHTML = DashboardView.render();
    }
});

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        const sectoresCore = Object.keys(state.ontology.sectores);

        // KPIs
        let totalGlobalPie = 0;
        let totalHealthScore = 0;
        let totalNodes = 0;
        
        projects.forEach(p => {
            totalGlobalPie += (p.ledger || []).reduce((acc, l) => acc + (l.valorCongelado || 0), 0);
            totalHealthScore += store.calculateResilience ? store.calculateResilience(p.id) : 100;
            totalNodes += (p.roles || []).filter(r => !r.isArchived).length;
        });
        const avgHealth = projects.length > 0 ? Math.round(totalHealthScore / projects.length) : 0;

        if (pendingImport) {
            const entries = pendingImport.entries || [];
            return `
            <div class="container fade-in">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🔍 Validador de Importación</h1>
                        <p class="text-muted">Revisando integridad del Backlog externo.</p>
                    </div>
                    <button id="btn-cancel-import" class="btn btn-secondary">Cancelar</button>
                </header>
                <div class="panel" style="border-top: 4px solid var(--accent-gold);">
                    <div style="margin-bottom: 20px; display: flex; gap: 20px; align-items: flex-end;">
                        <div style="flex: 1;">
                            <label class="form-label">Asignar Proyecto a (Owner):</label>
                            <select id="import-assign-owner" class="form-control">
                                <option value="ecosystem-admin">Ecosystem Owner (Tú)</option>
                            </select>
                        </div>
                        <button id="btn-confirm-import" class="btn btn-primary" style="height: 42px; flex: 1;">✅ Validar y Generar</button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="width:100%; font-size: 0.8rem; border-collapse: collapse;">
                            ${entries.map(e => `<tr style="border-top: 1px solid rgba(255,255,255,0.05);"><td style="padding:10px;">${e.description}</td><td style="text-align:right; padding:10px;"><b>${e.horas}h</b></td></tr>`).join('')}
                        </table>
                    </div>
                </div>
            </div>`;
        }

        return `
            <div class="container fade-in">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent" style="margin: 0;">🚀 TeamTowers: Ecosystem Center</h1>
                        <p class="text-muted" style="margin: 5px 0 0 0;">Gestión de Redes de Valor e Identidades.</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <label for="input-import-file" class="btn btn-outline" style="cursor:pointer; border-color: var(--accent-purple); color: var(--accent-purple);">📥 Importar</label>
                        <input type="file" id="input-import-file" style="display:none;" accept=".json">
                        <button class="btn btn-primary" onclick="location.hash='#/user-dashboard'" style="background: var(--accent-green); color: #000;">🧑‍🚀 Mi Portal</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div class="panel" style="text-align: center;">
                        <div class="text-small text-muted text-uppercase">Redes</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-blue);">${projects.length}</div>
                    </div>
                    <div class="panel" style="text-align: center;">
                        <div class="text-small text-muted text-uppercase">Nodos</div>
                        <div style="font-size: 1.8rem; font-weight: bold;">${totalNodes}</div>
                    </div>
                    <div class="panel" style="text-align: center;">
                        <div class="text-small text-muted text-uppercase">Salud Avg</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-green);">${avgHealth}%</div>
                    </div>
                    <div class="panel" style="text-align: center; border-color: var(--accent-gold);">
                        <div class="text-small text-muted text-uppercase">TVL (Pie)</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-gold);">${totalGlobalPie.toLocaleString()} €</div>
                    </div>
                </div>

                <div class="grid-layout">
                    <main>
                        <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Redes Activas</h3>
                        ${projects.length === 0 ? '<p class="text-muted">No hay redes. Despliega una nueva →</p>' : projects.map(p => `
                            <div class="panel-surface project-card-link" data-pid="${p.id}" style="cursor: pointer; margin-bottom: 12px; transition: 0.2s; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <b style="color: var(--accent-blue); font-size: 1.1rem;">${p.nombre}</b>
                                    <div class="text-small text-muted text-uppercase">${p.sector} • ${p.id}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: var(--accent-gold); font-weight: bold;">${((p.ledger || []).reduce((acc, l) => acc + (l.valorCongelado || 0), 0)).toLocaleString()} €</div>
                                    <div class="text-small text-muted">Equity Sellado</div>
                                </div>
                            </div>
                        `).join('')}
                    </main>

                    <aside>
                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h4 style="margin-top:0; color: var(--accent-purple);">⚡ Desplegar Ecosistema</h4>
                            <label class="form-label">Nombre</label>
                            <input type="text" id="new-proj-name" class="form-control" placeholder="Nombre de la red...">
                            <label class="form-label">Sector</label>
                            <select id="new-proj-sector" class="form-control">
                                ${sectoresCore.map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('')}
                            </select>
                            <button id="btn-create-project" class="btn btn-primary btn-block">Lanzar y Configurar →</button>
                        </div>
                        <button class="btn btn-outline btn-block" style="margin-top: 15px;" onclick="location.hash='#/settings'">⚙️ Ajustes Globales</button>
                    </aside>
                </div>
            </div>`;
    }
};
