import { store } from '../core/store.js';
import { Selectors } from '../core/selectors.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        // Buscamos el proyecto o creamos uno genérico si no existe
        let project = state.projects.find(p => p.id === projectId);
        
        if (!project) {
            return `
                <div class="sos-terminal">
                    <h2>⚠️ Proyecto no encontrado</h2>
                    <p>No se ha podido localizar el ID: ${projectId}</p>
                    <button onclick="location.href='index.html'">Volver</button>
                </div>
            `;
        }

        const health = Selectors.getProjectResilienceIndex(state, projectId);

        return `
            <div class="project-view">
                <header class="project-header">
                    <div>
                        <h1>${project.nombre}</h1>
                        <small>ID: ${project.id} | Protocolo SOS v1.0</small>
                    </div>
                    <div class="health-badge ${health.status}">
                        RESILIENCIA: ${health.status.toUpperCase()} (${(health.ratio * 100).toFixed(0)}%)
                    </div>
                </header>

                <div class="canvas-area">
                    <p>[ Agile Canvas: Visualización de Roles FEVS en desarrollo ]</p>
                </div>

                <div class="sos-terminal">
                    <h3>🛰️ SOS Terminal: Entrada de Valor</h3>
                    <p>Describe tu aportación para liquidar el Meme de Conocimiento:</p>
                    <textarea id="ai-input" placeholder="Ej: He coordinado la reunión técnica del Tronc Superior durante 2h #coordinar"></textarea>
                    
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button id="btn-liquidar">Liquidar en Red de Valor</button>
                        <span style="font-size: 0.8rem; color: #64748b;">La IA procesará la ontología FEVS</span>
                    </div>
                </div>

                <div class="ledger-preview" style="margin-top:2rem;">
                    <h3>📑 Últimas Transacciones</h3>
                    <ul style="list-style:none; padding:0;">
                        ${(project.transactions || []).slice(-3).reverse().map(tx => `
                            <li style="background:#1e293b; padding:10px; margin-bottom:5px; border-radius:4px; font-size:0.9rem;">
                                <b>${tx.categoria}</b>: ${tx.concepto} - <strong>${tx.liquidación.toFixed(2)}€</strong>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
};
