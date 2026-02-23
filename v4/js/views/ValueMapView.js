// v4/js/views/ValueMapView.js
import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project || !project.transactions.length) {
            return `<p style="text-align:center; color:#64748b;">Esperando flujos de valor...</p>`;
        }

        return `
            <div class="value-map-container" style="position:relative; height:400px; background:#000; border-radius:12px; overflow:hidden; border: 1px dashed #334155;">
                <div style="position:absolute; top:10px; left:10px; color:#4ade80; font-size:0.7rem; font-family:monospace;">// VNA_LIVE_STREAM</div>
                
                <div class="bubbles-stage" style="display:flex; align-items:center; justify-content:center; height:100%; gap:20px; flex-wrap:wrap; padding:20px;">
                    ${project.transactions.map(tx => {
                        // El tamaño depende de las Unidades de Valor (UV)
                        const size = Math.max(60, Math.min(150, tx.uv / 2)); 
                        // El color depende de la categoría
                        const color = tx.tipo_valor === 'intangible' ? '#8b5cf6' : '#3b82f6';
                        
                        return `
                            <div class="value-bubble" style="
                                width:${size}px; 
                                height:${size}px; 
                                background:${color}22; 
                                border: 2px solid ${color}; 
                                border-radius:50%; 
                                display:flex; 
                                flex-direction:column;
                                align-items:center; 
                                justify-content:center; 
                                text-align:center;
                                cursor:pointer;
                                transition: transform 0.3s ease;
                                animation: float ${3 + Math.random()*2}s ease-in-out infinite;
                            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                <span style="font-size:0.6rem; color:${color}; font-weight:bold;">${tx.categoria}</span>
                                <span style="font-size:0.7rem; color:white; padding:0 5px;">${tx.concepto}</span>
                                <span style="font-size:0.8rem; font-weight:bold; color:${color};">${tx.liquidación}€</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <style>
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            </style>
        `;
    }
};
