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
            // Si el JSON viene de un backlog plano, lo envolvemos en entries
            pendingImport = Array.isArray(data) ? { entries: data } : data; 
            document.getElementById('app').innerHTML = DashboardView.render();
        } catch (err) {
            alert("Error: El archivo no es un JSON válido.");
        }
    };
    reader.readAsText(file);
};

// 🛡️ EVENTOS DEL DASHBOARD
document.addEventListener('change', (e) => {
    if (e.target.id === 'input-import-file') handleFileSelect(e);
});

document.addEventListener('click', (e) => {
    // 1. Crear nuevo proyecto manual
    if (e.target.id === 'btn-create-project') {
        const name = document.getElementById('new-proj-name').value;
        const sector = document.getElementById('new-proj-sector').value;
        if (!name) return alert("Dale un nombre a tu ecosistema.");
        
        const newId = '0x' + Math.random().toString(16).slice(2, 10);
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: { id: newId, nombre: name, sector, ownerId: 'ecosystem-admin' } 
        });
        location.hash = `#/project/${newId}`;
    }

    // 🚀 2. BOTÓN DOGFOODING (Historia TeamTowers)
    if (e.target.id === 'btn-import-history') {
        const batchData = {
            entries: [
                { projectId: "0x564e41_SOS_CORE", userId: "usr-human-01", levelId: "@anxaneta", description: "Arquitectura v4.4", horas: 2.5, timestamp: Date.now() - 86400000 },
                { projectId: "0x564e41_SOS_CORE", userId: "usr-gemini-ai", levelId: "@baixos", description: "Kernel v4.4", horas: 0.2, timestamp: Date.now() - 82400000 },
                { projectId: "0x5549_SOS_INTERFACE", userId: "usr-human-01", levelId: "@dosos", description: "UX v4.5", horas: 1.5, timestamp: Date.now() - 14400000 }
            ]
        };
        if(confirm("¿Deseas inyectar el historial real de construcción?")) {
            store.dispatch({ type: 'IMPORT_BATCH_LEDGER', payload: batchData });
            document.getElementById('app').innerHTML = DashboardView.render();
        }
    }

    // 🚀 3. CANCELAR O CONFIRMAR IMPORTACIÓN REAL
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
        alert("✅ Ecosistema importado y asignado correctamente.");
        pendingImport = null;
        document.getElementById('app').innerHTML = DashboardView.render();
    }
});

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        const sectoresCore = Object.keys(state.ontology.sectores);

        // --- MODO REVISIÓN (Si hay un archivo cargado) ---
        if (pendingImport) {
            const entries = pendingImport.entries || [];
            return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🔍 Validador de Valor: Ecosystem Owner</h1>
                        <p class="text-muted">Revisando integridad antes del despliegue en el Ledger.</p>
                    </div>
                    <button id="btn-cancel-import" class="btn btn-secondary">Cancelar</button>
                </header>

                <div class="panel" style="border-top: 4px solid var(--accent-gold);">
                    <h3>Estructura del Backlog detectada</h3>
                    <div style="margin: 20px 0; display: flex; gap: 20px; align-items: flex-end;">
                        <div style="flex: 1;">
                            <label class="form-label">Asignar Proyecto a (Owner):</label>
                            <select id="import-assign-owner" class="form-control">
                                <option value="ecosystem-admin">Ecosystem Owner (Tú)</option>
                                <option value="usr-laura">Laura (Project Owner)</option>
                                <option value="usr-pablo">Pablo (Project Owner)</option>
                            </select>
                        </div>
                        <button id="btn-confirm-import" class="btn btn-primary" style="height: 42px; flex: 1;">
                            ✅ Validar y Generar Mapa de Valor
                        </button>
                    </div>

                    <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                        <table style="width:100%; font-size: 0.85rem; border-collapse: collapse;">
                            <thead style="background: rgba(255,255,255,0.05);">
                                <tr>
                                    <th style="padding:15px; text-align:left;">Entregable</th>
                                    <th>Horas</th>
                                    <th>Órbita</th>
                                    <th>ID Proyecto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${entries.map(e => `
                                    <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding:12px;">${e.description}</td>
                                        <td style="text-align:center;"><b>${e.horas}h</b></td>
                                        <td style="text-align:center;"><span class="id-badge">${e.levelId || '@baixos'}</span></td>
                                        <td style="text-align:center; opacity:0.6;">${e.projectId}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        }

        // --- VISTA NORMAL ---
        const projectsListHTML = projects.length === 0 
            ? `<div class="text-muted text-center" style="padding: 40px;">No hay ecosistemas activos.</div>`
            : projects.map(p => {
                const totalPie = (p.ledger || []).reduce((acc, l) => acc + (l.valorCongelado || 0), 0);
                const salud = store.calculateResilience ? store.calculateResilience(p.id) : 100;
                return `
                <div class="list-item" onclick="location.hash='#/project/${p.id}'" 
                     style="cursor: pointer; display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <b style="font-size: 1.1rem; color: var(--accent-blue);">${p.nombre}</b>
                            <span class="id-badge" style="font-size: 0.6rem;">${p.id}</span>
                        </div>
                        <span class="text-small text-muted text-uppercase">${p.sector} • ${p.ownerId === 'ecosystem-admin' ? '🛡️ ADMIN' : '👤 OWNER'}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--accent-green); font-weight: bold; font-size: 1rem;">${totalPie.toLocaleString()} €</div>
                        <div class="text-small text-muted" style="color: ${salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)'}">Salud: ${salud}%</div>
                    </div>
                </div>`;
            }).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🚀 TeamTowers SOS: Dashboard</h1>
                        <p class="text-muted">Gobernanza de Redes de Valor</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <label for="input-import-file" class="btn btn-outline" style="cursor:pointer; border-color: var(--accent-purple); color: var(--accent-purple);">
                            📥 Cargar Backlog (.json)
                        </label>
                        <input type="file" id="input-import-file" style="display:none;" accept=".json">
                        
                        <button id="btn-import-history" class="btn btn-secondary">✨ Historia Dogfooding</button>
                        <button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">👤 Mi Portal</button>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    <main>
                        <div class="panel">
                            <h3 style="margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Ecosistemas Activos</h3>
                            <div class="list-group">${projectsListHTML}</div>
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">+ Nuevo Ecosistema</h4>
                            <label class="form-label">Nombre</label>
                            <input type="text" id="new-proj-name" class="form-control" placeholder="Ej: Core Platform">
                            <label class="form-label">Sector</label>
                            <select id="new-proj-sector" class="form-control text-uppercase">
                                ${sectoresCore.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            <button id="btn-create-project" class="btn btn-primary btn-block" style="margin-top: 15px;">Inicializar Nodos →</button>
                        </div>

                        <div class="panel" style="background: linear-gradient(135deg, var(--bg-panel) 0%, rgba(163, 113, 247, 0.1) 100%);">
                            <h4 style="margin: 0; color: var(--accent-purple);">💡 MODELO DE NEGOCIO</h4>
                            <p class="text-small text-muted" style="margin-top:10px;">
                                Como <b>Ecosystem Owner</b>, tu validación es la "firma" que convierte un backlog de tareas en una estructura financiera de Equity Real.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
};
