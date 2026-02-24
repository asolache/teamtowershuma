import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        const roles = state.getRoles();
        const flows = state.getFlows();

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🗺️ Mapa de Red de Valor (VNA)</h1>
                        <p class="text-muted">Basado en la metodología de Verna Allee: Conversión de Activos Tangibles e Intangibles.</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="window.dispatchEvent(new CustomEvent('open-modal-flow'))">+ Inyectar Valor</button>
                        <button class="btn btn-secondary" onclick="location.hash='#/'">Volver</button>
                    </div>
                </header>

                <div class="grid-vna">
                    <aside class="panel">
                        <h3>Indicadores de Red</h3>
                        <div class="panel-surface" style="margin-bottom: 15px;">
                            <div class="text-small text-muted">Análisis de Intercambio:</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-blue);">
                                ${flows.filter(f => f.type === 'tangible').length} Tangibles / 
                                <span style="color: var(--accent-purple);">${flows.filter(f => f.type === 'intangible').length} Intangibles</span>
                            </div>
                            <p class="text-small text-muted" style="margin-top: 5px;">
                                *El éxito depende de la eficiencia en convertir activos en valor negociable.
                            </p>
                        </div>
                        
                        <div class="legend">
                            <div class="legend-item">
                                <span class="dot" style="background: var(--accent-blue);"></span>
                                <span><b>Tangible:</b> Contractual / Ingresos</span>
                            </div>
                            <div class="legend-item">
                                <span class="dot" style="background: var(--accent-purple);"></span>
                                <span><b>Intangible:</b> Conocimiento / Beneficios</span>
                            </div>
                        </div>
                    </aside>

                    <section class="panel canvas-container">
                        <div id="vna-canvas" class="vna-canvas">
                            ${roles.map((role, index) => `
                                <div class="role-node" style="top: ${50 + (index * 80)}px; left: ${100 + (index * 50)}px;">
                                    <div class="role-icon">${role.icon || '👤'}</div>
                                    <div class="role-label">${role.handle}</div>
                                    <div class="role-type">${role.level}</div>
                                </div>
                            `).join('')}
                            
                            <svg class="vna-lines">
                                </svg>
                        </div>
                    </section>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        console.log("ValueMapView: Analizando patrones de reciprocidad y nodos de conversión...");
        // Aquí iría la lógica D3.js o similar para unir los nodos
    }
};
