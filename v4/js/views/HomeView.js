import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS PARA EL DASHBOARD
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-create-project') {
        const name = document.getElementById('new-p-name').value;
        const sector = document.getElementById('new-p-sector').value;
        if (!name) return alert("Por favor, ponle un nombre al Castell");
        
        const id = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: { id, nombre: name, sector: sector } 
        });
        location.hash = '#/project/' + id;
    }

    const card = e.target.closest('.project-card');
    if (card) {
        location.hash = card.getAttribute('data-route');
    }
});

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = [...(state.projects || [])].reverse();
        
        // 📊 LÓGICA DE ESTADÍSTICAS GLOBALES
        let globalValue = 0;
        let globalTxs = 0;
        let globalResilienceSum = 0;

        projects.forEach(p => {
            const txs = p.transactions || [];
            globalTxs += txs.length;
            globalResilienceSum += store.calculateResilience(p.id);

            txs.forEach(t => {
                if (t.valorCongelado !== undefined) {
                    globalValue += t.valorCongelado;
                } else {
                    const originRole = (p.roles || []).find(r => r.id === t.from);
                    if (originRole) {
                        const horas = parseFloat(t.horas) || 1;
                        globalValue += horas * originRole.multiplier * originRole.price;
                    }
                }
            });
        });

        const avgResilience = projects.length > 0 ? Math.round(globalResilienceSum / projects.length) : 0;
        const colorGlobalSalud = avgResilience > 40 ? 'var(--accent-green)' : (projects.length === 0 ? 'var(--text-muted)' : 'var(--accent-red)');

        const sectores = [
            "marketing", "Web3", "gremial", "salud", "educacion", 
            "eventos", "legal", "finanzas", "retail", "turismo"
        ];

        return `
            <div class="container">
                <header class="header-main" style="border-bottom: none; margin-bottom: 10px;">
                    <div>
                        <h1>Centro de Mando SOS</h1>
                        <p class="text-muted">Gestión de Resiliencia y Flujo de Valor Global</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="location.hash='#/about'">📖 Metodología y Ayuda</button>
                        <button class="btn btn-outline" onclick="window.location.href='./tests/run-tests.html'">🧪 Entorno Test</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px;">
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Castells Activos</div>
                        <div style="color: var(--text-heading); font-size: 2rem; font-weight: bold;">${projects.length}</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Valor Global Auditado</div>
                        <div style="color: var(--accent-green); font-size: 2rem; font-weight: bold;">${globalValue.toLocaleString()} €</div>
                    </div>
                    <div class="panel" style="border-color: ${projects.length > 0 && avgResilience < 40 ? 'var(--accent-red)' : 'var(--border-color)'}">
                        <div class="text-muted text-uppercase text-small">Resiliencia Media</div>
                        <div style="color: ${colorGlobalSalud}; font-size: 2rem; font-weight: bold;">${avgResilience}%</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Transacciones Totales</div>
                        <div style="color: var(--accent-blue); font-size: 2rem; font-weight: bold;">${globalTxs}</div>
                    </div>
                </div>

                <details class="panel" style="border-color: var(--accent-blue); background-color: rgba(88, 166, 255, 0.03); margin-bottom: 30px; cursor: pointer;">
                    <summary style="font-weight: bold; color: var(--accent-blue); font-size: 1rem; outline: none; user-select: none;">
                        ℹ️ ¿Qué es TeamTowers SOS y cómo funciona? (Haz clic para expandir/ocultar)
                    </summary>
                    <div style="margin-top: 15px; cursor: default; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid rgba(88,166,255,0.2); padding-top: 15px;">
                        <div>
                            <h4 style="color: var(--text-heading); margin-bottom: 8px; font-size: 0.9rem;">🏢 Filosofía del Sistema (SOS)</h4>
                            <p style="margin-bottom: 10px;"><b>TeamTowers System of Systems (SOS)</b> es una plataforma para mapear, auditar y optimizar ecosistemas corporativos usando la metáfora de los <i>Castells</i>.</p>
                            <p style="margin-bottom: 0;">Aquí no gestionamos "tareas", sino <b>Flujos de Valor</b>. Podrás visualizar cómo la estrategia fluye hacia la operativa y cómo la base sostiene a toda la organización. Al documentarlo, el sistema genera automáticamente un <i>Prompt Maestro</i> para entrenar IAs con la estructura exacta de tu empresa.</p>
                        </div>
                        <div>
                            <h4 style="color: var(--text-heading); margin-bottom: 8px; font-size: 0.9rem;">🚀 Pasos para empezar</h4>
                            <ul style="margin-top: 0; padding-left: 20px;">
                                <li style="margin-bottom: 6px;"><b>1. Levantar un Castell:</b> Usa el panel inferior para crear un proyecto.</li>
                                <li style="margin-bottom: 6px;"><b>2. Diseñar el Ecosistema:</b> Ajusta roles, jerarquías y finanzas.</li>
                                <li style="margin-bottom: 6px;"><b>3. Mapear el Flujo:</b> Inyecta transacciones entre los nodos.</li>
                                <li style="margin-bottom: 6px;"><b>4. Auditar en el Libro Mayor:</b> Revisa el valor generado y la resiliencia.</li>
                            </ul>
                            <div style="margin-top: 10px;">
                                <button class="btn btn-outline" onclick="location.hash='#/about'" style="font-size: 0.75rem; padding: 4px 8px;">Leer documentación completa ➔</button>
                            </div>
                        </div>
                    </div>
                </details>

                <div class="grid-layout">
                    <aside>
                        <section class="panel">
                            <h3 class="text-accent text-uppercase text-small">🚀 Levantar Nuevo Castell</h3>
                            <label class="form-label">Nombre del Ecosistema</label>
                            <input id="new-p-name" type="text" class="form-control" placeholder="Ej: Proyecto Alpha...">
                            
                            <label class="form-label">Sector Operativo (Plantilla Base)</label>
                            <select id="new-p-sector" class="form-control" style="text-transform: capitalize;">
                                ${sectores.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                            
                            <button id="btn-create-project" class="btn btn-primary btn-block" style="margin-top: 10px;">
                                Inicializar Castell
                            </button>
                        </section>
                    </aside>

                    <main>
                        <h4 class="text-muted text-uppercase" style="margin-top: 0; margin-bottom: 15px;">Proyectos Activos</h4>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${projects.length === 0 ? '<div class="panel text-center text-muted">No hay Castells levantados todavía. Utiliza el panel izquierdo para inicializar uno.</div>' : 
                                projects.map(p => {
                                    const salud = store.calculateResilience(p.id);
                                    const colorSalud = salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)';
                                    const txsCount = (p.transactions || []).length;
                                    
                                    return `
                                        <div class="card-interactive project-card" data-route="#/project/${p.id}">
                                            <div>
                                                <h3 style="margin: 0; font-size: 1.2rem;">${p.nombre}</h3>
                                                <div class="text-muted text-uppercase" style="margin-top: 4px; font-size: 0.75rem;">
                                                    Sector: <span class="text-accent" style="margin-right: 15px;">${p.sector}</span>
                                                    Flujos: <span>${txsCount}</span>
                                                </div>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 20px;">
                                                <div style="text-align: right;">
                                                    <div class="text-muted text-uppercase" style="font-size: 0.65rem;">Resiliencia</div>
                                                    <div style="color: ${colorSalud}; font-weight: bold; font-size: 1.1rem;">${salud}%</div>
                                                </div>
                                                <span class="text-muted" style="font-size: 1.5rem;">➔</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};
