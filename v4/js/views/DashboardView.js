import { state } from '../state.js';

export const DashboardView = {
    render: () => {
        // Obtenemos los datos del estado (ahora con lógica VNA)
        const roles = state.getRoles();
        const flows = state.getFlows();
        const health = state.getNetworkHealth();

        // Cálculo de métricas rápidas
        const tangiblesCount = flows.filter(f => f.type === 'tangible').length;
        const intangiblesCount = flows.filter(f => f.type === 'intangible').length;

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🚀 TeamTowers SOS: Dashboard</h1>
                        <p class="text-muted">Sistema de Gestión Basado en Redes de Valor</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="location.hash='#/map'">Abrir Mapa VNA</button>
                        <button class="btn btn-secondary" onclick="location.hash='#/about'">Metodología</button>
                    </div>
                </header>

                <section class="panel" style="border-left: 4px solid var(--accent-purple); background: rgba(163, 113, 247, 0.05); margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0; color: var(--accent-purple); display: flex; align-items: center; gap: 8px;">
                                📈 Diagnóstico de Red de Valor
                            </h3>
                            <p class="text-small text-muted" style="margin: 5px 0 0 0;">Análisis basado en la conversión de activos tangibles e intangibles.</p>
                        </div>
                        <span class="badge" style="background: var(--accent-purple); color: white;">VNA Active</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div class="panel-surface" style="border-top: 2px solid var(--accent-blue);">
                            <b style="display: block; font-size: 0.65rem; color: var(--text-muted); text-uppercase; letter-spacing: 0.5px;">Agentes de Conversión</b>
                            <div style="font-size: 1.4rem; font-weight: bold; margin: 5px 0;">${roles.length} Roles</div>
                            <p class="text-small text-muted">Cada nodo (@anxaneta, @baixos, etc.) procesa conocimiento en entregables.</p>
                        </div>

                        <div class="panel-surface" style="border-top: 2px solid var(--accent-green);">
                            <b style="display: block; font-size: 0.65rem; color: var(--text-muted); text-uppercase; letter-spacing: 0.5px;">Dualidad de Flujo</b>
                            <div style="font-size: 1.1rem; font-weight: bold; margin: 5px 0;">
                                <span title="Tangibles" style="color: var(--accent-blue);">${tangiblesCount} T</span> / 
                                <span title="Intangibles" style="color: var(--accent-purple);">${intangiblesCount} I</span>
                            </div>
                            <p class="text-small text-muted">Distinción técnica entre contratos (Azul) y conocimiento (Violeta).</p>
                        </div>

                        <div class="panel-surface" style="border-top: 2px solid #d29922;">
                            <b style="display: block; font-size: 0.65rem; color: var(--text-muted); text-uppercase; letter-spacing: 0.5px;">Salud de la Red</b>
                            <div style="font-size: 1.4rem; font-weight: bold; margin: 5px 0; color: ${health.ratio > 30 ? 'var(--accent-green)' : '#d29922'};">
                                ${health.ratio}% <span style="font-size: 0.8rem; font-weight: normal;">Ratio I/T</span>
                            </div>
                            <p class="text-small text-muted">Estado: <b>${health.balance}</b>. Mide la reciprocidad y vitalidad del ecosistema.</p>
                        </div>
                    </div>
                </section>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr;">
                    <main>
                        <div class="panel">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h3 style="margin:0;">Proyectos en el Ecosistema</h3>
                                <button class="btn btn-outline btn-small">+ Nuevo Proyecto</button>
                            </div>
                            
                            <div class="list-group">
                                <div class="list-item" onclick="location.hash='#/project/p1'" style="cursor: pointer;">
                                    <div>
                                        <b style="display: block;">Core Platform v4</b>
                                        <span class="text-small text-muted">${roles.length} roles activos • ${flows.length} flujos de valor</span>
                                    </div>
                                    <div style="text-align: right;">
                                        <div class="text-accent" style="font-weight: bold;">Activo</div>
                                        <div class="text-small text-muted">Resiliencia: 84%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel" style="background: linear-gradient(135deg, var(--bg-panel) 0%, rgba(163, 113, 247, 0.1) 100%);">
                            <h4 style="margin-top: 0; color: var(--accent-purple);">🤖 Consultoría IA</h4>
                            <p class="text-small text-muted">La IA está analizando tu <b>Red de Valor</b> basándose en Verna Allee.</p>
                            <div style="background: var(--bg-surface); padding: 10px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-color);">
                                "Detecto una baja tasa de flujos intangibles entre @dosos y @baixos. Riesgo de silos de conocimiento."
                            </div>
                        </div>

                        <div class="panel">
                            <h4>Accesos Rápidos</h4>
                            <div style="display: grid; gap: 10px;">
                                <button class="btn btn-secondary btn-block" onclick="location.hash='#/accounting/p1'">💰 Libro Mayor</button>
                                <button class="btn btn-secondary btn-block" onclick="location.hash='#/about'">📖 Guía SOS</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }
};
