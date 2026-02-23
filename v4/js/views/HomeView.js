import { store } from '../core/store.js';

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects;

        const totalLiquidez = projects.reduce((sum, p) => sum + p.transactions.reduce((s, t) => s + t.liquidación, 0), 0);
        const proyectosEnRiesgo = projects.filter(p => store.calculateResilience(p.id) < 30).length;
        const totalHoras = projects.reduce((sum, p) => sum + p.transactions.reduce((s, t) => s + t.horas, 0), 0);

        return `
            <div style="max-width: 1000px; margin: 0 auto; padding: 40px 20px;">
                
                <nav style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid #30363d; padding-bottom: 15px;">
                    <a href="#/about" style="color: #58a6ff; text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                        📖 Acerca de SOS
                    </a>
                    <a href="./tests/run-tests.html" style="color: #238636; text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; border: 1px solid #238636; padding: 4px 10px; border-radius: 4px;">
                        🧪 Suite de Validación (11/11)
                    </a>
                </nav>

                <header style="margin-bottom: 40px;">
                    <h1 style="color: #f0f6fc; font-size: 2rem; margin-bottom: 10px;">Centro de Mando SOS</h1>
                    <p style="color: #8b949e; margin: 0;">Gestión de Resiliencia y Flujos de Valor Simbióticos</p>
                </header>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
                    <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.75rem; text-transform: uppercase;">Valor Total Circulante</div>
                        <div style="color: #238636; font-size: 1.8rem; font-weight: bold; margin-top: 5px;">${totalLiquidez.toLocaleString()}€</div>
                    </div>
                    <div style="background: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.75rem; text-transform: uppercase;">Esfuerzo Acumulado</div>
                        <div style="color: #58a6ff; font-size: 1.8rem; font-weight: bold; margin-top: 5px;">${totalHoras} <small style="font-size: 1rem;">h</small></div>
                    </div>
                    <div style="background: #161b22; border: 1px solid ${proyectosEnRiesgo > 0 ? '#f85149' : '#30363d'}; padding: 20px; border-radius: 12px;">
                        <div style="color: #8b949e; font-size: 0.75rem; text-transform: uppercase;">Alertas de Resiliencia</div>
                        <div style="color: ${proyectosEnRiesgo > 0 ? '#f85149' : '#f0f6fc'}; font-size: 1.8rem; font-weight: bold; margin-top: 5px;">${proyectosEnRiesgo} <small style="font-size: 1rem;">críticas</small></div>
                    </div>
                </div>

                <section style="background: #0d1117; border: 1px solid #30363d; padding: 25px; border-radius: 12px; margin-bottom: 40px;">
                    <h3 style="color: #f0f6fc; margin-top: 0; margin-bottom: 20px; font-size: 1rem;">Levantar Nuevo Castell</h3>
                    <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr; gap: 15px;">
                        <input id="new-p-name" type="text" placeholder="Nombre del proyecto..." style="background: #161b22; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                        <select id="new-p-sector" style="background: #161b22; border: 1px solid #30363d; color: white; padding: 12px; border-radius: 6px;">
                            ${Object.keys(store.state.ontology.sectores).map(s => `<option value="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
                        </select>
                        <button onclick="window.createProject()" style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">Inicializar</button>
                    </div>
                </section>

                <h3 style="color: #f0f6fc; margin-bottom: 20px;">Ecosistema Activo</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                    ${projects.length === 0 ? '<p style="color:#484f58;">No hay castells levantados aún.</p>' : ''}
                    ${projects.map(p => {
                        const salud = store.calculateResilience(p.id);
                        const liq = p.transactions.reduce((s, t) => s + t.liquidación, 0);
                        return `
                        <div onclick="location.hash='#/project/${p.id}'" style="background: #161b22; border: 1px solid #30363d; padding: 15px 25px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                            <div style="flex: 2;">
                                <div style="color: #f0f6fc; font-weight: bold; font-size: 1.1rem;">${p.nombre}</div>
                                <div style="color: #8b949e; font-size: 0.75rem;">Sector: ${p.sector}</div>
                            </div>
                            <div style="flex: 1; text-align: center;">
                                <div style="color: #8b949e; font-size: 0.7rem;">LIQUIDEZ</div>
                                <div style="color: #f0f6fc;">${liq.toLocaleString()}€</div>
                            </div>
                            <div style="flex: 1; text-align: right;">
                                <div style="color: #8b949e; font-size: 0.7rem; margin-bottom: 5px;">RESILIENCIA</div>
                                <div style="width: 100px; height: 6px; background: #0d1117; border-radius: 3px; display: inline-block; overflow: hidden;">
                                    <div style="width: ${salud}%; height: 100%; background: ${salud < 30 ? '#f85149' : (salud < 70 ? '#d29922' : '#238636')};"></div>
                                </div>
                                <span style="font-size: 0.8rem; margin-left: 10px; color: ${salud < 30 ? '#f85149' : '#f0f6fc'};">${salud}%</span>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
};

window.createProject = () => {
    const name = document.getElementById('new-p-name').value;
    const sector = document.getElementById('new-p-sector').value;
    if (!name) return alert("Ponle un nombre al Castell");
    const id = name.toLowerCase().replace(/\s+/g, '-');
    store.dispatch({ type: 'ADD_PROJECT', payload: { id, nombre: name, sector } });
    location.hash = `#/project/${id}`;
};
