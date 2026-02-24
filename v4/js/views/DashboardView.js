import { store } from '../core/store.js';

// 🛡️ EVENTOS DEL DASHBOARD
document.addEventListener('click', (e) => {
    // 1. Crear nuevo proyecto (Actualizado con IDs hexadecimales tipo ETH)
    if (e.target.id === 'btn-create-project') {
        const name = document.getElementById('new-proj-name').value;
        const sector = document.getElementById('new-proj-sector').value;
        
        if (!name) return alert("Dale un nombre a tu ecosistema.");
        
        // Generamos un ID tipo '0x...' para mantener la estética blockchain
        const newId = '0x' + Math.random().toString(16).slice(2, 10);
        
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: { 
                id: newId, 
                nombre: name, 
                sector: sector,
                ownerId: 'ecosystem-admin' // Jerarquía: Ecosystem Owner por defecto
            } 
        });
        
        // Redirigir a la vista del proyecto recién creado
        location.hash = `#/project/${newId}`;
    }

    // 🚀 2. BOTÓN MÁGICO: Importar Historial Real (Dogfooding SOS)
    if (e.target.id === 'btn-import-history') {
        const batchData = {
            entries: [
                {
                    projectId: "0x564e41_SOS_CORE",
                    userId: "usr-human-01",
                    levelId: "@anxaneta",
                    receiverId: "role-dev-01",
                    description: "Hito v4.4: Arquitectura de Kernel Reactivo y Store Centralizado",
                    horas: 2.5,
                    timestamp: Date.now() - 86400000
                },
                {
                    projectId: "0x564e41_SOS_CORE",
                    userId: "usr-gemini-ai",
                    levelId: "@baixos",
                    receiverId: "role-strat-01",
                    description: "Hito v4.4: Implementación de LocalStorage y Dispatcher",
                    horas: 0.2,
                    timestamp: Date.now() - 82400000
                },
                {
                    projectId: "0x5549_SOS_INTERFACE",
                    userId: "usr-human-01",
                    levelId: "@dosos",
                    receiverId: "role-dev-01",
                    description: "Hito v4.5: Requerimiento de Cap Table visual y Gráfica de Tarta",
                    horas: 1.5,
                    timestamp: Date.now() - 14400000
                },
                {
                    projectId: "0x5549_SOS_INTERFACE",
                    userId: "usr-gemini-ai",
                    levelId: "@baixos",
                    receiverId: "role-qa-01",
                    description: "Hito v4.5: Renderizado de Chart CSS dinámico y Ledger",
                    horas: 0.15,
                    timestamp: Date.now() - 10800000
                },
                {
                    projectId: "0x564e41_SOS_CORE",
                    userId: "usr-human-01",
                    levelId: "@anxaneta",
                    receiverId: "role-dev-01",
                    description: "Hito v4.6: Ingeniería de 50 Prompts Maestros y Algoritmo de Gravedad",
                    horas: 3.0,
                    timestamp: Date.now() - 3600000
                },
                {
                    projectId: "0x564e41_SOS_CORE",
                    userId: "usr-gemini-ai",
                    levelId: "@baixos",
                    receiverId: "role-strat-01",
                    description: "Hito v4.6: Store v4.7 (Matriz de Órbitas y DNA Check)",
                    horas: 0.25,
                    timestamp: Date.now() - 1800000
                }
            ]
        };

        if(confirm("¿Deseas inyectar el historial real de construcción de TeamTowers SOS en el Ledger?")) {
            store.dispatch({ type: 'IMPORT_BATCH_LEDGER', payload: batchData });
            alert("✅ Dogfooding completado: Historial sincronizado y proyectos de infraestructura creados.");
            document.getElementById('app').innerHTML = DashboardView.render();
        }
    }
});

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        const sectoresCore = Object.keys(state.ontology.sectores);

        // Generar lista dinámica de proyectos con cálculo de Slicing Pie
        const projectsListHTML = projects.length === 0 
            ? `<div class="text-muted text-center" style="padding: 40px;">Aún no hay ecosistemas. Crea uno o importa el historial real.</div>`
            : projects.map(p => {
                const rolesCount = (p.roles || []).filter(r => !r.isArchived).length;
                const txCount = (p.transactions || []).length;
                const salud = store.calculateResilience ? store.calculateResilience(p.id) : 100;
                
                // Cálculo del valor total acumulado del proyecto
                const totalPie = (p.ledger || []).reduce((acc, l) => acc + (l.valorCongelado || 0), 0);

                return `
                <div class="list-item" onclick="location.hash='#/project/${p.id}'" 
                     style="cursor: pointer; display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.3s;" 
                     onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <b style="font-size: 1.1rem; color: var(--accent-blue);">${p.nombre}</b>
                            <span class="id-badge" style="font-size: 0.6rem;">${p.id}</span>
                        </div>
                        <span class="text-small text-muted text-uppercase">${p.sector} • ${rolesCount} Nodos • ${txCount} Flujos</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--accent-green); font-weight: bold; font-size: 1rem;">${totalPie.toLocaleString()} €</div>
                        <div class="text-small text-muted" style="color: ${salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)'}">Resiliencia: ${salud}%</div>
                    </div>
                </div>
                `;
            }).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🚀 TeamTowers SOS: Dashboard</h1>
                        <p class="text-muted">Vista de <b>Ecosystem Owner</b> | Gestión de Redes de Valor</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">👤 Portal del Contribuidor</button>
                        <button id="btn-import-history" class="btn btn-outline" style="border-color: var(--accent-purple); color: var(--accent-purple);">
                            ✨ Importar Historia Real
                        </button>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        <div class="panel">
                            <h3 style="margin-top:0; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Ecosistemas Activos</h3>
                            <div class="list-group">
                                ${projectsListHTML}
                            </div>
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">+ Nuevo Ecosistema</h4>
                            <p class="text-small text-muted">Inicializa un mapa con la ontología del sector precargada.</p>
                            
                            <label class="form-label">Nombre del Proyecto</label>
                            <input type="text" id="new-proj-name" class="form-control" placeholder="Ej: Core Platform v5">
                            
                            <label class="form-label">Sector Operativo</label>
                            <select id="new-proj-sector" class="form-control text-uppercase">
                                ${sectoresCore.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            
                            <button id="btn-create-project" class="btn btn-primary btn-block" style="margin-top: 15px;">
                                Inicializar Nodos →
                            </button>
                        </div>

                        <div class="panel" style="background: linear-gradient(135deg, var(--bg-panel) 0%, rgba(163, 113, 247, 0.1) 100%);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">🤖 Consultoría IA</h4>
                            <p class="text-small text-muted">Aviso del Sistema Experto SOS.</p>
                            <div style="background: var(--bg-surface); padding: 10px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                                "Al importar la historia real, el sistema reconocerá las 10.6 horas de colaboración entre el Humano y la IA, inyectando el primer fondo de Slicing Pie al ecosistema."
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
};
